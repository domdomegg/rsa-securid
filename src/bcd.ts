/** Converts a JavaScript Date to YYYYMMDDHHmm in BCD 8421 format, stored in a 6 byte buffer */
export const dateBCD = (date: Date) => {
    const bcd = Buffer.alloc(6, 0);

    intBCD(date.getUTCFullYear()).copy(bcd, 0, 0, 2);

    bcd[2] = intBCD(date.getUTCMonth() + 1)[0];
    bcd[3] = intBCD(date.getUTCDate())[0];
    bcd[4] = intBCD(date.getUTCHours())[0];
    bcd[5] = intBCD(date.getUTCMinutes())[0];

    return bcd;
}

/** Converts a JavaScript number to BCD 8421 format, stored in an appropriate length buffer */
export const intBCD = (int: number) => {
    const byteCount = (int == 0) ? 1 : Math.ceil(Math.floor(Math.log10(int) + 1) / 2);
    const bcd = Buffer.alloc(byteCount);

    for (let i = byteCount - 1; i >= 0; i--) {
        bcd[i] = (int % 10);
        int /= 10;
        bcd[i] |= ((int % 10) << 4);
        int /= 10;
    }

    return bcd;
}
