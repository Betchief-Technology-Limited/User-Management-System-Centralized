import  successResponse  from "../../shared/utils/apiResponse.js";
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshUserToken,
    registerUser,
    requestPasswordReset,
    resetPassword,
    verifyEmailToken,
} from "./auth.service.js";

export const register = async (req, res) => {
    const result = await registerUser(req.validatedBody);

    return successResponse(
        res,
        "User registered successfully",
        {
            user: {
                id: result.user._id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                status: result.user.status,
                emailVerified: result.user.emailVerified,
            },
            verificationToken: result.verificationToken,
        },
        201
    );
};

export const login = async (req, res) => {
    const result = await loginUser({
        ...req.validatedBody,
        deviceInfo: req.headers["user-agent"] || "unknown",
        ipAddress: req.ip,
    });

    return successResponse(res, "Login successful", {
        user: {
            id: result.user._id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            status: result.user.status,
            emailVerified: result.user.emailVerified,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
    });
};

export const refresh = async (req, res) => {
    const tokens = await refreshUserToken(req.validatedBody);

    return successResponse(res, "Token refreshed successfully", tokens);
};

export const logout = async (req, res) => {
    await logoutUser(req.validatedBody);

    return successResponse(res, "Logout successful");
};

export const me = async (req, res) => {
    const user = await getCurrentUser(req.user.sub);

    return successResponse(res, "Current user fetched successfully", { user });
};

export const verifyEmail = async (req, res) => {
    await verifyEmailToken(req.validatedBody);

    return successResponse(res, "Email verified successfully");
};

export const forgotPassword = async (req, res) => {
    const result = await requestPasswordReset(req.validatedBody);

    return successResponse(res, "Password reset token generated", result);
};

export const resetUserPassword = async (req, res) => {
    await resetPassword(req.validatedBody);

    return successResponse(res, "Password reset successfully");
};