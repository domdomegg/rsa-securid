export const parseSecurIdDate = (securIdDate: number) => {
    const d = new Date(2000, 0, 1, 0, 0, 0, 0);
    d.setUTCDate(d.getDate() + securIdDate);
    return d;
}

export const convertV3TokenDate = (v3date: Buffer) => {
    if (!v3date) throw new Error('Missing v3date');
    if (v3date.length != 5) throw new Error('v3date should be of length 5');

    const seconds = Math.round(
        v3date.readUInt32BE(1) / 3.90625
        + ((v3date[0] << 24) / 3.90625)
        * (1 << 8)
    );

    // In v3 tokens, the date is a count of "v3 ticks" since 1970-01-01. 
    // There are 337500 v3 ticks per day, or 3.90625 v3 ticks per second
    return new Date(seconds * 1000);
}