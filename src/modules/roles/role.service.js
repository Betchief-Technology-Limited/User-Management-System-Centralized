import Permission from "../../database/model/permission.model.js";
import RolePermission from "../../database/model/rolePermission.model.js";
import Role from "../../database/model/role.model.js";
import UserRole from "../../database/model/userRole.model.js";
import User from "../../database/model/user.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import { AUDIT_ACTION } from "../../shared/constants/system.js";
import { recordAuditLog } from "../../shared/utils/auditLogger.js";
import { flattenPermissionGroups } from "../../shared/utils/permissionKey.js";

function uniqueStrings(values = []) {
    return [... new Set(values.map((value) => value.toString()))];
}

function buildPermissionSummary(permission) {
    return {
        id: permission._id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        description: permission.description
    };
}


async function getUserRoleAssignments(userId) {
    return UserRole.find({
        userId,
        organizationId: null
    }).lean()
}

async function getBaseUserPermissionRecords(userId) {
    const userRoles = await getUserRoleAssignments(userId);

    if (!userRoles.length) {
        return [];
    }

    const roleIds = userRoles.map((item) => item.roleId);
    const rolePermissions = await RolePermission.find({
        roleId: { $in: roleIds },
    }).lean();

    if (!rolePermissions.length) {
        return []
    }

    const permissionIds = uniqueStrings(
        rolePermissions.map((item) => item.permissionId)
    );

    return Permission.find({
        _id: { $in: permissionIds }
    }).lean();
}

async function getUserDeniedPermissionKeys(userId) {
    const user = await User.findById(userId).select("deniedPermissions").lean();

    return uniqueStrings(user?.deniedPermissions || []);
}


export async function createRole({ name, description, createdBy = null }) {
    const existingRole = await Role.findOne({ name: name.trim() });

    if (existingRole) {
        throw new AppError("Role already exists", 409)
    }

    const role = await Role.create({
        name: name.trim(),
        description
    });

    await recordAuditLog({
        userId: createdBy,
        action: AUDIT_ACTION.ROLE_CREATED,
        entity: "Role",
        entityId: role._id,
        metadata: { name: role.name }
    })

    return role;
}

// Getting all roles created
export async function getRoles() {
    const roles = (await Role.find()).toSorted({ createdAt: -1 }).lean();

    if (!roles.length) {
        return []
    }

    const roleIds = roles.map((role) => role._id);
    const rolePermissions = await RolePermission.find({
        roleId: { $in: roleIds }
    })
        .populate("permissionId", "name resource action description")
        .lean();

    const permissionMap = new Map();

    for (const assignment of rolePermissions) {
        const key = assignment.roleId.toString();
        const currentPermissions = permissionMap.get(key) || [];

        if (assignment.permissionId) {
            currentPermissions.push(buildPermissionSummary(assignment.permissionId))
        }

        permissionMap.set(key, currentPermissions)
    }

    return roles.map((role) => ({
        ...role,
        permissions: permissionMap.get(role._id.toString()) || []
    }))
}

