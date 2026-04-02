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

userRoutes.post(
    "/users",
    requirePermission("manage_users"),
    validate(createUserSchema),
    asyncHandler(createUserHandler)
);

userRoutes.get(
    "/users",
    requirePermission("manage_users"),
    asyncHandler(getUsersHandler)
);

userRoutes.get(
    "/users/:id",
    requirePermission("manage_users"), 
    asyncHandler(getUserHandler)
);

userRoutes.patch(
    "/users/:id",
    requirePermission("manage_users"),
    validate(updateUserSchema), 
    asyncHandler(updateUserHandler)
);

userRoutes.patch(
    "/users/:id/status",
    requirePermission("manage_users"),
    validate(updateUserStatusSchema),
    asyncHandler(updateUserStatusHandler)
);

userRoutes.delete(
    "/users/:id",
    requirePermission("manage_users"), 
    asyncHandler(deleteUserHandler)
);

export default userRoutes;