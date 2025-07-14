"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const examController_1 = require("../controllers/examController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Validation rules
const examValidation = [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    (0, express_validator_1.body)('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    (0, express_validator_1.body)('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    (0, express_validator_1.body)('startTime').isISO8601().withMessage('Valid start time is required'),
    (0, express_validator_1.body)('endTime').isISO8601().withMessage('Valid end time is required'),
    (0, express_validator_1.body)('questions').isArray({ min: 1 }).withMessage('At least one question is required')
];
// Routes
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['teacher', 'admin']), examValidation, examController_1.createExam);
router.get('/', auth_1.authenticateToken, examController_1.getExams);
router.get('/:id', auth_1.authenticateToken, examController_1.getExamById);
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['teacher', 'admin']), examValidation, examController_1.updateExam);
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['teacher', 'admin']), examController_1.deleteExam);
exports.default = router;
//# sourceMappingURL=exams.js.map