// Assigning permission to roles created
export async function assignPermissionToRole(
    roleId,
    assignmentInput,
    actedBy = null
) {
    const role = await Role.findById(roleId);
    if (!role) {
        throw new AppError("Role not found", 404);
    }

    const normalizedPermissionIds = uniqueStrings(
        assignmentInput.permissionIds || []
    );

    const permissionGroups = assignmentInput.permissions || [];

    let resolvedPermissionIds = [...normalizedPermissionIds];

    const autoCreatedPermission = [];

    if (permissionGroups.length) {
        const permissionDefinitions = flattenPermissionGroups(permissionGroups);

        for (const permissionDefinition of permissionDefinitions) {
            const permission = await Permission.findOneAndUpdate(
                { name: permissionDefinition.name },
                {
                    $setOnInsert: {
                        ...permissionDefinition,
                        description: `${permissionDefinition.name} permission`,
                    },
                },
                {
                    returnDocument: "after",
                    upsert: true,
                    setDefaultsOnInsert: true
                }
            );

            resolvedPermissionIds.push(permission._id.toString());

            if (permission.createdAt?.getTime?.() === permission.updatedAt?.getTime?.()) {
                autoCreatedPermission.push(permission.name)
            }
        }
    }

    resolvedPermissionIds = uniqueStrings(resolvedPermissionIds);


    const permissions = await Permission.find({
        _id: { $in: resolvedPermissionIds }
    })
    if (permissions.length !== resolvedPermissionIds.length) {
        throw new AppError("One or more permissions were not found", 404)
    }

    const existingAssignments = await RolePermission.find({
        roleId,
        permissionId: { $in: resolvedPermissionIds },
    }).lean()

    const existingPermissionIds = new Set(
        existingAssignments.map((item) => item.permissionId.toString())
    );

    const permissionIdsToAssign = resolvedPermissionIds.filter(
        (permissionId) => !existingPermissionIds.has(permissionId)
    )
    if (!permissionIdsToAssign.length) {
        throw new AppError(
            "All selected permissions are already assigned to this role",
            409
        )
    }

    const assignments = await RolePermission.insertMany(
        permissionIdsToAssign.map((permissionId) => ({
            roleId,
            permissionId
        }))
    )

    await recordAuditLog({
        userId: actedBy,
        action: AUDIT_ACTION.PERMISSION_ASSIGNED,
        entity: "Role",
        entityId: role._id,
        metadata: {
            permissionIds: permissionIdsToAssign,
            ...(autoCreatedPermission.length
                ? { autoCreatedPermission }
                : {})
        }
    })

    return assignments;
}

// Assign role to user
export async function assignRoleToUser({ userId, roleId, actedBy = null }) {
    const [user, role] = await Promise.all([
        User.findById(userId),
        Role.findById(roleId)
    ])

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (!role) {
        throw new AppError("Role not found", 404)
    }

    const existingUserRole = await UserRole.findOne({
        userId,
        roleId,
        organizationId: null
    });

    if (existingUserRole) {
        throw new AppError("Role already assigned to user", 409)
    }

    const userRole = await UserRole.create({
        userId,
        roleId,
        organizationId: null
    });

    await recordAuditLog({
        userId: actedBy,
        action: AUDIT_ACTION.ROLE_ASSIGNED,
        entity: "UserRole",
        entityId: UserRole._id,
        metadata: { targetUserId: userId, roleId }
    })

    return userRole;
}

export async function removeRoleFromUser({ userId, roleId, actedBy = null }) {
    const userRole = await UserRole.findOneAndDelete({
        userId,
        roleId,
        organizationId: null
    });

    if (!userRole) {
        throw new AppError("Role assignment not found", 404)
    }

    await recordAuditLog({
        userId: actedBy,
        action: AUDIT_ACTION.ROLE_REMOVED,
        entity: "UserRole",
        entityId: userRole._id,
        metadata: { targetUserId: userId, roleId }
    })

    return true;
}

export async function getUserRoles(userId) {
    const userRoles = await UserRole.find({
        userId,
        organizationId: null
    })
        .populate("roleId", "name description")
        .lean();

    return userRoles
        .filter((assignment) => assignment.roleId)
        .map((assignment) => ({
            id: assignment.roleId._id,
            name: assignment.roleId.name,
            description: assignment.roleId.description,
            assignedAt: assignment.createdAt
        }))
}

export async function getUserBasePermissionKeys(userId) {
    const permissions = await getBaseUserPermissionRecords(userId);

    return uniqueStrings(permissions.map((permission) => permission.name))
}

// Get user permission
export async function getUserPermissions(userId) {
    const [basePermissionKeys, deniedPermissionKeys] = await Promise.all([
        getUserBasePermissionKeys(userId),
        getUserDeniedPermissionKeys(userId)
    ]);

    if (!basePermissionKeys.length) {
        return []
    }

    if (!deniedPermissionKeys.length) {
        return basePermissionKeys;
    }

    const deniedPermissionSet = new Set(deniedPermissionKeys);

    return basePermissionKeys.filter(
        (permissionKey) => !deniedPermissionSet.has(permissionKey)
    );
}

export async function getUserAccessProfile(userId) {
    const [roles, permissions, deniedPermissions] = await Promise.all([
        getUserRoles(userId),
        getUserPermissions(userId),
        getUserDeniedPermissionKeys(userId)
    ]);

    return { 
        roles, 
        permissions,
        ...(deniedPermissions.length ? { deniedPermissions } : {})
     }
}