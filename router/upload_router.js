const express = require('express');
const multer = require('multer');
const path = require('path');
const { bucket } = require('../db');

const router = express.Router();

// Keep the file in memory and hand it to Firebase Storage, so images survive a
// Render restart (Render's own disk is ephemeral).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// POST /uploads — multipart form-data with a `file` field.
// Returns { url, path, contentType } where url is ready for <img>/<video>.
router.post('/uploads', (req, res) => {
  upload.single('file')(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({ message: uploadError.message || 'Upload failed' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (!/^(image|video)\//.test(file.mimetype)) {
      return res.status(400).json({ message: 'Only image or video files are allowed' });
    }

    try {
      const extension = path.extname(file.originalname).toLowerCase();
      const base = path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^\w.-]+/g, '_')
        .slice(0, 60) || 'file';
      const objectPath = `uploads/${Date.now()}-${base}${extension}`;
      const blob = bucket.file(objectPath);

      let url;
      try {
        await blob.save(file.buffer, {
          contentType: file.mimetype,
          resumable: false,
          public: true,
        });
        url = blob.publicUrl();
      } catch (publicError) {
        // Buckets with uniform access cannot take an object ACL; fall back to
        // a signed URL valid for seven days.
        await blob.save(file.buffer, {
          contentType: file.mimetype,
          resumable: false,
        });
        [url] = await blob.getSignedUrl({
          action: 'read',
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
      }

      res.status(201).json({ url, path: objectPath, contentType: file.mimetype });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
});

module.exports = router;
