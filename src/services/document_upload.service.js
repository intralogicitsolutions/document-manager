const { DocumentUpload } = require("../models");
const path = require('path'); 
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });

const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
  }).array('files', MAX_FILE_COUNT);


  const uploadDocuments = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        console.log(req.body);
        const { user_id } = req.body;
        console.log(user_id);
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        try {
            const fileDetails = await Promise.all(req.files.map(async (file) => {
                const isImage = file.mimetype.startsWith('image/');
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: isImage ? 'image' : 'raw',
                    flags: 'attachment:false'
                });

                const fileUrl = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(result.secure_url)}&embedded=true`
                    : result.secure_url;

                fs.unlinkSync(file.path);

                return {
                    user_id,
                    filename: file.filename,
                    filepath: fileUrl,
                    originalName: file.originalname,
                    size: file.size,
                    document_url: result.secure_url,
                };
            }));

            const filteredFileDetails = [];
            for (const file of fileDetails) {
                const exists = await DocumentUpload.findOne({
                    user_id: file.user_id,
                    originalName: file.originalName,
                    size: file.size
                });
                if (!exists) {
                    filteredFileDetails.push(file);
                }
            }

            if (filteredFileDetails.length === 0) {
                return res.status(400).json({ message: 'No new files to upload, duplicates detected' });
            }

            const savedFiles = await DocumentUpload.insertMany(filteredFileDetails);
            res.status(200).json({
                message: 'Files uploaded successfully',
                data: savedFiles,
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error uploading files',
                error: error.message,
            });
        }
    });
};

  const getDocument = (req, res) => {
     const { filename } = req.params;
        const documentPath = path.join(__dirname, '../uploads', filename);
    
        fs.access(documentPath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).json({ error: 'Image not found' });
            }
    
            res.sendFile(documentPath, (err) => {
                if (err) {
                    res.status(500).json({ error: 'Error sending image' });
                }
            });
        });
  };


  // Get list of files
  const getFiles = async (req, res) => {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const files = await DocumentUpload.find(
            { user_id },
            'filename originalName size document_url createdAt user_id'
        );

        res.status(200).json({ data: files });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching files',
            error: error.message,
        });
    }
};


const deleteFile = async (req, res) => {
    const { _id, user_id } = req.params;
   if (!user_id || !_id) {
    return res.status(400).json({ message: 'User ID and file ID are required' });
}
  
    try {
      const file = await DocumentUpload.findOneAndDelete({_id, user_id });
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      await cloudinary.uploader.destroy(file.filename);
      res.status(200).json({ message: 'File deleted successfully'});
  
    } catch (error) {
      res.status(500).json({
        message: 'Error deleting file',
        error: error.message,
      });
    }
  };

  // Rename a file
const renameFile = async (req, res) => {
    const { filename,  user_id } = req.params;
    const { newFilename } = req.body;

    console.log('Filename:', filename); 
    console.log('New Filename:', newFilename); 

    if (!user_id || !filename || !newFilename) {
        return res.status(400).json({ message: 'User ID, Filename and newFilename are required' });
    }
    try {
      const file = await DocumentUpload.findOneAndUpdate(
        { filename, user_id },
        { filename: newFilename, originalName: newFilename},
        { new: true }
      );
  
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

        res.status(200).json({
          message: 'File renamed successfully',
          data: file,
        });
    } catch (error) {
      res.status(500).json({
        message: 'Error renaming file',
        error: error.message,
      });
    }

  };


  module.exports = {
    uploadDocuments,
    getDocument,
    getFiles,
    deleteFile,
    renameFile,
  };
  