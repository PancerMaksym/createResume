import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI || "";

export const connectDB = async () => {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log("🎉 connected to database successfully");
    }
  } catch (error) {
    console.error(error);
  }
};

connectDB();
