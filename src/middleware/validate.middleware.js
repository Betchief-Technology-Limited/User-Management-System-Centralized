import { AppError } from "../shared/errors/AppError.js";

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return next(
            new AppError(
                result.error.issues.map((issue) => issue.message).join(", "),
                400
            )
        );
    }

    req.validatedBody = result.data;
    next();
};