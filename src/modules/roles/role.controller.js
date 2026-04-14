import successResponse from "../../shared/utils/apiResponse.js";
import { createRole, getRoles } from "./role.service.js";

export async function createRoleHandler(req, res) {
    const role = await createRole({
        ...req.validatedBody,
        createdBy: req.user.sub
    });

    return successResponse(res, "Role created successfully", { role }, 201);
}

export async function getRolesHandler(req, res) {
    const roles = await getRoles();

    return successResponse(res, "Role fetched successfully", { roles });
}