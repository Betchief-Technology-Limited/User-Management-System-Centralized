import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import rateLimiter from "./middleware/rateLimiter.middleware.js";

const app = express();

//this one is for security
app.use(helmet());
app.use(cors())

//parsing
app.use(express.json())

//this is for logging
app.use(morgan("dev"));

//rate limiting
app.use(rateLimiter);

//Mounting
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", userRoutes)

//Error Handler 
app.use(errorHandler);

export default app;