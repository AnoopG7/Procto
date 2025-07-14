import mongoose, { Document } from 'mongoose';
import { Exam as IExam } from '../types';
interface ExamDocument extends IExam, Document {
}
declare const _default: mongoose.Model<ExamDocument, {}, {}, {}, mongoose.Document<unknown, {}, ExamDocument, {}> & ExamDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Exam.d.ts.map