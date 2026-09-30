import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: { type: String, default: 'Admin' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'superadmin' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

const Admin = mongoose.model('Admin', adminSchema)

export default Admin
