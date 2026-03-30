import  User  from "../../database/model/user.model.js";
import Session from "../../database/model/session.model.js";
import  VerificationToken  from "../../database/model/verificationToken.model.js";
import  PasswordResetToken  from "../../database/model/passwordResetToken.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import { 
    hashPassword, 
    comparePassword, 
    generateAccessToken, 
    generateRandomToken,
    generateRefreshToken,
    verifyRefreshToken, 
    hashToken 
} from "./auth.utils.js";

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const buildAuthPayload = (user) => ({
    sub: user._id.toString(),
    email: user.email,
});

export const registerUser = async ({ email, password, firstName, lastName }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("User with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
        email,
        passwordHash,
        firstName,
        lastName,
    });

    const rawVerificationToken = generateRandomToken();
    const verificationTokenHash = hashToken(rawVerificationToken);

    await VerificationToken.create({
        userId: user._id,
        tokenHash: verificationTokenHash,
        expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
    });

    return {
        user,
        verificationToken: rawVerificationToken,
    };
};

export const loginUser = async ({
    email,
    password,
    deviceInfo,
    ipAddress,
}) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    if (user.status !== "active") {
        throw new AppError("User account is not active", 403);
    }

    const payload = buildAuthPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const refreshTokenHash = hashToken(refreshToken);

    await Session.create({
        userId: user._id,
        deviceInfo,
        ipAddress,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + SEVEN_DAYS_IN_MS),
    });

    user.lastLoginAt = new Date();
    await user.save();

    return {
        user,
        accessToken,
        refreshToken,
    };
};

export const refreshUserToken = async ({ refreshToken }) => {
    let decoded;

    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    const refreshTokenHash = hashToken(refreshToken);

    const session = await Session.findOne({
        userId: decoded.sub,
        refreshTokenHash,
        isRevoked: false,
    });

    if (!session) {
        throw new AppError("Session not found or revoked", 401);
    }

    if (session.expiresAt < new Date()) {
        throw new AppError("Refresh token session expired", 401);
    }

    const user = await User.findById(decoded.sub);

    if (!user || user.status !== "active") {
        throw new AppError("User is not authorized", 401);
    }

    const newPayload = buildAuthPayload(user);
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);
    const newRefreshTokenHash = hashToken(newRefreshToken);

    session.refreshTokenHash = newRefreshTokenHash;
    session.expiresAt = new Date(Date.now() + SEVEN_DAYS_IN_MS);
    await session.save();

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

export const logoutUser = async ({ refreshToken }) => {
    let decoded;

    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    const refreshTokenHash = hashToken(refreshToken);

    const session = await Session.findOne({
        userId: decoded.sub,
        refreshTokenHash,
        isRevoked: false,
    });

    if (!session) {
        throw new AppError("Session not found or already revoked", 404);
    }

    session.isRevoked = true;
    await session.save();

    return true;
};

export const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
};

export const verifyEmailToken = async ({ token }) => {
    const tokenHash = hashToken(token);

    const verificationRecord = await VerificationToken.findOne({
        tokenHash,
        usedAt: null,
    });

    if (!verificationRecord) {
        throw new AppError("Invalid verification token", 400);
    }

    if (verificationRecord.expiresAt < new Date()) {
        throw new AppError("Verification token expired", 400);
    }

    const user = await User.findById(verificationRecord.userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.emailVerified = true;
    await user.save();

    verificationRecord.usedAt = new Date();
    await verificationRecord.save();

    return true;
};

export const requestPasswordReset = async ({ email }) => {
    const user = await User.findOne({ email });

    if (!user) {
        return { resetToken: null };
    }

    const rawResetToken = generateRandomToken();
    const tokenHash = hashToken(rawResetToken);

    await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
    });

    return {
        resetToken: rawResetToken,
    };
};

export const resetPassword = async ({ token, password }) => {
    const tokenHash = hashToken(token);

    const resetRecord = await PasswordResetToken.findOne({
        tokenHash,
        usedAt: null,
    });

    if (!resetRecord) {
        throw new AppError("Invalid password reset token", 400);
    }

    if (resetRecord.expiresAt < new Date()) {
        throw new AppError("Password reset token expired", 400);
    }

    const user = await User.findById(resetRecord.userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.passwordHash = await hashPassword(password);
    await user.save();

    resetRecord.usedAt = new Date();
    await resetRecord.save();

    await Session.updateMany(
        { userId: user._id, isRevoked: false },
        { $set: { isRevoked: true } }
    );

    return true;
};