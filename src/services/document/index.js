const DocumentSchema = require('../../models/document');
const { responseData, messageConstants } = require('../../constants');
const { logger } = require('../../utils');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


const uploadDocument = async (req, userData, res) => {
    return new Promise(async () => {
        try {
            // req.body['user_id'] = userData['_id'];
            //    const { user_id } = req.body;
            const files = req.files || [];
            if (files.length === 0) {
                logger.error(`No files uploaded in the request.`);
                return responseData.fail(res, messageConstants.FILE_MISSING, 400);
            }

            const documentDataList = await Promise.all(files.map(async (file) => {
                try {
                    const isImage = file.mimetype.startsWith('image/');
                    const uploadResult = await cloudinary.uploader.upload(file.path, {
                        resource_type: isImage ? 'image' : 'raw',
                        flags: 'attachment:false'
                    });

                    const fileUrl = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        ? `https://docs.google.com/viewer?url=${encodeURIComponent(uploadResult.secure_url)}&embedded=true`
                        : uploadResult.secure_url;


                    fs.unlinkSync(file.path);


                    return {
                        user_id: userData._id,
                        originalName: `${userData._id.toString()}_${file.originalname}` ,
                        size: file.size,
                        document_url: fileUrl,
                    };
                } catch (uploadError) {
                    logger.error(`Error uploading file: ${uploadError.message}`);
                    throw new Error(`Error uploading file: ${uploadError.message}`);
                }
            }));

            console.log('document list', documentDataList)
           try {
            const documents = await DocumentSchema.insertMany(documentDataList, { ordered: false });
            
            logger.info(`Documents uploaded successfully`);
            return responseData.success(res, documents, messageConstants.DOCUMENT_UPLOADED);
           } catch (err) {
            const uploadedDocuments = err.results.filter(e => e.originalName);
            const uploadedDocumentsName = uploadedDocuments.map(e => e.originalName);
                const notUploadedDocuments = documentDataList.filter(e => !uploadedDocumentsName.includes(e.originalName)).map(e => {return e.originalName.replace(`${userData._id.toString()}_`,'')});
                err.notUploadedDocuments = notUploadedDocuments || [];
                err.docLength = documentDataList?.length || 0;
                err.uploadDocuments = uploadedDocuments || [];
                throw err ;
           }
            
        } catch (err) {
            console.log(err.results);
            if (err.code === 11000) {
                
                if (err?.notUploadedDocuments && err?.notUploadedDocuments?.length) {
                    //const keys = Object.keys(err.keyValue);
                    logger.error(`${err?.notUploadedDocuments.join(', ')} already uploaded`);
                    if(err?.docLength == err?.notUploadedDocuments.length){
                        return responseData.fail(res, `${err?.notUploadedDocuments.join(', ')} already uploaded`, 403);
                    }else{
                        return responseData.success(res,err.uploadDocuments, `${err?.notUploadedDocuments.join(', ')} already uploaded`);
                    }
                   
                } else {
                    logger.error('err.keyValue is undefined or null');
                    console.error('err.keyValue is undefined or null', err.results);
                    return responseData.fail(res, 'An unknown error occurred', 400);
                }
            } else {
                logger.error(`Error during document upload: ${err.code}`);
                return responseData.fail(res, messageConstants.INTERNAL_SERVER_ERROR, 500);
            }
        }
        // });
    });
};

const getDocumentList = async (userData, res) => {
    return new Promise(async () => {
        try {
            const user_id = userData._id;

            const documents = await DocumentSchema.find(
                { user_id }
            )
            if (documents.length == 0) {
                logger.warn(`No files found for`);
                return responseData.fail(res, messageConstants.NO_FILES_FOUND, 404);
            }
            logger.info(messageConstants.FILES_FETCHED);
            return responseData.success(res, documents, messageConstants.FILES_FETCHED);
        } catch (error) {
            logger.error(`Error fetching files: ${error.message}`);
            return responseData.fail(res, messageConstants.INTERNAL_SERVER_ERROR, 500);
        }

    });
};

const deleteDocument = async (req, userData, res) => {
    return new Promise(async () => {
        const { _id } = req.params;
        const user_id = userData._id;
        try {
            const document = await DocumentSchema.findOneAndDelete({ _id, user_id });
            if (!document) {
                logger.warn(messageConstants.NO_FILES_FOUND);
                return responseData.fail(res, messageConstants.NO_FILES_FOUND, 404);
            }
            await cloudinary.uploader.destroy(document.originalName);
            return responseData.success(res, {}, messageConstants.FILE_DELETED_SUCCESSFULLY)

        } catch (error) {
            logger.error(`Error fetching files: ${error.message}`);
            return responseData.fail(res, messageConstants.INTERNAL_SERVER_ERROR);
        }
    });
}

const renameDocument = async (req, userData, res) => {
    return new Promise(async () => {
        const { _id } = req.params;
        const { newFilename } = req.body;
        const user_id = userData._id;
        try {
            console.log('user id ',user_id);
            console.log('new file name ',newFilename);
            const document = await DocumentSchema.findOneAndUpdate(
                { _id, user_id },
                { originalName: `${user_id.toString()}_${newFilename }`},
                { new: true }
            );
            if (!document) {
                logger.warn(messageConstants.NO_FILES_FOUND);
                return responseData.fail(res, messageConstants.NO_FILES_FOUND, 404);
            }
            return responseData.success(res, document, messageConstants.FILE_RENAMED_SUCCESSFULLY)

        } catch (error) {
            if (error.code === 11000) {
                logger.error(`Error fetching files: ${error.message}`);
                return responseData.fail(res, `The file with name '${newFilename}' already exists`, 403);
            }else{
                logger.error(`Error fetching files: ${error.message}`);
                return responseData.fail(res, messageConstants.INTERNAL_SERVER_ERROR);
            }
           
        }
    });
}

const getDocument = async (req, res) => {
    return new Promise(async () => {
        try {
            const { originalName } = req.params;
            const documentPath = path.join(__dirname, '../uploads', originalName);

             fs.access(documentPath, fs.constants.F_OK, (err) => {
                if (err) {
                    logger.error(messageConstants.NO_FILES_FOUND);
                    return responseData.fail(res, messageConstants.NO_FILES_FOUND, 404);
                }

                res.sendFile(documentPath, (err) => {
                    if (err) {
                        logger.error(`Error fetching files: ${err.message}`);
                        return responseData.fail(res, messageConstants.ERROR_SENDING_FILE);
                    }
                });
             });

        } catch (error) {
            logger.error(`Error fetching files: ${error.message}`);
            return responseData.fail(res, messageConstants.INTERNAL_SERVER_ERROR);
        }
    });
}



module.exports = {
    uploadDocument,
    getDocumentList,
    deleteDocument,
    renameDocument,
    getDocument,
}