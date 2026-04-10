import successResponse from "../../shared/utils/apiResponse.js";
import {
    assignPermissionToRole,
    assignRoleToUser,
    createRole,
    getRoles
} from "./role.service.js";

export async function createRoleHandler(req, res) {
    const role = await createRole(req.validatedBody);

    return successResponse(res, "Role created successfully", { role }, 201)
}

export async function getRolesHandler(req, res) {
    const roles = await getRoles();

    return successResponse(res, "Role fetched successfully", { roles })
}

export async function assignPermissionToRoleHandler(req, res) {
    const rolePermission = await assignPermissionToRole(
        req.params.roleId,
        req.validatedBody.permissionId
    )

    return successResponse(res, "Permission assigned to role successfully", { rolePermission })
}

export async function assignRoleToUserHandler(req, res) {
    const userRole = await assignRoleToUser(req.validatedBody);

    return successResponse(res, "Role assigned to user successflly", { userRole })
}