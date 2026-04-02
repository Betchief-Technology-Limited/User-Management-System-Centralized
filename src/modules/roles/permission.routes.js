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

 permissionRoutes.post(
    "/permissions",
    requirePermission("manage_permissions"),
    validate(createPermissionSchema),
    asyncHandler(createPermissionHandler)
 );

 permissionRoutes.get(
    "/permissions",
    requirePermission("manage_permissions"),
    asyncHandler(getPermissionsHandler)
 )

 export default permissionRoutes;