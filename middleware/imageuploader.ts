import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import pLimit from "p-limit";
dotenv.config();

import { CloudinaryStorage } from "multer-storage-cloudinary";

const multerStorage = (folderName: string) =>
  new CloudinaryStorage({
    cloudinary,
    params: async (req: any, file: any) => {
      return {
        unique_filename: false,
        folder: folderName,
        format: "jpeg",
        allowed_formats: ["jpg"],
      };
    },
  });

export const storage = (folderName: string) => multerStorage(folderName);

export const upload = (folderName: string) =>
  multer({ storage: multerStorage(folderName) });

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
  secure: true,
});

export const cloudinaryImageDestroyMethod = async (file: string) => {
  return new Promise((resolve) => {
    const imagePublicId = file.substring(
      file.lastIndexOf("/", file.lastIndexOf("/") - 1) + 1,
      file.lastIndexOf(".")
    );
    return cloudinary.api.delete_resources(
      [imagePublicId],
      { type: "upload", resource_type: "image" },
      (_err: any, res: any) => {
        resolve({});
      }
    );
  });
};
