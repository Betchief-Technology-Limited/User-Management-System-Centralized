import express from "express";
import asyncHandler from "../../middleware/async.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "../roles/rbac.middleware.js";
import {
    createUserHandler,
    deleteUserHandler,
    getUserHandler,
    getUsersHandler,
    updateUserHandler,
    updateUserStatusHandler
} from "./user.controller.js";

import {
    createUserSchema,
    updateUserSchema,
    updateUserStatusSchema
} from "./user.validation.js";

const userRoutes = express.Router();

userRoutes.use(requireAuth)

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Forbidden
 */
userRoutes.post(
    "/users",
    requirePermission("manage_users"),
    validate(createUserSchema),
    asyncHandler(createUserHandler)
);

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
 *       404:
 *         description: User not found
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
 */
userRoutes.patch(
    "/users/:id/status",
    requirePermission("manage_users"),
    validate(updateUserStatusSchema),
    asyncHandler(updateUserStatusHandler)
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
 */
userRoutes.delete(
    "/users/:id",
    requirePermission("manage_users"),
    asyncHandler(deleteUserHandler)
);

export default userRoutes;