import mongoose from "mongoose";


const permissionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        resource: {
            type: String,
            default: null,
            trim: true,
            lowercase: true
        },
        action: {
            type: String,
            default: null,
            trim: true,
            lowercase: true
        },
        description: {
            type: String
        }
    },
    { timestamps: true }
)

const Permission = mongoose.model("Permission", permissionSchema);
export default Permission