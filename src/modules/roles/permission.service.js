import Permission from "../../database/model/permission.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import { AUDIT_ACTION } from "../../shared/constants/system.js";
import { recordAuditLog } from "../../shared/utils/auditLogger.js";

export async function createPermission({ name, description, createdBy = null }) {
    const normalizedName = name.trim();
    const existingPermission = await Permission.findOne({ name: normalizedName });

    if (existingPermission) {
        throw new AppError("Permission already exists", 409);
    }

    const permission = await Permission.create({
        name: normalizedName,
        description
    });

    await recordAuditLog({
        userId: createdBy,
        action: AUDIT_ACTION.PERMISSION_CREATED,
        entity: "Permission",
        entityId: permission._id,
        metadata: { name: permission.name }
    })

    return permission;
}

// Get role permission
export async function getPermissions() {
    return Permission.find().sort({ createdAt: -1 })
}