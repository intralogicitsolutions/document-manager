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

          const fileExtension = path.extname(file.originalname).toLowerCase();
  
          
          fs.unlinkSync(file.path);
  
          return {
            filename: file.filename, 
            filepath: fileUrl,  
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            extension: fileExtension,
            document_url: result.secure_url,
          };
        }));
  

        const savedFiles = await DocumentUpload.insertMany(fileDetails);
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
    try {
      const files = await DocumentUpload.find({}, 'filename originalName size document_url createdAt');
      res.status(200).json({ data: files });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching files',
        error: error.message,
      });
    }
  };

  // Delete a file
const deleteFile = async (req, res) => {
    const { _id } = req.params;
   // const filePath = path.join(__dirname, '../uploads', filename);
  
    try {
      const file = await DocumentUpload.findOneAndDelete({_id});
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      await cloudinary.uploader.destroy(file.filename);
      res.status(200).json({ message: 'File deleted successfully'});
  
    //   fs.unlink(filePath, (err) => {
    //     if (err) {
    //       return res.status(500).json({ message: 'Error deleting file from disk' });
    //     }
    //     res.status(200).json({ message: 'File deleted successfully' });
    //   });
    } catch (error) {
      res.status(500).json({
        message: 'Error deleting file',
        error: error.message,
      });
    }
  };

  // Rename a file
const renameFile = async (req, res) => {
    const { filename } = req.params;
    const { newFilename } = req.body;

    console.log('Filename:', filename); 
    console.log('New Filename:', newFilename); 

    if (!filename || !newFilename) {
        return res.status(400).json({ message: 'Filename and newFilename are required' });
    }
    const oldPath = path.join(__dirname, '../uploads', filename);
    const newPath = path.join(__dirname, '../uploads', newFilename);
    // fs.access(oldPath, fs.constants.F_OK, async (err) => {
        // if (err) {
        //     return res.status(404).json({ message: 'File does not exist' });
        // }
  
    try {
      const file = await DocumentUpload.findOneAndUpdate(
        { filename },
        { filename: newFilename, originalName: newFilename},
        { new: true }
      );
  
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      //await cloudinary.uploader.rename(filename, newFilename);
  
    //   fs.rename(oldPath, newPath, (err) => {
        // if (err) {
        //   return res.status(500).json({ message: 'Error renaming file on disk' });
        // }
        res.status(200).json({
          message: 'File renamed successfully',
          data: file,
        });
     // });
    } catch (error) {
      res.status(500).json({
        message: 'Error renaming file',
        error: error.message,
      });
    }
// });
  };

// const renameFile = async (req, res) => {
//   const { _id } = req.params;
//   const { newFilename } = req.body;

//   if (!newFilename) {
//     return res.status(400).json({ message: 'New filename is required' });
//   }

//   try {
//     // Find the file by _id
//     const file = await DocumentUpload.findById(_id);
//     if (!file) {
//       return res.status(404).json({ message: 'File not found in database' });
//     }

//     const oldPublicId = path.parse(file.filename).name; // Extract public_id without extension
//     const newPublicId = path.parse(newFilename).name; // Extract new public_id

//     console.log('Original Filename from DB:', file.filename);
//     console.log('Derived Old Public ID:', oldPublicId);
//     console.log('New Public ID:', newPublicId);

//     try {
//       await cloudinary.api.resource(oldPublicId);
//       console.log('File found on Cloudinary');
//     } catch (error) {
//       console.error('Cloudinary Error:', error);
//       return res.status(404).json({
//         message: 'File not found on Cloudinary',
//         error: error.message,
//       });
//     }

//     const renamedFile = await cloudinary.uploader.rename(oldPublicId, newPublicId);
//     console.log('File renamed successfully:', renamedFile);

//     file.filename = newFilename;
//     file.document_url = renamedFile.secure_url;
//     await file.save();

//     res.status(200).json({
//       message: 'File renamed successfully',
//       data: file,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Error renaming file',
//       error: error.message,
//     });
//   }
// };


  module.exports = {
    uploadDocuments,
    getDocument,
    getFiles,
    deleteFile,
    renameFile,
  };
  