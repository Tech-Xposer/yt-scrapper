import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  channelUrl: {
    type: String,
    required: true,
    unique: true,
  },
  channelId: {
    type: String,
    required: true,
    unique: true,
  },
});

const Channel =
  mongoose.models.Channel || mongoose.model("Channel", channelSchema);

export default Channel;
