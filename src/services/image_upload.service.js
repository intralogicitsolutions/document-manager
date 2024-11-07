const { ImageUpload } = require("../models");
const path = require('path'); 

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});


const upload = multer({ storage: storage });

const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const img_url = `${req.protocol}://${req.get('host')}/images/uploads/${req.file.filename}`;

  const image = new ImageUpload({
    filename: req.file.filename,
    path: req.file.path,
    originalName: req.file.originalname,  
    img_url: img_url,
  });


  image.save()
    .then((result) => {
      res.status(200).json({
        message: 'Image uploaded successfully',
        data: {
          _id: result._id,
          filename: result.filename,
          path: result.path,
          originalName: result.originalName,
          img_url: result.img_url,
        }
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error uploading image',
        error: error.message,
      });
    });
};

module.exports = {
  uploadImage,
  upload, 
};
