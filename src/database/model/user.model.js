import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type:String,
            enum: ["active", "inactive", "suspend"],
            default: "active"
        },
        emailVerified: {
            type: Boolean,
            default: false
        },
        profileImage: {
            type: String
        },
        metadata: {
            type: Object,
            default: {}
        },
        lastLoginAt: {
            type: Date,
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;