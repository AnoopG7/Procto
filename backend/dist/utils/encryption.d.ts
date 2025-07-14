export interface EncryptedData {
    encryptedData: string;
    iv: string;
    authTag: string;
}
export declare const encrypt: (text: string) => EncryptedData;
export declare const decrypt: (encryptedData: EncryptedData) => string;
export declare const hashPassword: (password: string) => string;
export declare const verifyPassword: (password: string, hashedPassword: string) => boolean;
export declare const generateSecureToken: (length?: number) => string;
export declare const encryptProctoringLog: (log: any) => string;
export declare const decryptProctoringLog: (encryptedLog: string) => any;
//# sourceMappingURL=encryption.d.ts.map