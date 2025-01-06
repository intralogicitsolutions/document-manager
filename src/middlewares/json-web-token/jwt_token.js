const jwt = require('jsonwebtoken');
const { responseData, messageConstants } = require('../../constants');
const { logger } = require('../../utils');

function generateToken(id) {
    let jwtSecretKey = process.env.JWT_SECRET;
    let data = {
        time: Date(),
        userId: id
    }
    const token = jwt.sign(data, jwtSecretKey);
    logger.info(messageConstants.TOKEN_GENERATED);
    return token;
}

function validateToken(req, res, next, userToken = '') {
    try {
        let jwtSecretKey = process.env.JWT_SECRET;
        const token = req.header('token') || userToken;
        if (token) {
            const verified = jwt.verify(token, jwtSecretKey);
            if (verified) {
                logger.info(messageConstants.TOKEN_VALIDATED);
                next();
            } else {
                logger.error(`${messageConstants.USER_NOT_FOUND} ${messageConstants.TOKEN_EXPIRED}`);
                res.status(401).send(responseData.unauthorized)
            }
        } else {
            res.status(400).send(responseData.tokenRequired)
        }

    } catch (error) {
        logger.error(messageConstants.TOKEN_EXPIRED);
        res.status(401).send(responseData.unauthorized)
    }
}


module.exports = {
    createToken: generateToken,
    validateToken: validateToken,
}