import { Schema, model } from "mongoose";
import moongosePaginate from "mongoose-paginate-v2";
const articleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  image: { type: String, default: "default.png" },
  creatorIp: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

articleSchema.plugin(moongosePaginate);

export const article = model("Article", articleSchema, "articles");
