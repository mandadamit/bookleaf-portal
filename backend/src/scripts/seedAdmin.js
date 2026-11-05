
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const seedAdmin = async () => {
    try {
        if (!process.env.ADMIN_NAME || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            throw new Error("Admin environment variables are required");
        }
        if (process.env.ADMIN_PASSWORD.length <= 8) {
            throw new Error("Admin password must be at least 8 characters");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
        const existingAdmin = await User.findOne({ email });

        if(existingAdmin) {
            console.log("Admin account already exists:", email);
            return;
        }

        await User.create({
            name: process.env.ADMIN_NAME.trim(),email,
            password: process.env.ADMIN_PASSWORD,
            role: "ADMIN",
            isActive: true,
        });

        console.log("Admin account created successfully:", email);
    } catch (error) {
        console.error("Admin seed failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedAdmin();
