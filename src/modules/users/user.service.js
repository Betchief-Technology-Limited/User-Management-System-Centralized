import User from "../../database/model/user.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import { hashPassword } from "../auth/auth.utils.js";

export async function createUser(data) {
    const existingUser = await User.findOne({ email: data.email })

    if (existingUser) {
        throw new Error("User already exists", 409)
    }

    const passwordHash = await hashPassword(data.password);

    const user = await User.create({
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName
    });

    return user;
}

export async function getUsers() {
    return User.find().select("-password")
}

export async function getUserById(userId) {
    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
        throw new Error("User not found", 404);
    }

    return user;
}

export async function updateUser(userId, data) {
    const user = await User.findByIdAndUpdate(
        userId,
        data, { new: true }
    ).select("-passwordHash")

    if (!user) {
        throw new Error("User not found", 404)
    }

    return user;
}

export async function updateUserStatus(userId, status) {
    const user = await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true }
    ).select("-passwordHash");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
}

export async function deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return true;
}