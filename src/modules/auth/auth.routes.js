import express from "express";
import asyncHandler from "../../middleware/async.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
    forgotPassword,
    login,
    logout,
    me,
    refresh,
    register,
    resetUserPassword,
    verifyEmail,
} from "./auth.controller.js";
import {
    forgotPasswordSchema,
    loginSchema,
    logoutSchema,
    refreshTokenSchema,
    registerSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from "./auth.validation.js";

const authRoutes = express.Router();
/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 */
authRoutes.post("/register", validate(registerSchema), asyncHandler(register));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
authRoutes.post("/login", validate(loginSchema), asyncHandler(login));

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your_refresh_token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
authRoutes.post("/refresh", validate(refreshTokenSchema), asyncHandler(refresh));

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your_refresh_token
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Invalid or expired refresh token
 */
authRoutes.post("/logout", validate(logoutSchema), asyncHandler(logout));

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched
 */
authRoutes.get("/me", requireAuth, asyncHandler(me));

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify user email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 example: email_verification_token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
authRoutes.post("/verify-email", validate(verifyEmailSchema), asyncHandler(verifyEmail));

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *     responses:
 *       200:
 *         description: Password reset token generated
 */
authRoutes.post(
    "/forgot-password",
    validate(forgotPasswordSchema),
    asyncHandler(forgotPassword)
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 example: password_reset_token
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
authRoutes.post(
    "/reset-password",
    validate(resetPasswordSchema),
    asyncHandler(resetUserPassword)
);

export default authRoutes;