import mongoose, { Document } from 'mongoose';
import { ExamSession as IExamSession } from '../types';
interface ExamSessionDocument extends IExamSession, Document {
}
declare const _default: mongoose.Model<ExamSessionDocument, {}, {}, {}, mongoose.Document<unknown, {}, ExamSessionDocument, {}> & ExamSessionDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ExamSession.d.ts.map