import express from "express";
import asyncHandler from "../../middleware/async.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "./rbac.middleware.js";
import {
    createRoleHandler,
    getRolesHandler
} from "./role.controller.js";
import { createRoleSchema } from "./role.validation.js";

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
 *       - cookieAuth: []
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
 *               $ref: '#/components/schemas/RoleResponse'
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
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleListResponse'
 */
roleRoutes.get(
    "/roles/all",
    requirePermission("manage_roles"),
    asyncHandler(getRolesHandler)
);

export default roleRoutes;