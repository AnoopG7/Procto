"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptProctoringLog = exports.encryptProctoringLog = exports.generateSecureToken = exports.verifyPassword = exports.hashPassword = exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : crypto_1.default.randomBytes(32);
const IV_LENGTH = 16;
const encrypt = (text) => {
    try {
        const iv = crypto_1.default.randomBytes(IV_LENGTH);
        const cipher = crypto_1.default.createCipheriv(ALGORITHM, SECRET_KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return {
            encryptedData: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }
    catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};
exports.encrypt = encrypt;
const decrypt = (encryptedData) => {
    try {
        const { encryptedData: data, iv, authTag } = encryptedData;
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, SECRET_KEY, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};
exports.decrypt = decrypt;
const hashPassword = (password) => {
    const salt = crypto_1.default.randomBytes(16).toString('hex');
    const hash = crypto_1.default.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};
exports.hashPassword = hashPassword;
const verifyPassword = (password, hashedPassword) => {
    try {
        const [salt, hash] = hashedPassword.split(':');
        const verifyHash = crypto_1.default.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return hash === verifyHash;
    }
    catch (error) {
        return false;
    }
};
exports.verifyPassword = verifyPassword;
const generateSecureToken = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString('hex');
};
exports.generateSecureToken = generateSecureToken;
const encryptProctoringLog = (log) => {
    const logString = JSON.stringify(log);
    const encrypted = (0, exports.encrypt)(logString);
    return JSON.stringify(encrypted);
};
exports.encryptProctoringLog = encryptProctoringLog;
const decryptProctoringLog = (encryptedLog) => {
    try {
        const encryptedData = JSON.parse(encryptedLog);
        const decryptedString = (0, exports.decrypt)(encryptedData);
        return JSON.parse(decryptedString);
    }
    catch (error) {
        console.error('Failed to decrypt proctoring log:', error);
        return null;
    }
};
exports.decryptProctoringLog = decryptProctoringLog;
//# sourceMappingURL=encryption.js.map