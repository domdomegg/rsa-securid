import v2 from './v2'
import v3 from './v3'
import deviceId from './deviceId';
export { v2, v3, deviceId };

export interface Token {
    version: 2 | 3,
    serial: string,
    digits: number
    intervalInSeconds: 30 | 60,
    expiresAt: Date,
    decryptedSeed: Buffer,
    flags: {
        mode: boolean,
        pinIsRequired: boolean,
        passwordIsRequired: boolean,
        deviceIdIsRequired: boolean,
        usesAppDerivedSeeds: boolean,
        usesTimeDerivedSeeds: boolean,
        keyIs128Bit: boolean
    },
    /**
     * Computes a code for this token
     * @param pin The pin to use to generate the code
     * @param date The instant to generate the token for
     * @returns Object containg code details
     */
    computeCode: (pin?: string | number, date?: Date) => Code
}

export interface Code {
    validFrom: Date,
    expiresAt: Date,
    code: string
}