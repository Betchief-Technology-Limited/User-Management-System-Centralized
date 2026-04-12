import { AppError } from "../../shared/errors/AppError.js";
import { verifyAccessToken } from "../auth/auth.utils.js";
import User from "../../database/model/user.model.js";

export const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Authorization token is required", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyAccessToken(token);
        const currentUser = await User.findById(decoded.sub)

        if (!currentUser) {
            return next(new AppError("Authenticated user no longer exists", 401))
        }

        req.user = decoded;
        req.currentUser = currentUser;
        next();
    } catch {
        next(new AppError("Invalid or expired access token", 401));
    }
};