import { Schema, type Model, type Types } from "mongoose";
import { registerModel } from "@/lib/db/registerModel";

export interface IInstallationVideo {
  _id: Types.ObjectId;
  title: string;
  /** YouTube / Vimeo / direct video URL. */
  videoUrl: string;
  thumbnail: string;
  category: string;
  location: string;
  spec: string;
  summary: string;
  order: number;
  active: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IInstallationVideo>(
  {
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true, trim: true },
    thumbnail: { type: String, default: "" },
    category: { type: String, default: "Solar", trim: true, index: true },
    location: { type: String, default: "" },
    spec: { type: String, default: "" },
    summary: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

export const InstallationVideo: Model<IInstallationVideo> =
  registerModel<IInstallationVideo>("InstallationVideo", schema);
