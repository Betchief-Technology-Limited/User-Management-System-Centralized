import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(2, "Name must be at least 2 characters"),
    lastName: z.string().min(2, "Name must be at least 2 characters")
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1).optional()
});

export const logoutSchema = z.object({
    refreshToken: z.string().min(1).optional(),
});

export const verifyEmailSchema = z.object({
    token: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Password confirmation does not match",
        path: ["confirmPassword"]
    }
);

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8)
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Password confirmation does not match",
        path: ["confirmPassword"]
    }
);