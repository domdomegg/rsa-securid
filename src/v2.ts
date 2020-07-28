import { computeShortMac, computeMac, aes128ECBDecrypt } from './aes';
import { parseSecurIdDate } from './date';
import { Token } from './index';
import { computeCode } from './code';

export const v2 = (rawToken: string, password: string = '', deviceId: string = ''): Token => decrypt(parse(rawToken), password, deviceId);
export default v2;

const decrypt = (token: any, password: string = '', deviceId: string = ''): Token => {
    if (!password && token.flags.passwordIsRequired) throw new Error('Missing password')
    if (!deviceId && token.flags.deviceIdIsRequired) throw new Error('Missing deviceId')

    const { key, deviceIdHash } = getEncryptionKey(token, password, deviceId);

    if (token.flags.deviceIdIsRequired && deviceIdHash != token.deviceIdHash) throw new Error('Mismatching deviceIdHash');

    token.decryptedSeed = aes128ECBDecrypt(key, token.encryptedSeed);
    const computed_mac = computeShortMac(token.decryptedSeed.slice(0, 16));

    if (computed_mac != token.decryptedSeedHash) throw new Error('Mismatcing decryptedSeedHash');

    token.computeCode = computeCode.bind(null, token);
    return token;
}

const getEncryptionKey = (token: any, password: string = '', deviceId: string = '', isSmartPhone: boolean = true) => {
    const magic = Buffer.from([ 0xd8, 0xf5, 0x32, 0x53, 0x82, 0x89 ]);
    const key = Buffer.alloc(password.length + deviceId.length + magic.length, 0);

    let pos = 0;
    if (password) {
        key.write(password)
        pos += password.length;
    }

    let deviceIdHash = undefined;
    if (deviceId) {
        /*
         * For iPhone/Android ctf strings, the device ID takes up
         * 40 bytes and consists of hex digits + zero padding.
         *
         * For other ctf strings (e.g. --blocks), the device ID takes
         * up 32 bytes and consists of decimal digits + zero padding.
         *
         * If this seed isn't locked to a device, we'll just hash
         * 40 (or 32) zero bytes, below.
         */
        const deviceIdLength = isSmartPhone ? 40 : 32;
        if (deviceId.length > 0 && deviceId.length != deviceIdLength)
            throw new Error("Expected device ID of length 0 or " + deviceIdLength + ", but got " + deviceId.length);

        const deviceIdClean = (token.version >= 2 ? deviceId.replace(/[^0-9a-fA-F]/g, '') : deviceId.replace(/\D/g, '')).toUpperCase();
        key.write(deviceIdClean)
        deviceIdHash = computeShortMac(key.slice(0, pos));
        pos += deviceIdClean.length;
    }

    magic.copy(key, pos)
    pos += magic.length;

    return {
        key: computeMac(key.slice(0, pos)),
        deviceIdHash
    }
}

const parse = (rawToken: string) => {
    if (typeof rawToken != "string") throw new Error('Token must be a string') 
    if (!rawToken) throw new Error('Falsy token not allowed')

    const token = rawToken.replace(/\D/g, '');

    if (token.length < 81) throw new Error('Token too short')
    if (token.length > 85) throw new Error('Token too long')

    if (bits(token.slice(-5)) != computeShortMac(token.slice(0, -5))) throw new Error('Bad checksum');

    const version = token.charCodeAt(0) - 48;
    const serial = token.substr(1, 12);
    const flags: any = {};

    const encryptedSeed = binaryToBuffer(bitsString(token, 39, 167));

    const flagBits = bits(token, 167, 183);
    const intervalInSeconds = (flagBits & 0x03) != 0 ? 60 : 30; // Bit 0-1 (0x03)
                                                                // Bit 2 (0x04) is ignored
    flags.pinIsLocal = ((flagBits & 0x08) != 0);                // Bit 3 (0x08)
    flags.pinIsRequired = ((flagBits & 0x10) != 0);             // Bit 4 (0x10)
                                                                // Bit 5 (0x20) is ignored
    const digits = ((flagBits & 0x1C0) >> 6) + 1;               // Bit 6-8 (0x1C0)
    flags.usesTimeDerivedSeeds = ((flagBits & 0x200) != 0);     // Bit 9 (0x200)
    flags.mode = ((flagBits & 0x400) != 0);                     // Bit 10 (0x400)
    flags.usesAppDerivedSeeds = ((flagBits & 0x800) != 0);      // Bit 11 (0x800)
    flags.deviceIdIsRequired = ((flagBits & 0x1000) != 0);      // Bit 12 (0x1000)
    flags.passwordIsRequired = ((flagBits & 0x2000) != 0);      // Bit 13 (0x2000)
    flags.keyIs128Bit = ((flagBits & 0x4000) != 0);             // Bit 14 (0x4000)

    const expiresAt = parseSecurIdDate(bits(token, 183, 197));
    const decryptedSeedHash = bits(token, 198, 213);
    const deviceIdHash = bits(token, 213, 228);

    return {
        version,
        serial,
        deviceIdHash,
        encryptedSeed,
        decryptedSeedHash,
        digits,
        intervalInSeconds,
        expiresAt,
        flags
    }
}

const binaryToBuffer = (binaryStr: string) => {
    if (binaryStr.length % 8 != 0) throw new Error('Binary string length must be multiple of 8')

    const b = Buffer.alloc(binaryStr.length / 8);
    for (let i = 0; i < binaryStr.length; i += 8) {
        b[i / 8] = parseInt(binaryStr.substr(i, 8), 2);
    }

    return b;
}

// Converts string of decimals to binary, 3 bits per digit, as a number
const bits = (str: string, start: number = 0, end: number = str.length * 3) => parseInt(bitsString(str, start, end), 2);

// Converts string of decimals to binary, 3 bits per digit, as binary string
const bitsString = (str: string, start: number = 0, end: number = str.length * 3) => {
    let s = '';
    for (let i = Math.floor(start/3); i < end / 3; i++) {
        let v = str.charCodeAt(i) - 48;
        if (v > 7) v = v - 8;
        if (v < 4) s += '0';
        if (v < 2) s += '0';
        s += v.toString(2);
    }
    return s.substr(start % 3, end - start)
}

