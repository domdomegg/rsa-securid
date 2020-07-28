import crypto from 'crypto';

// Computes short MAC for given data
export const computeShortMac = (data: string | Buffer) => {
    const mac = computeMac(Buffer.from(data))
    return (mac[0] << 7) | (mac[1] >> 1)
}

export const computeMac = (data: Buffer) => {
    /* handle the bulk of the input data here */
    let dataIndex: number, odd = true, work = Buffer.alloc(16, 0xff);
    for (dataIndex = 0; dataIndex < data.length; dataIndex += 16, odd = !odd) {
        work = aesEcbEncryptThenXor(data, work, dataIndex);
    }

    /* hash an extra block of zeros, for certain input lengths */
    if (odd) {
        work = aesEcbEncryptThenXor(Buffer.alloc(16, 0), work);
    }
    
    /* always hash the padding */
    const padding = Buffer.alloc(16, 0)
    for (let i = data.length * 8, paddingIndex = padding.length - 1; i > 0 && paddingIndex >= 0; i >>= 8, paddingIndex--) {
        padding[paddingIndex] = i;
    }
    work = aesEcbEncryptThenXor(padding, work);

    /* run hash over current hash value */
    return aesEcbEncryptThenXor(work, work);
}

export const aesEcbEncryptThenXor = (rawKey: Buffer, data: Buffer, offset = 0) => {
    let key: Buffer;
    if (offset > 0 || rawKey.length != 16) {
        key = Buffer.alloc(16, 0);
        rawKey.copy(key, 0, offset)
    } else {
        key = rawKey;
    }
    
    return xor(data, aes128ECBEncrypt(key, data));
}

const xor = (a: Buffer, b: Buffer) => {
    const c = Buffer.from(a);
    for (let i = 0; i < a.length && i < b.length; i++)
        c[i] ^= b[i];
    return c;
}

export const aes128ECBEncrypt = (key: Buffer, data: Buffer) => crypto.createCipheriv('aes-128-ecb', key, '').setAutoPadding(false).update(data);
export const aes128ECBDecrypt = (key: Buffer, data: Buffer) => crypto.createDecipheriv('aes-128-ecb', key, '').setAutoPadding(false).update(data);

export const aes256CBCEncrypt = (key: Buffer, data: Buffer, iv: Buffer) => crypto.createCipheriv('aes-256-cbc', key, iv).setAutoPadding(false).update(data);
export const aes256CBCDecrypt = (key: Buffer, data: Buffer, iv: Buffer) => crypto.createDecipheriv('aes-256-cbc', key, iv).setAutoPadding(false).update(data);

export const sha256Hash = (data: Buffer) => crypto.createHash('sha256').update(data).digest();
export const sha256Hmac = (key: Buffer, data: Buffer) => crypto.createHmac('sha256', key).update(data).digest();

export const PBKDF2Sha256 = (dklen: number, password: Buffer, salt: Buffer, iterationCount: number) => crypto.pbkdf2Sync(password, salt, iterationCount, dklen, 'sha256');