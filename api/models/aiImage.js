import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const aiImageSchema = new Schema({
  prompt: { type: String, required: true },
  filename: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  creatorIp: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

aiImageSchema.plugin(mongoosePaginate);

export const aiImage = model("AiImage", aiImageSchema, "ai_images");
