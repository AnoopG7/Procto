"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExam = exports.updateExam = exports.getExamById = exports.getExams = exports.createExam = void 0;
const express_validator_1 = require("express-validator");
const Exam_1 = __importDefault(require("../models/Exam"));
const createExam = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const { title, description, duration, startTime, endTime, questions } = req.body;
        const exam = new Exam_1.default({
            title,
            description,
            duration,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            questions,
            createdBy: req.user.id
        });
        await exam.save();
        res.status(201).json({
            message: 'Exam created successfully',
            exam
        });
    }
    catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createExam = createExam;
const getExams = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        let query = {};
        // If user is a student, only show exams that are currently available
        if (req.user.role === 'student') {
            const now = new Date();
            query = {
                startTime: { $lte: now },
                endTime: { $gte: now }
            };
        }
        // If user is teacher/admin, show exams they created
        if (req.user.role === 'teacher' || req.user.role === 'admin') {
            query = { createdBy: req.user.id };
        }
        const exams = await Exam_1.default.find(query)
            .populate('createdBy', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json({ exams });
    }
    catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getExams = getExams;
const getExamById = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const { id } = req.params;
        const exam = await Exam_1.default.findById(id).populate('createdBy', 'firstName lastName email');
        if (!exam) {
            res.status(404).json({ error: 'Exam not found' });
            return;
        }
        // Check if student can access this exam
        if (req.user.role === 'student') {
            const now = new Date();
            if (now < exam.startTime || now > exam.endTime) {
                res.status(403).json({ error: 'Exam is not currently available' });
                return;
            }
        }
        // If user is teacher/admin, check if they created this exam
        if ((req.user.role === 'teacher' || req.user.role === 'admin') &&
            exam.createdBy.toString() !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        res.json({ exam });
    }
    catch (error) {
        console.error('Get exam by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getExamById = getExamById;
const updateExam = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const { id } = req.params;
        const { title, description, duration, startTime, endTime, questions } = req.body;
        const exam = await Exam_1.default.findById(id);
        if (!exam) {
            res.status(404).json({ error: 'Exam not found' });
            return;
        }
        // Check if user has permission to update this exam
        if (exam.createdBy.toString() !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        const updatedExam = await Exam_1.default.findByIdAndUpdate(id, {
            title,
            description,
            duration,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            questions
        }, { new: true });
        res.json({
            message: 'Exam updated successfully',
            exam: updatedExam
        });
    }
    catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateExam = updateExam;
const deleteExam = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const { id } = req.params;
        const exam = await Exam_1.default.findById(id);
        if (!exam) {
            res.status(404).json({ error: 'Exam not found' });
            return;
        }
        // Check if user has permission to delete this exam
        if (exam.createdBy.toString() !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        await Exam_1.default.findByIdAndDelete(id);
        res.json({ message: 'Exam deleted successfully' });
    }
    catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteExam = deleteExam;
//# sourceMappingURL=examController.js.map