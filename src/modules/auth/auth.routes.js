import express from "express";
import asyncHandler  from "../../middleware/async.middleware.js";
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

authRoutes.post("/register", validate(registerSchema), asyncHandler(register));
authRoutes.post("/login", validate(loginSchema), asyncHandler(login));
authRoutes.post("/refresh", validate(refreshTokenSchema), asyncHandler(refresh));
authRoutes.post("/logout", validate(logoutSchema), asyncHandler(logout));
authRoutes.get("/me", requireAuth, asyncHandler(me));
authRoutes.post("/verify-email", validate(verifyEmailSchema), asyncHandler(verifyEmail));
authRoutes.post(
    "/forgot-password",
    validate(forgotPasswordSchema),
    asyncHandler(forgotPassword)
);
authRoutes.post(
    "/reset-password",
    validate(resetPasswordSchema),
    asyncHandler(resetUserPassword)
);

export default authRoutes;