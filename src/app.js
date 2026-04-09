import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import roleRoutes from "./modules/roles/role.routes.js";
import permissionRoutes from "./modules/roles/permission.routes.js";
import invitationRoutes from "./modules/invitations/invitation.routes.js";

import errorHandler from "./middleware/error.middleware.js";
import rateLimiter from "./middleware/rateLimiter.middleware.js";
import allowedCors from "./config/corsConfig.js";

const app = express();

//this one is for security
app.use(helmet());
app.use(cors())

//parsing
app.use(express.json())

//this is for logging
app.use(morgan("dev"));

//Cross Origin Resource Sharing
const corsOrigin = {
    origin: function (origin, callback){
        if(!origin) return callback(null, true);
        if(allowedCors.includes(origin)){
            return callback(null, true)
        } else{
            console.warn(`🚫 Cors blocked:, ${origin}` )
            return callback(null, false)
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOrigin))

//for preflight request
app.options(/.*/, cors(corsOrigin));

//rate limiting
app.use(rateLimiter);

//Mounting
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", roleRoutes);
app.use("/api/v1", permissionRoutes);
app.use("/api/v1", invitationRoutes);

//Error Handler 
app.use(errorHandler);

export default app;