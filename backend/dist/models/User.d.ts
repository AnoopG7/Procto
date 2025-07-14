import mongoose, { Document } from 'mongoose';
import { User as IUser } from '../types';
interface UserDocument extends IUser, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const _default: mongoose.Model<UserDocument, {}, {}, {}, mongoose.Document<unknown, {}, UserDocument, {}> & UserDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map