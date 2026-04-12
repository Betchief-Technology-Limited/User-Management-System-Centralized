import successResponse from "../../shared/utils/apiResponse.js";
import {
    assignPermissionToRole,
    assignRoleToUser,
    createRole,
    getRoles,
    removeRoleFromUser
} from "./role.service.js";

export async function createRoleHandler(req, res) {
    const role = await createRole({
        ...req.validatedBody,
        createdBy: req.user.sub
    });

    return successResponse(res, "Role created successfully", { role }, 201)
}

export async function getRolesHandler(req, res) {
    const roles = await getRoles();

    return successResponse(res, "Role fetched successfully", { roles })
}

export async function assignPermissionToRoleHandler(req, res) {
    const rolePermissions = await assignPermissionToRole(
        req.params.roleId,
        req.validatedBody.permissionIds,
        req.user.sub
    )

    return successResponse(res, "Permission assigned to role successfully", { rolePermissions })
}

export async function assignRoleToUserHandler(req, res) {
    const userRole = await assignRoleToUser({
        ...req.validatedBody,
        actedBy: req.user.sub
    });

    return successResponse(res, "Role assigned to user successflly", { userRole })
}

export async function removeRoleFromUserHandler(req, res) {
    await removeRoleFromUser({
        ...req.validatedParams,
        actedBy: req.user.sub
    });

    return successResponse(res, "Role removed from user successfully")
}