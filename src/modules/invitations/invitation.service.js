import Invitation from "../../database/model/invitation.model.js";
import User from "../../database/model/user.model.js";
import Role from "../../database/model/role.model.js";
import UserRole from "../../database/model/userRole.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import { generateRandomToken, hashPassword, hashToken } from "../auth/auth.utils.js";
import { sendInvitationEmail } from "../auth/auth.email.js";

const FORTY_EIGHT_HOURS_IN_MS = 48 * 60 * 60 * 1000;

export async function createInvitation({ email, roleId, invitedBy }) {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("User with this email already exists", 409);
    }

    const role = await Role.findById(roleId);

    if (!role) {
        throw new AppError("Role not found", 404);
    }

    const existingPendingInvitation = await Invitation.findOne({
        email,
        roleId,
        status: "pending",
        expiresAt: { $gt: new Date() },
    });

    if (existingPendingInvitation) {
        throw new AppError("A pending invitation already exists for this email and role", 409);
    }

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);

    const invitation = await Invitation.create({
        email,
        roleId,
        invitedBy,
        tokenHash,
        status: "pending",
        expiresAt: new Date(Date.now() + FORTY_EIGHT_HOURS_IN_MS),
    });

    await sendInvitationEmail({
        to: email,
        token: rawToken,
        roleName: role.name,
    });

    return invitation;
}

export async function previewInvitation(token) {
    const tokenHash = hashToken(token);

    const invitation = await Invitation.findOne({
        tokenHash,
        status: "pending",
    }).populate("roleId");

    if (!invitation) {
        throw new AppError("Invalid invitation token", 400);
    }

    if (invitation.expiresAt < new Date()) {
        invitation.status = "expired";
        await invitation.save();
        throw new AppError("Invitation token expired", 400);
    }

    return {
        email: invitation.email,
        role: invitation.roleId,
        expiresAt: invitation.expiresAt,
    };
}

export async function acceptInvitation({
    token,
    firstName,
    lastName,
    password,
}) {
    const tokenHash = hashToken(token);

    const invitation = await Invitation.findOne({
        tokenHash,
        status: "pending",
    });

    if (!invitation) {
        throw new AppError("Invalid invitation token", 400);
    }

    if (invitation.expiresAt < new Date()) {
        invitation.status = "expired";
        await invitation.save();
        throw new AppError("Invitation token expired", 400);
    }

    const existingUser = await User.findOne({ email: invitation.email });

    if (existingUser) {
        throw new AppError("User with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
        email: invitation.email,
        passwordHash,
        firstName,
        lastName,
        status: "active",
        emailVerified: true,
    });

    await UserRole.create({
        userId: user._id,
        roleId: invitation.roleId,
        organizationId: null,
    });

    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    await invitation.save();

    return user;
}