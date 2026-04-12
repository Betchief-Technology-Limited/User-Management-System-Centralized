import PasswordResetToken from "../../database/model/passwordResetToken.model.js";
import Permission from "../../database/model/permission.model.js";
import RolePermission from "../../database/model/rolePermission.model.js";
import Role from "../../database/model/role.model.js";
import Session from "../../database/model/session.model.js";
import UserRole from "../../database/model/userRole.model.js";
import User from "../../database/model/user.model.js";
import VerificationToken from "../../database/model/verificationToken.model.js";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/AppError.js";
import {
    AUDIT_ACTION,
    DEFAULT_SYSTEM_PERMISSIONS,
    SYSTEM_ROLE,
    USER_STATUS
} from "../../shared/constants/system.js";
import { recordAuditLog } from "../../shared/utils/auditLogger.js";
import sendVerificationEmail from "./auth.email.js";
import {
    comparePassword,
    generateAccessToken,
    generateRandomToken,
    generateRefreshToken,
    hashPassword,
    hashToken,
    verifyRefreshToken,
} from "./auth.utils.js";
import { getUserAccessProfile } from "../roles/role.service.js";



const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const buildAuthPayload = (user) => ({
    sub: user._id.toString(),
    email: user.email,
});

function sanitizeUserDocument(user) {
    return typeof user.toJSON === "function" ? user.toJSON() : user;
}

async function attachAccessProfile(user) {
    const accessProfile = await getUserAccessProfile(user._id || user.id);

    return {
        ...sanitizeUserDocument(user),
        ...accessProfile
    }
}

async function ensureSuperAdminRoleWithPermissions() {
    const permissions = [];

    for (const name of DEFAULT_SYSTEM_PERMISSIONS) {
        const permission = await Permission.findOneAndUpdate(
            { name },
            {
                $setOnInsert: {
                    name,
                    description: `${name} permission`
                }
            },
            {
                returnDocument: "after",
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        permissions.push(permission)
    }

    const superAdminRole = await Role.findOneAndUpdate(
        { name: SYSTEM_ROLE.SUPER_ADMIN },
        {
            $setOnInsert: {
                name: SYSTEM_ROLE.SUPER_ADMIN,
                description: "Platform super administrator"
            },
        },
        {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true
        }
    );

    for (const permission of permissions) {
        await RolePermission.updateOne(
            {
                roleId: superAdminRole._id,
                permissionId: permission._id
            },
            {
                $setOnInsert: {
                    roleId: superAdminRole._id,
                    permissionId: permission._id
                },
            },
            { upsert: true }
        );
    }

    return superAdminRole;
}


export async function registerSuperAdmin({
    email,
    password,
    firstName,
    lastName
}) {

    const [existingUser, superAdminRole] = await Promise.all([
        User.findOne({ email }),
        ensureSuperAdminRoleWithPermissions()
    ])

    if (existingUser) {
        throw new AppError("User with this email already exists", 409);
    }

    const existingSuperAdminAssignment = await UserRole.findOne({
        roleId: superAdminRole._id,
        organizationId: null
    })

    if (existingSuperAdminAssignment) {
        throw new AppError(
            "A super admin already exists. Create additional admins through role assignment.",
            409
        )
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
        email,
        passwordHash,
        firstName,
        lastName,
        status: USER_STATUS.ACTIVE,
        mustChangePassword: false
    });

    await UserRole.create({
        userId: user._id,
        roleId: superAdminRole._id,
        organizationId: null
    })

    const rawVerificationToken = generateRandomToken();
    const verificationTokenHash = hashToken(rawVerificationToken);

    await VerificationToken.create({
        userId: user._id,
        tokenHash: verificationTokenHash,
        expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
    });

    await sendVerificationEmail({
        to: user.email,
        firstName: user.firstName,
        token: rawVerificationToken
    });

    await recordAuditLog({
        userId: user._id,
        action: AUDIT_ACTION.USER_REGISTERED,
        entity: "User",
        entityId: user._id,
        metadata: { email: user.email, registrationType: "super_admin" }
    })

    await recordAuditLog({
        userId: user._id,
        action: AUDIT_ACTION.ROLE_ASSIGNED,
        entity: "UserRole",
        metadata: { roleId: superAdminRole._id, registrationType: "super_admin" }
    })

    return {
        user: await attachAccessProfile(user)
    }

};

export async function loginUser({
    email,
    password,
    deviceInfo,
    ipAddress,
}) {
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    //Block login until email is verified
    if (!user.emailVerified) {
        if (user.status === USER_STATUS.INVITED) {
            throw new AppError(
                "Activate your invitation from the email link before logging in",
                403
            )
        }

        throw new AppError("Please verify your email before logging in", 403)
    }

    if (user.status !== USER_STATUS.ACTIVE) {
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

    await recordAuditLog({
        userId: user._id,
        action: AUDIT_ACTION.LOGIN_SUCCESS,
        entity: "Session",
        metadata: { ipAddress, deviceInfo }
    })

    return {
        user: await attachAccessProfile(user),
        accessToken,
        refreshToken,
    };
};

export async function refreshUserToken({ refreshToken }) {
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

    if (!user) {
        throw new AppError("User is not authorized", 401);
    }

    if (!user.emailVerified) {
        throw new AppError("Please verify your email before continuing", 403)
    }

    if (user.status !== USER_STATUS.ACTIVE) {
        throw new AppError("User account is not active", 403);
    }

    const newPayload = buildAuthPayload(user);
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);
    const newRefreshTokenHash = hashToken(newRefreshToken);

    session.refreshTokenHash = newRefreshTokenHash;
    session.expiresAt = new Date(Date.now() + SEVEN_DAYS_IN_MS);
    await session.save()

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }

};

export async function logoutUser({ refreshToken }) {
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

export async function getCurrentUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return attachAccessProfile(user);
};

export async function verifyEmailToken({ token }) {
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
    user.emailVerifiedAt = new Date();
    await user.save();

    verificationRecord.usedAt = new Date();
    await verificationRecord.save();

    return true;
};

export async function requestPasswordReset({ email }) {
    const user = await User.findOne({ email });

    if (!user) {
        return env.NODE_ENV === "production" ? {} : { resetToken: null };
    }

    const rawResetToken = generateRandomToken();
    const tokenHash = hashToken(rawResetToken);

    await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
    });

    return env.NODE_ENV === "production"
        ? {}
        : {
            resetToken: rawResetToken,
        };
};

export async function resetPassword({ token, password }) {
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
    user.mustChangePassword = false;
    await user.save();

    resetRecord.usedAt = new Date();
    await resetRecord.save();

    await Session.updateMany(
        { userId: user._id, isRevoked: false },
        { $set: { isRevoked: true } }
    );

    await recordAuditLog({
        userId: user._id,
        action: AUDIT_ACTION.PASSWORD_CHANGED,
        entity: "User",
        entityId: user._id,
        metadata: { source: "reset_password" }
    })

    return true;
};

export async function changePassword({
    userId,
    currentPassword,
    newPassword
}) {
    const user = await User.findById(userId).select("+passwordHash");

    if(!user){
        throw new AppError("User not found", 404)
    }

    const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        user.passwordHash
    );

    if(!isCurrentPasswordValid){
        throw new AppError("Current password is incorrect", 400)
    }

    user.passwordHash = await hashPassword(newPassword);
    user.mustChangePassword = false;
    await user.save();

    await recordAuditLog({
        userId,
        action: AUDIT_ACTION.PASSWORD_CHANGED,
        entity: "User",
        entityId: user._id,
        metadata: { source: "change_password" }
    });

    return true;
}