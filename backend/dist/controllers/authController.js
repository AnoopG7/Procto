"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.verifyIdentity = exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const register = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email, password, firstName, lastName, role, institutionId } = req.body;
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists with this email' });
            return;
        }
        // Create new user
        const user = new User_1.default({
            email,
            password,
            firstName,
            lastName,
            role: role || 'student',
            institutionId
        });
        await user.save();
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            id: user._id.toString(),
            email: user.email,
            role: user.role
        });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email, password } = req.body;
        // Find user by email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            id: user._id.toString(),
            email: user.email,
            role: user.role
        });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const verifyIdentity = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        // Handle file uploads for photo and ID card
        const files = req.files;
        if (!files || !files.photo || !files.idCard) {
            res.status(400).json({ error: 'Both photo and ID card images are required' });
            return;
        }
        const photoFile = files.photo[0];
        const idCardFile = files.idCard[0];
        // Update user with photo and ID card URLs
        const user = await User_1.default.findByIdAndUpdate(req.user.id, {
            photoUrl: `/uploads/${photoFile.filename}`,
            idCardUrl: `/uploads/${idCardFile.filename}`
        }, { new: true });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({
            message: 'Identity verification completed',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                photoUrl: user.photoUrl,
                idCardUrl: user.idCardUrl
            }
        });
    }
    catch (error) {
        console.error('Identity verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.verifyIdentity = verifyIdentity;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const user = await User_1.default.findById(req.user.id).select('-password');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map