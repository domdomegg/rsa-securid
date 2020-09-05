import { aes128ECBEncrypt } from './aes';
import { dateBCD } from './bcd';
import { Token, Code } from './index'

export const computeCode = (token: Token, pin?: string | number, date: Date = new Date()): Code => {
    if (!pin && token.flags.pinIsRequired) throw new Error('Missing pin')
    if (!token.decryptedSeed) throw new Error('Token not decrypted')
    
    // Drop necessary trailing digits on minute
    const date2 = new Date(date);
    date2.setUTCMinutes(date2.getUTCMinutes() & (~(token.intervalInSeconds == 60 ? 0x03 : 0x01)));
    // Store as packed BCD
    const time = dateBCD(date2);
    
    let key0: Buffer;
    let key1: Buffer;

    key0 = keyFromBcdTime(token, time, 2);
    key0 = aes128ECBEncrypt(token.decryptedSeed, key0);

    key1 = keyFromBcdTime(token, time, 3);
    key1 = aes128ECBEncrypt(key0, key1);

    key0 = keyFromBcdTime(token, time, 4);
    key0 = aes128ECBEncrypt(key1, key0);

    key1 = keyFromBcdTime(token, time, 5);
    key1 = aes128ECBEncrypt(key0, key1);

    key0 = keyFromBcdTime(token, time, 8);
    key0 = aes128ECBEncrypt(key1, key0);

    // key0 now contains 4 consecutive token codes; get the index for the correct code
    let idx = 0;
    if (token.intervalInSeconds == 30) {
        idx = ((date.getUTCMinutes() & 0x01) << 3) | ((date.getUTCSeconds() >= 30 ? 1 : 0) << 2);        
    } else if (token.intervalInSeconds == 60) {
        idx = (date.getUTCMinutes() & 0x03) << 2;
    } else {
        throw new Error('Invalid interval');
    }
        
    let code = key0.readUInt32BE(idx).toString();

    if (code.length > token.digits)
        code = code.substr(-token.digits);

    if (pin) {
        pin = pin.toString();
        const unchangedPrefixLength = code.length - pin.length;
        let s = code.substr(0, unchangedPrefixLength);
        for (let i = 0; i < pin.length; i++) {
            s += (code.charCodeAt(i + unchangedPrefixLength) - 48 + pin.charCodeAt(i) - 48) % 10
        }
        code = s;
    }

    const validFrom = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), token.intervalInSeconds == 30 && date.getSeconds() >= 30 ? 30 : 0);
    const expiresAt = new Date(validFrom);
    expiresAt.setSeconds(expiresAt.getSeconds() + token.intervalInSeconds);
    return {
        validFrom,
        expiresAt,
        code
    };
}
export default computeCode;

const keyFromBcdTime = (token: Token, timeBcd: Buffer, byteCount: number) => {
    // initialize with 0
    let key = Buffer.alloc(16, 0);
    
    // copy byteCount bytes of timeBcd to the key
    timeBcd.copy(key, 0, 0, byteCount);
    key = key.fill(0xAA, byteCount, 8);

    // convert the 5th-12th digits of the serial number to packed BCD, 
    // and copy to bytes 8-11 of the key
    let keyIdx = 8;
    for (let i = 4; i < 12; i += 2, keyIdx++)
        key[keyIdx] = (parseInt(token.serial[i]) << 4) | parseInt(token.serial[i + 1]);

    // fill rest of the key with 0xBB
    key.fill(0xBB, 12);

    return key;
}