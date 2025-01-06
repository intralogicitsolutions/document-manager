const api = require('../../controllers/document');
const upload = require('../../middlewares/document_upload')
const { jsonWebToken } = require('../../middlewares');
const { urlConstants } = require('../../constants');

module.exports = (app) => {
    app.post(urlConstants.UPLOAD_DOCUMENT, jsonWebToken.validateToken, upload.array('files', 5),  api.uploadDocument);
    app.get(urlConstants.GET_DOCUMENT_LIST, jsonWebToken.validateToken, api.getDocumentList);
    app.delete(urlConstants.DELETE_DOCUMENT, jsonWebToken.validateToken, api.deleteDocument);
    app.put(urlConstants.RENAME_DOCUMENT, jsonWebToken.validateToken, api.renameDocument);
    app.get(urlConstants.GET_DOCUMENT, jsonWebToken.validateToken, api.getDocument);
}