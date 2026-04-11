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

/**
 * @openapi
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleRequest'
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 *       409:
 *         description: Role already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
roleRoutes.post(
    "/roles",
    requirePermission("manage_roles"),
    validate(createRoleSchema),
    asyncHandler(createRoleHandler)
);


/**
 * @openapi
 * /roles/all:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleListResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
roleRoutes.get(
    "/roles/all",
    requirePermission("manage_roles"),
    asyncHandler(getRolesHandler)
);

/**
 * @openapi
 * /roles/{roleId}/permissions:
 *   post:
 *     tags: [Roles]
 *     summary: Assign permission to role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignPermissionToRoleRequest'
 */
roleRoutes.post(
    "/roles/:roleId/permissions",
    requirePermission("manage_roles"),
    validate(assignPermissionToRoleSchema),
    asyncHandler(assignPermissionToRoleHandler)
)

/**
 * @openapi
 * /user-roles:
 *   post:
 *     tags: [Roles]
 *     summary: Assign role to user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignRoleToUserRequest'
 */
roleRoutes.post(
    "/user-roles",
    requirePermission("manage_users"),
    validate(assignRoleToUserSchema),
    asyncHandler(assignRoleToUserHandler)
)

export default roleRoutes