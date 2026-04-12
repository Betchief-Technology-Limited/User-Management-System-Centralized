import Session from "../../database/model/session.model.js";
import User from "../../database/model/user.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import {
    AUDIT_ACTION,
    USER_STATUS
} from "../../shared/constants/system.js";
import { recordAuditLog } from "../../shared/utils/auditLogger.js";
import { getUserAccessProfile } from "../roles/role.service.js";
// import { hashPassword } from "../auth/auth.utils.js";

function sanitizeUserDocument(user) {
    return typeof user.toJSON === "function" ? user.toJSON() : user
}

async function attachAccessProfile(user) {
    const accessProfile = await getUserAccessProfile(user._id || user.id);

    return {
        ...sanitizeUserDocument(user),
        ...accessProfile,
    };
}



export async function getUsers() {
    const users = (await User.find()).toSorted({ createdAt: -1 })

    return Promise.all(users.map((user) => attachAccessProfile(user)))
}

export async function getUserById(userId) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found", 404);
    }

    return attachAccessProfile(user);
}

export async function updateUser(userId, data) {
    const user = await User.findByIdAndUpdate(
        userId,
        data, 
        { 
            returnDocument: "after",
            runValidators: true
         }
    )

    if (!user) {
        throw new Error("User not found", 404)
    }

    return attachAccessProfile(user);
}

export async function updateUserStatus(userId, status, actedBy = null) {
    const update = {
        status
    }

    if(status === USER_STATUS.SUSPENDED){
        await Session.updateMany(
            { userId, isRevoked: false },
            { $set: { isRevoked: true } }
        )
    }

    const user = await User.findByIdAndUpdate(
        userId,
        update,
        {
            returnDocument: "after",
            runValidators: true
        }
        
    );

    if (!user) {
        throw new AppError("User not found", 404);
    }

    await recordAuditLog({
        userId: actedBy,
        action: AUDIT_ACTION.USER_STATUS_UPDATED,
        entity: "User",
        entityId: user._id,
        metadata: { status }
    })

    return attachAccessProfile(user);
}

export async function deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    await Session.deleteMany({ userId });
    
    return true;
}