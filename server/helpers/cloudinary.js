import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.APi_SECRET_KEY,
});

const storage = multer.memoryStorage();

async function imageUploadUtils(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return result;
}


async function uploadFiles(fileBuffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(fileBuffer);
  });
}

async function removeImage(imageUrl) {
  // Extract public_id from image URL
  const publicId = imageUrl.split("/").pop().split(".")[0];

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error removing image from Cloudinary:", error);
    throw new Error("Error deleting image from Cloudinary.");
  }
}


const upload = multer({ storage });

export { upload, imageUploadUtils, uploadFiles, removeImage };
