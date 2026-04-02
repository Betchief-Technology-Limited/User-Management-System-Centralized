import express from "express";
import asyncHandler from "../../middleware/async.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "./rbac.middleware.js";
import { 
    assignPermissionToRoleHandler,
    assignRoleToUserHandler,
    createRoleHandler,
    getRolesHandler
 } from "./role.controller.js";
 import { 
    assignPermissionToRoleSchema,
    assignRoleToUserSchema,
    createRoleSchema
 } from "./role.validation.js";

 const roleRoutes = express.Router();

 roleRoutes.use(requireAuth);

 roleRoutes.post(
    "/roles", 
    requirePermission("manage_roles"),
    validate(createRoleSchema),
    asyncHandler(createRoleHandler)
);

roleRoutes.get(
    "/roles/all",
    requirePermission("manage_roles"),
    asyncHandler(getRolesHandler)
);

roleRoutes.post(
    "/roles/roleId/permissions",
    requirePermission("manage_roles"),
    validate(assignPermissionToRoleSchema),
    asyncHandler(assignPermissionToRoleHandler)
)

roleRoutes.post(
    "user-roles",
    requirePermission("manage_users"),
    validate(assignRoleToUserSchema),
    asyncHandler(assignRoleToUserHandler)
)

export default roleRoutes