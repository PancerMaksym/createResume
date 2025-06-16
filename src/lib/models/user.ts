import { ObjectId } from "mongodb";
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resume: {
        photo: { type: String, default: "" },
        name: { type: String, default: "" },
        place: { type: [String], default: [] },
        tags: { type: [String], default: [] },
        HTMLpart: { type: [[String]], default: [[]] }
    }
})

export default mongoose.models.UserModel || mongoose.model("UserModel", userSchema);