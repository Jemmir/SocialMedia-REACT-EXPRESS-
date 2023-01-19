import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dednzil9a",
  api_key: "872246924772818",
  api_secret: "WKKx4nrPl_1f43lh0Qu-xcw-JSE",
});

export const uploadImage = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: "posts",
  });
};

export const uploadVideo = async(filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: "posts",
  });
}

export const deleteImage = async (id) => {
  return await cloudinary.uploader.destroy(id);
};
