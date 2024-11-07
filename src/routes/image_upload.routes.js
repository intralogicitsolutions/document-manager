const express = require('express');
const ImageUploadRoute = express.Router();

const ImageUploadService = require('../services/image_upload.service');
const path = require('path');
const fs = require('fs');

ImageUploadRoute.post('/upload',ImageUploadService.upload.single('images'), ImageUploadService.uploadImage);

ImageUploadRoute.get('/uploads/:filename', (req, res) => {
    const { filename } = req.params;
    const imagePath = path.join(__dirname, '../uploads', filename);

    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.sendFile(imagePath, (err) => {
            if (err) {
                res.status(500).json({ error: 'Error sending image' });
            }
        });
    });
});

module.exports = ImageUploadRoute;