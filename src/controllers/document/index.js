const documentService = require('../../services/document');
const { logger } = require('../../utils');
const { getUserData } = require('../../middlewares');
const { messageConstants } = require('../../constants');

const uploadDocument = async (req, res) => {
    try {
        const userData = await getUserData(req, res);
        const response = await documentService.uploadDocument(req, userData, res);
        logger.info(`${messageConstants.RESPONSE_FROM} uploadDocument API`, JSON.stringify(response));
        res.send(response);

    } catch (err) {
        logger.error(`upload Document ${messageConstants.API_FAILED}`, err);
        res.send(err);
    }
}

const getDocumentList = async (req, res) => {
    try {
        const userData = await getUserData(req, res);
        const response = await documentService.getDocumentList(userData, res);
        logger.info(`${messageConstants.RESPONSE_FROM} getDocumentList API`, JSON.stringify(response));
        res.send(response);

    } catch (err) {
        logger.error(`get Document List ${messageConstants.API_FAILED}`, err);
        res.send(err);
    }
}

const deleteDocument = async (req, res) => {
    try {
        const userData = await getUserData(req, res);
        const response = await documentService.deleteDocument(req, userData, res);
        logger.info(`${messageConstants.RESPONSE_FROM} deleteDocument API`, JSON.stringify(response));
        res.send(response);
    } catch (err) {
        logger.error(`delete Document ${messageConstants.API_FAILED}`, err);
        res.send(err);
    }
}

const renameDocument = async (req, res) => {
    try {
        const userData = await getUserData(req, res);
        const response = await documentService.renameDocument(req, userData, res);
        logger.info(`${messageConstants.RESPONSE_FROM} renameDocument API`, JSON.stringify(response));
        res.send(response);
    } catch (err) {
        logger.error(`rename Document ${messageConstants.API_FAILED}`, err);
        res.send(err);
    }
}

const getDocument = async (req, res) => {
    try{
        const userData = await getUserData(req, res);
        const response = await documentService.getDocument(req, res);
        logger.info(`${messageConstants.RESPONSE_FROM} getDocument API`, JSON.stringify(response));
        res.send(response);
    }catch (err) {
        logger.error(`get Document ${messageConstants.API_FAILED}`, err);
        res.send(err);
    }
}

module.exports = {
    uploadDocument,
    getDocumentList,
    deleteDocument,
    renameDocument,
    getDocument,
}