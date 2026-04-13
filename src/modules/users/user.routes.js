import express from "express";
import asyncHandler from "../../middleware/async.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "../roles/rbac.middleware.js";
import {
    deleteUserHandler,
    getUserHandler,
    getUsersHandler,
    updateUserHandler,
    updateUserPermissionOverridesHandler,
    updateUserStatusHandler
} from "./user.controller.js";

import {
    updateUserSchema,
    updateUserPermissionOverridesSchema,
    updateUserStatusSchema
} from "./user.validation.js";

const userRoutes = express.Router();

userRoutes.use(requireAuth)

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 */
userRoutes.get(
    "/users",
    requirePermission("manage_users"),
    asyncHandler(getUsersHandler)
);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a single user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRoutes.get(
    "/users/:id",
    requirePermission("manage_users"),
    asyncHandler(getUserHandler)
);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 */
userRoutes.patch(
    "/users/:id",
    requirePermission("manage_users"),
    validate(updateUserSchema),
    asyncHandler(updateUserHandler)
);

/**
 * @openapi
 * /users/{id}/status:
 *   patch:
 *     tags: [Users]
 *     summary: Update user status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserStatusRequest'
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 */
userRoutes.patch(
    "/users/:id/status",
    requirePermission("manage_users"),
    validate(updateUserStatusSchema),
    asyncHandler(updateUserStatusHandler)
);

/**
 * @openapi
 * /users/{id}/permission-overrides:
 *   patch:
 *     tags: [Users]
 *     summary: Update denied permission overrides for a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPermissionOverridesRequest'
 *     responses:
 *       200:
 *         description: User permission overrides updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid override list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRoutes.patch(
    "/users/:id/permission-overrides",
    requirePermission("manage_users"),
    validate(updateUserPermissionOverridesSchema),
    asyncHandler(updateUserPermissionOverridesHandler)
);


/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 */
userRoutes.delete(
    "/users/:id",
    requirePermission("manage_users"),
    asyncHandler(deleteUserHandler)
);

export default userRoutes;