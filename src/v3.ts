import { sha256Hash, sha256Hmac, aes256CBCDecrypt, PBKDF2Sha256 } from './aes';
import { convertV3TokenDate } from './date';
import { Token } from './index';
import { computeCode } from './code';

export const v3 = (rawToken: string, password: string = '', deviceId: string = ''): Token => decrypt(parse(rawToken), password, deviceId);
export default v3;

const decrypt = (token: any, password: string = '', deviceId: string = ''): Token => {
    if (!password && token.flags.passwordIsRequired) throw new Error('Missing password');
    if (!deviceId && token.flags.deviceIdIsRequired) throw new Error('Missing deviceId');

    let hash = computeHash('', deviceId, token._nonce);
    if (hash.compare(token._nonce_devid_hash) != 0) throw new Error('Mismatching _nonce_devid_hash');

    hash = computeHash(password, deviceId, token._nonce);
    if (hash.compare(token._nonce_devid_pass_hash) != 0) throw new Error('Mismatching _nonce_devid_pass_hash');

    const hmacKey = deriveKey(password, deviceId, token._nonce, 0);
    
    hash = sha256Hmac(hmacKey, toBytes(token, false));
    if (hash.compare(token._mac) != 0) throw new Error('Mismatching _mac');

    hash = deriveKey(password, deviceId, token._nonce, 1);
    let payload = aes256CBCDecrypt(hash.slice(0, 32), token._enc_payload, token._nonce);
    if (payload.length < 160) throw new Error('Payload too short');

    let payloadIndex = 0;

    token.serial = payload.toString('utf8', payloadIndex, 12).trim();
    payloadIndex += 16;

    token.decryptedSeed = payload.slice(payloadIndex, payloadIndex + 16);
    payloadIndex += 18;

    const flags: any = token.flags;

    flags.mode = payload[payloadIndex++] > 0;

    token.digits = payload[payloadIndex++];

    flags.pinIsRequired = payload[payloadIndex++] != 0x1f;

    if (payload[payloadIndex] != 30 && payload[payloadIndex] != 60) throw new Error('Invalid interval') 
    token.intervalInSeconds = payload[payloadIndex++] == 30 ? 30 : 60;

    payloadIndex += 2;

    token.createdAt = convertV3TokenDate(payload.slice(payloadIndex, payloadIndex + 5));
    payloadIndex += 8;

    token.expiresAt = convertV3TokenDate(payload.slice(payloadIndex, payloadIndex + 5));

    flags.usesAppDerivedSeeds = true;
    flags.usesTimeDerivedSeeds = false;
    flags.keyIs128Bit = true;

    token.computeCode = computeCode.bind(null, token);
    return token;
}

const parse = (rawToken: string) => {
    const token = decodeURIComponent(rawToken.split('ctfData=')[1]);

    const data = Buffer.from(token, 'base64');
    if (data.length < 291) throw new Error('Token too short');
    
    let dataIndex = 0;
    const version = data[dataIndex++];
    if (version != 3) throw new Error('Expected token version 3 but got ' + version);

    const flags: any = {};
    flags.passwordIsRequired = (data[dataIndex++] > 0);
    flags.deviceIdIsRequired = (data[dataIndex++] > 0);

    let _nonce_devid_hash = data.slice(dataIndex, dataIndex + 32);
    dataIndex += 32;

    let _nonce_devid_pass_hash = data.slice(dataIndex, dataIndex + 32);
    dataIndex += 32;

    let _nonce = data.slice(dataIndex, dataIndex + 16);
    dataIndex += 16;

    let _enc_payload = data.slice(dataIndex, dataIndex + 176);
    dataIndex += 176;

    let _mac = data.slice(dataIndex, dataIndex + 32);

    return {
        version,
        _nonce_devid_hash,
        _nonce_devid_pass_hash,
        _nonce,
        _enc_payload,
        _mac,
        flags
    }
}

const computeHash = (password: string = '', deviceId: string = '', salt: Buffer) => {
    if (!salt) throw new Error('Missing salt');
    
    const hash_buf = Buffer.alloc(salt.length + 48 + password.length, 0);
    
    salt.copy(hash_buf, 0, 0, salt.length);
    
    if (deviceId) hash_buf.write(deviceId, salt.length, 48);
    if (password) hash_buf.write(password, salt.length + 48, password.length);

    return sha256Hash(hash_buf);
}

const toBytes = (token: any, includeMac: boolean) => {
    let iPos = 0;
    const tokenBytes = Buffer.alloc(3 + token._nonce_devid_hash.length + token._nonce_devid_pass_hash.length + token._nonce.length + token._enc_payload.length + (includeMac ? token._mac.length : 0));
    tokenBytes[iPos++] = token.version;
    tokenBytes[iPos++] = token.flags.passwordIsRequired ? 1 : 0;
    tokenBytes[iPos++] = token.flags.deviceIdIsRequired ? 1 : 0;

    token._nonce_devid_hash.copy(tokenBytes, iPos, 0, token._nonce_devid_hash.length);
    iPos += token._nonce_devid_hash.length;

    token._nonce_devid_pass_hash.copy(tokenBytes, iPos, 0, token._nonce_devid_pass_hash.length);
    iPos += token._nonce_devid_pass_hash.length;

    token._nonce.copy(tokenBytes, iPos, 0, token._nonce.length);
    iPos += token._nonce.length;

    token._enc_payload.copy(tokenBytes, iPos, 0, token._enc_payload.length);
    iPos += token._enc_payload.length;

    if (includeMac) {
        token._mac.copy(tokenBytes, iPos, 0, token._mac.length);
        iPos += token._mac.length;
    }

    return tokenBytes;
}

const deriveKey = (pass: string = '', devid: string = '', salt: Buffer, keyId: 0 | 1) => {
    if (keyId < 0 || keyId > 1) throw new Error("keyId must be 0 or 1.");
    if (!salt) throw new Error('Missing salt');

    let i;
    const key0 = [ 0xd0, 0x14, 0x43, 0x3c, 0x6d, 0x17, 0x9f, 0xeb, 0xda, 0x09, 0xab, 0xfc, 0x32, 0x49, 0x63, 0x4c ];
    const key1 = [ 0x3b, 0xaf, 0xff, 0x4d, 0x91, 0x8d, 0x89, 0xb6, 0x81, 0x60, 0xde, 0x44, 0x4e, 0x05, 0xc0, 0xdd ];
    const key = Buffer.from((keyId > 0) ? key1 : key0);

    const buf0 = Buffer.alloc(48 + key.length + salt.length + pass.length, 0);
    const buf1 = Buffer.alloc(buf0.length / 2);

    if (pass) buf0.write(pass);

    if (devid.length > 0) buf0.write(devid, pass.length, 48);

    key.copy(buf0, pass.length + 48, 0, key.length);
    salt.copy(buf0, pass.length + 48 + key.length, 0, salt.length);

    // PBKDF2 password is "every 2nd byte of the input"
    for (i = 1; i < buf0.length; i += 2)
        buf1[i >> 1] = buf0[i];

    return PBKDF2Sha256(32, buf1, salt, 1000);
}