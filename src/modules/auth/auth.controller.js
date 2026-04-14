import  successResponse  from "../../shared/utils/apiResponse.js";
import {
    changePassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshUserToken,
    registerSuperAdmin,
    requestPasswordReset,
    resetPassword,
    verifyEmailToken,
} from "./auth.service.js";
import { setAuthCookies, clearAuthCookies } from "./auth.cookie.js";

export async function registerInitialSuperAdmin (req, res) {
    const result = await registerSuperAdmin(req.validatedBody);

    return successResponse(
        res,
        "Super admin registered successfully.Please check your email to verify your account",
        {
            user: result.user,
        },
        201
    );
};

export async function login (req, res) {
    const result = await loginUser({
        ...req.validatedBody,
        deviceInfo: req.headers["user-agent"] || "unknown",
        ipAddress: req.ip,
    });

    setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
    })

    return successResponse(res, "Login successful", {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    });
};

export async function refresh (req, res) {
    const refreshToken = req.cookies?.refreshToken || req.validatedBody?.refreshToken;
    
    const tokens = await refreshUserToken({ refreshToken });

    setAuthCookies(res, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
    })

    return successResponse(res, "Token refreshed successfully", {});
};

export async function logout (req, res) {
    const refreshToken = req.cookies?.refreshToken || req.validatedBody?.refreshToken;

    await logoutUser({ refreshToken });
    clearAuthCookies(res)

    return successResponse(res, "Logout successful");
};

export async function me (req, res) {
    const user = await getCurrentUser(req.user.sub);

    return successResponse(res, "Current user fetched successfully", { user });
};

export async function verifyEmail (req, res) {
    await verifyEmailToken(req.validatedBody);

    return successResponse(res, "Email verified successfully");
};

export async function forgotPassword (req, res) {
    const result = await requestPasswordReset(req.validatedBody);

    return successResponse(
        res, 
        "If an account exists for this email, password reset instructions have been prepared", 
        result
    );
};

export async function resetUserPassword (req, res) {
    await resetPassword(req.validatedBody);

    return successResponse(res, "Password reset successfully");
};

export async function changeUserPassword(req, res) {
    await changePassword({
        userId: req.user.sub,
        currentPassword: req.validatedBody.currentPassword,
        newPassword: req.validatedBody.newPassword
    })

    return successResponse(res, "Password changed successfully")
}