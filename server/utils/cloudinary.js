import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRECT,
});

// upload image and video
export const uploadMedia = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return uploadResponse;
  } catch (error) {
    console.log("====================================");
    console.log("ERROR IN CLOUDINARY", error);
    console.log("====================================");
  }
};

// delete image

export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("====================================");
    console.log("ERROR IN CLOUDINARY", error);
    console.log("====================================");
  }
};

// delete video
export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
  } catch (error) {
    console.log("====================================");
    console.log("ERROR IN CLOUDINARY", error);
    console.log("====================================");
  }
};
