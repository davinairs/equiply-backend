const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const equipmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "equiply/equipments",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "equiply/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const uploadEquipmentImage = multer({
  storage: equipmentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadEquipmentImage, uploadProfileImage };
