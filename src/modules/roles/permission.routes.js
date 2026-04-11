import express from "express";
import asyncHandler from "../../middleware/async.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "./rbac.middleware.js";
import {
   createPermissionHandler,
   getPermissionsHandler
} from "./permission.controller.js";
import { createPermissionSchema } from "./permission.validation.js";

const permissionRoutes = express.Router();

permissionRoutes.use(requireAuth);

/**
 * @openapi
 * /permissions:
 *   post:
 *     tags: [Permissions]
 *     summary: Create permission
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePermissionRequest'
 *     responses:
 *       201:
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 *       409:
 *         description: Permission already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
permissionRoutes.post(
   "/permissions",
   requirePermission("manage_permissions"),
   validate(createPermissionSchema),
   asyncHandler(createPermissionHandler)
);

/**
 * @openapi
 * /permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: Get all permissions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PermissionListResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
permissionRoutes.get(
   "/permissions",
   requirePermission("manage_permissions"),
   asyncHandler(getPermissionsHandler)
)

export default permissionRoutes;