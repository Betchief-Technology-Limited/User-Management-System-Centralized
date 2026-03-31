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

export async function register (req, res) {
    const result = await registerUser(req.validatedBody);

    return successResponse(
        res,
        "User registered successfully.Please check your email to verify your account",
        {
            user: {
                id: result.user._id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                status: result.user.status,
                emailVerified: result.user.emailVerified,
            },
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

export async function refresh (req, res) {
    const tokens = await refreshUserToken(req.validatedBody);

    return successResponse(res, "Token refreshed successfully", tokens);
};

export async function logout (req, res) {
    await logoutUser(req.validatedBody);

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

    return successResponse(res, "Password reset token generated", result);
};

export async function resetUserPassword (req, res) {
    await resetPassword(req.validatedBody);

    return successResponse(res, "Password reset successfully");
};