import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new Schema({
  name: { type: String, required: false },
  surname: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  nick: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "default.png" },
  createdAt: { type: Date, default: Date.now },
  bio: { type: String },
  role: { type: String, enum: ["user", "superadmin"], default: "user" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  refreshToken: { type: String, default: null },
  refreshTokenExpiresAt: { type: Date, default: null },
});

userSchema.plugin(mongoosePaginate);

export const user = model("User", userSchema, "users");
