import Permission from "../../database/model/permission.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import { AUDIT_ACTION } from "../../shared/constants/system.js";
import { recordAuditLog } from "../../shared/utils/auditLogger.js";
import { buildPermissionDefinition } from "../../shared/utils/permissionKey.js";

export async function createPermission({
    name,
    resource,
    action,
    description,
    createdBy = null
}) {
    let permissionDefinition;

    try {
        permissionDefinition = buildPermissionDefinition({ name, resource, action })
    } catch (error) {
        throw new AppError(error.message, 400)
    }

    const existingPermission = await Permission.findOne({
        name: permissionDefinition.name
    });

    if (existingPermission) {
        throw new AppError("Permission already exists", 409);
    }

    const permission = await Permission.create({
        ...permissionDefinition,
        description
    });

    await recordAuditLog({
        userId: createdBy,
        action: AUDIT_ACTION.PERMISSION_CREATED,
        entity: "Permission",
        entityId: permission._id,
        metadata: {
            name: permission.name,
            resource: permission.resource,
            action: permission.action
        }
    })

    return permission;
}

// Get role permission
export async function getPermissions() {
    return Permission.find().sort({ createdAt: -1 })
}