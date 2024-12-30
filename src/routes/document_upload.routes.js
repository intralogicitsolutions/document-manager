const express = require('express');
const DocumentUploadRoute = express.Router();

const DocumentUploadService = require('../services/document_upload.service');

DocumentUploadRoute.post('/upload', DocumentUploadService.uploadDocuments); 
DocumentUploadRoute.get('/files', DocumentUploadService.getFiles); 
DocumentUploadRoute.delete('/files/:_id', DocumentUploadService.deleteFile); 
DocumentUploadRoute.put('/files/:filename', DocumentUploadService.renameFile);
DocumentUploadRoute.get('/uploads/:filename', DocumentUploadService.getDocument); 

module.exports = DocumentUploadRoute;