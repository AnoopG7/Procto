"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const examSessionController_1 = require("../controllers/examSessionController");
const router = express_1.default.Router();
// Student routes
router.post('/start', auth_1.authenticateToken, (0, auth_1.requireRole)(['student']), [
    (0, express_validator_1.body)('examId').isMongoId().withMessage('Valid exam ID required')
], examSessionController_1.startExamSession);
router.put('/:id/submit', auth_1.authenticateToken, (0, auth_1.requireRole)(['student']), [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid session ID required'),
    (0, express_validator_1.body)('answers').isObject().withMessage('Answers object required')
], examSessionController_1.submitExamSession);
router.put('/:id/save-answers', auth_1.authenticateToken, (0, auth_1.requireRole)(['student']), [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid session ID required'),
    (0, express_validator_1.body)('answers').isObject().withMessage('Answers object required')
], examSessionController_1.saveAnswers);
router.post('/:id/log-event', auth_1.authenticateToken, (0, auth_1.requireRole)(['student']), [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid session ID required'),
    (0, express_validator_1.body)('eventType').notEmpty().withMessage('Event type required'),
    (0, express_validator_1.body)('details').notEmpty().withMessage('Event details required')
], examSessionController_1.logProctoringEvent);
// Admin/Teacher routes
router.get('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'teacher']), [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], examSessionController_1.getAllSessions);
router.get('/live', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'teacher']), examSessionController_1.getLiveSessions);
router.get('/reports', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'teacher']), examSessionController_1.getSessionReports);
router.get('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'teacher', 'student']), [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid session ID required')
], examSessionController_1.getSessionById);
router.get('/:id/export', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin', 'teacher']), [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid session ID required')
], examSessionController_1.exportSessionLogs);
exports.default = router;
//# sourceMappingURL=examSessions.js.map