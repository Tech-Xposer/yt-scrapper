import mongoose from "mongoose";

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    // If already connected or connecting, return
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1); // Exit the process with an error code
    });

    connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

  } catch (error) {
    console.error("Error while connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code
  }
}

export default dbConnect;
