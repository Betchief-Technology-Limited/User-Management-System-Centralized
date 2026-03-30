import { AppError } from "../../shared/errors/AppError.js";
import { verifyAccessToken } from "../auth/auth.utils.js";
export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Authorization token is required", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch {
        next(new AppError("Invalid or expired access token", 401));
    }
};