import Role from "../../database/model/role.model.js";
import Permission from "../../database/model/permission.model.js";
import RolePermission from "../../database/model/rolePermission.model.js";
import UserRole from "../../database/model/userRole.model.js";
import User from "../../database/model/user.model.js";
import { AppError } from "../../shared/errors/AppError.js";

export async function createRole({ name, description }) {
    const existingRole = await Role.findOne({ name });

    if (existingRole) {
        throw new AppError("Role already exists", 409)
    }

    const role = await Role.create({
        name,
        description
    })

    return role;
}

// Getting all roles created
export async function getRoles() {
    return Role.find().sort({ createdAt: -1 })
}

// Assigning permission to roles created
export async function assignPermissionToRole(roleId, permissionId) {
    const role = await Role.findById(roleId);
    if (!role) {
        throw new AppError("Role not found", 404);
    }

    const permission = await Permission.findById(permissionId);
    if (!permission) {
        throw new AppError("Permission not found", 404)
    }

    const existingAssignment = await RolePermission.findOne({
        roleId,
        permissionId
    })

    if (existingAssignment) {
        throw new AppError("Permission already assigned to role", 409)
    }

    const rolePermission = await RolePermission.create({
        roleId,
        permissionId
    });

    return rolePermission
}

// Assign role to user
export async function assignRoleToUser({ userId, roleId }) {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const role = await Role.findById(roleId);
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

    return userRole;
}

// Get user permission
export async function getUserPermissions(userId) {
    const userRoles = await UserRole.find({
        userId,
        organizationId: null
    });

    if (!userRoles.length) {
        return [];
    }

    const roleIds = userRoles.map((item) => item.roleId);

    const rolePermissions = await RolePermission.find({
        roleId: { $in: roleIds }
    });

    if (!rolePermissions.length) {
        return []
    }

    const permissionIds = rolePermissions.map((item) => item.permissionId);
    const permissions = await Permission.find({
        _id: { $in: permissionIds }
    });

    return [...new Set(permissions.map((permission) => permission.name))]
}