import mongoose from "mongoose";

const moviesSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel", // Reference to the Channel schema
    required: true,
  },
  query: [
    {
      type: String,
    },
  ],
  url:{
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  downloadStatus:{
    type: String,
    default: "pending",
    enum: ["pending", "completed", "failed"],
  }
});

const Movies = mongoose.models.Movies || mongoose.model("Movies", moviesSchema);

export default Movies;
