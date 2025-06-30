import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', protect, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded.' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `ai_kitchen_hub/${req.user._id}` }, 
        (error, result) => {
            if (error) {
                console.error('Cloudinary Upload Error:', error);
                return res.status(500).json({ message: 'Error uploading to image host.' });
            }
            res.status(201).json({ url: result.secure_url });
        }
    );

    uploadStream.end(req.file.buffer);
});

export default router;
