const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const protect = require('../middleware/authMiddleware');

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Configure Multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- IMAGE UPLOAD ENDPOINT ---
// This route will handle the actual file upload process.
// It uses 'upload.single("image")' to expect one file named "image".
router.post('/', protect, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded.' });
    }

    // Use a stream to upload the file buffer to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `ai_kitchen_hub/${req.user._id}` }, // Organize uploads into user-specific folders
        (error, result) => {
            if (error) {
                console.error('Cloudinary Upload Error:', error);
                return res.status(500).json({ message: 'Error uploading to image host.' });
            }
            // Send back the secure URL of the hosted image
            res.status(201).json({ url: result.secure_url });
        }
    );

    // Pipe the file buffer from memory into the upload stream
    uploadStream.end(req.file.buffer);
});

module.exports = router;
