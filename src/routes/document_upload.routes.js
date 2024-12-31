// const express = require('express');
// const DocumentUploadRoute = express.Router();
const DocumentUploadRoute = require('express').Router();
const { VerifyToken } = require('../middlewares');

const DocumentUploadService = require('../services/document_upload.service');

DocumentUploadRoute.post('/upload', VerifyToken.validate_token, DocumentUploadService.uploadDocuments); 
DocumentUploadRoute.get('/files/:user_id', VerifyToken.validate_token, DocumentUploadService.getFiles); 
DocumentUploadRoute.delete('/files/:_id/:user_id', VerifyToken.validate_token, DocumentUploadService.deleteFile); 
DocumentUploadRoute.put('/files/:filename/:user_id', VerifyToken.validate_token, DocumentUploadService.renameFile);
DocumentUploadRoute.get('/uploads/:filename', VerifyToken.validate_token, DocumentUploadService.getDocument); 

module.exports = DocumentUploadRoute;   