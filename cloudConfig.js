const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});




// Use CloudinaryStorage for file upload
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'NumetryTask',  // Folder to store uploaded files
        allowed_formats: ["png", "jpg", "jpeg"], // Supported formats
        // You can define `public_id` here if needed, or let Cloudinary auto-generate it.
    }
});

module.exports = {
    cloudinary,
    storage
};
