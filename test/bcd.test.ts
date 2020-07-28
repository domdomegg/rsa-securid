import { dateBCD, intBCD } from '../src/bcd'

describe('dateBCD', () => {
    it('ignores seconds', () => {
        expect(dateBCD(new Date(Date.UTC(2020, 1, 1, 1, 1, 1, 1)))).toEqual(dateBCD(new Date(Date.UTC(2020, 1, 1, 1, 1))));
    });

    it('calculates examples correctly', () => {
        expect(dateBCD(new Date(Date.UTC(2020, 6, 14, 17, 42)))).toEqual(Buffer.from([0x20, 0x20, 0x7, 0x14, 0x17, 0x42]));
        expect(dateBCD(new Date(Date.UTC(2120, 6, 14, 17, 42)))).toEqual(Buffer.from([0x21, 0x20, 0x7, 0x14, 0x17, 0x42]));
        expect(dateBCD(new Date(Date.UTC(2021, 6, 14, 17, 42)))).toEqual(Buffer.from([0x20, 0x21, 0x7, 0x14, 0x17, 0x42]));
        expect(dateBCD(new Date(Date.UTC(2020, 7, 14, 17, 42)))).toEqual(Buffer.from([0x20, 0x20, 0x8, 0x14, 0x17, 0x42]));
        expect(dateBCD(new Date(Date.UTC(2020, 6, 15, 17, 42)))).toEqual(Buffer.from([0x20, 0x20, 0x7, 0x15, 0x17, 0x42]));
        expect(dateBCD(new Date(Date.UTC(2020, 6, 14, 18, 42)))).toEqual(Buffer.from([0x20, 0x20, 0x7, 0x14, 0x18, 0x42]));
        expect(dateBCD(new Date(Date.UTC(2020, 6, 14, 17, 43)))).toEqual(Buffer.from([0x20, 0x20, 0x7, 0x14, 0x17, 0x43]));
    });
});

describe('intBCD', () => {
    it('handles numbers', () => {
        expect(intBCD(0)).toEqual(Buffer.from([0]));
        expect(intBCD(1)).toEqual(Buffer.from([1]));
        expect(intBCD(10)).toEqual(Buffer.from([0x10]));
        expect(intBCD(16)).toEqual(Buffer.from([0x16]));
        expect(intBCD(17)).toEqual(Buffer.from([0x17]));
        expect(intBCD(99)).toEqual(Buffer.from([0x99]));
        expect(intBCD(100)).toEqual(Buffer.from([0x1, 0x00]));
        expect(intBCD(1000)).toEqual(Buffer.from([0x10, 0x00]));
        expect(intBCD(9999)).toEqual(Buffer.from([0x99, 0x99]));
        expect(intBCD(1e10)).toEqual(Buffer.from([0x1, 0x00, 0x00, 0x00, 0x00, 0x00]));
        expect(intBCD(1e20)).toEqual(Buffer.from([0x1, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
    });
});