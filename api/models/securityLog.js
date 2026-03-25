import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const securityLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    ip: { type: String, required: true },
    prompt: { type: String, required: true },
    status: {
      type: String,
      enum: ["allowed", "denied"],
      required: true,
    },
    reason: { type: String },
  },
  { timestamps: true },
);

securityLogSchema.plugin(mongoosePaginate);

export const securityLog = model(
  "SecurityLog",
  securityLogSchema,
  "security_logs",
);
