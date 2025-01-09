const UserSchema = require('../../models/user');
const { responseData, mailSubjectConstants, mailTemplateConstants, messageConstants } = require('../../constants');
const { jsonWebToken, cryptoGraphy } = require('../../middlewares');
const { logger, mail } = require('../../utils');
const { response } = require('express');
const cloudinary = require('cloudinary').v2;

const signUp = async (body, file, res) => {
    return new Promise(async () => {

        if (file) {
            const result = await cloudinary.uploader.upload(file.path, {
                resource_type: 'auto', 
            });
            body.image_path = result.secure_url;
        }
        body['password'] = cryptoGraphy.encrypt(body.password);
       
        const userSchema = new UserSchema(body);

        await userSchema.save().then(async (result) => {

            logger.info(`User ${body['first_name']} ${body['last_name']} created successfully with ${body['email']}`);
            return responseData.success(res, result, messageConstants.USER_CREATED);

        }).catch((err) => {
            if (err.code === 11000) {
                logger.error(`${Object.keys(err.keyValue)} already exists`);
                return responseData.fail(res, `${Object.keys(err.keyValue)} already exists `, 403);
            } else {
                logger.error(messageConstants.INTERNAL_SERVER_ERROR, err);
                return responseData.fail(res, messageConstants.INTERNAL_SERVER_ERROR);
            }
        })
    })
}

const signIn = async (body, res) => {
    return new Promise(async () => {
        body['password'] = cryptoGraphy.encrypt(body.password);
        await UserSchema.find({
            email_id: body.email_id,
            password: body.password
        }).then(async (result) => {
            if (result.length !== 0 && !result[0]['is_deleted']) {
                await createJsonWebTokenForUser(result[0])
                logger.info(`User ${result[0]['first_name']} ${result[0]['last_name']} ${messageConstants.LOGGEDIN_SUCCESSFULLY}`);
                return responseData.success(res, result, `User ${messageConstants.LOGGEDIN_SUCCESSFULLY}`);
            } else {
                logger.error(messageConstants.EMAIL_PASS_INCORRECT);
                return responseData.fail(res, messageConstants.EMAIL_PASS_INCORRECT, 401)
            }
        }).catch((err) => {
            logger.error(messageConstants.USER_NOT_FOUND, err);
            return responseData.fail(res, messageConstants.USER_NOT_FOUND, 404)
        })
    })
}

const forgotPassword = async (req, res, next) => {
    return new Promise(async () => {
        const user = await UserSchema.findOne({ email_id: req.body.email_id })
        if (user) {
            if (user.token) {
                await jsonWebToken.validateToken(req, res, next, user.token)
            } else {
                await createJsonWebTokenForUser(user);
            }
            await forgotPasswordLink(res, user);
        } else {
            logger.error(messageConstants.USER_NOT_FOUND);
            return responseData.fail(res, messageConstants.USER_NOT_FOUND, 404)
        }
    })
}

const changePassword = async (body, user, res) => {
    return new Promise(async () => {
        body['new_password'] = cryptoGraphy.encrypt(body.new_password);
        await UserSchema.findOneAndUpdate(
            { _id: user._id },
            { password: body['new_password']}
        ).then(async (result) => {
                if (result.length !== 0) {
                    const mailContent = {
                        first_name: user.first_name,
                        last_name: user.last_name
                    }
                    // await mail.sendMailToUser(mailTemplateConstants.FORGOTTED_PASS_TEMPLATE, user.email_id, mailSubjectConstants.FORGOTTED_PASS_SUBJECT, res, mailContent);
                    logger.info(`${messageConstants.PASSWORD_FORGOT} for ${user.email_id}`);
                    return responseData.success(res, {}, messageConstants.PASSWORD_FORGOT);
                } else {
                    logger.error(`${messageConstants.PASSWORD_NOT_FORGOT} for ${user.email_id}`);
                    return responseData.fail(res, messageConstants.PASSWORD_NOT_FORGOT, 403)
                }
            })
    })
}

const resetPassword = async (body, userData, res) => {
    return new Promise(async () => {
        body['old_password'] = cryptoGraphy.encrypt(body.old_password);
        const user = await UserSchema.findOne({_id: userData._id})
        if(body.old_password !== user.password){
            logger.error(`${messageConstants.OLD_PASSWORD_NOT_MATCHED} with ${body.old_password}`);
            return responseData.fail(res, messageConstants.OLD_PASSWORD_NOT_MATCHED, 403)
        }else{
            body['new_password'] = cryptoGraphy.encrypt(body.new_password);
            await UserSchema.findOneAndUpdate(
                { _id: user._id },
                { password: body['new_password'] }
            ).then(async (result) => {
                if (result.length !== 0) {
                    const mailContent = {
                      first_name: user.first_name,
                      last_name: user.last_name
                    }
                    // await mail.sendMailToUser(mailTemplateConstants.RESET_PASS_TEMPLATE, user.email, mailSubjectConstants.RESET_PASS_SUBJECT, res, mailContent);
                    logger.info(`${messageConstants.PASSWORD_RESET} for ${user.email_id}`);
                    return responseData.success(res, {}, messageConstants.PASSWORD_RESET);
                } else {
                    logger.error(`${messageConstants.PASSWORD_NOT_RESET} for ${user.email_id}`);
                    return responseData.fail(res, messageConstants.PASSWORD_NOT_RESET, 403)
                }
            })
        }
    })
}

const deleteAccount = async (body, userData, res) => {
    return new Promise(async () => {
        try{
            const user_id = userData._id;
            const {  first_name, reason } = body;

            const user = await UserSchema.findOne({ 
                _id: user_id, 
                first_name
            });
           
            if (!user) {
                logger.warn(messageConstants.USER_NOT_FOUND);
                return responseData.fail(res, messageConstants.USER_NOT_FOUND, 404);
            }

            user.is_deleted = true;
            await user.save().then(async () => {
                logger.info(`Account for firstName ${first_name} marked as deleted. Reason: ${reason}`);
                return responseData.success(res, {}, messageConstants.ACCOUNT_DELETED_SUCCESSFULLY);
            });

        }catch (err){
            logger.error(`Error deleting account: ${err.message}`);
            return responseData.fail(res, messageConstants.INTERNAL_SERVER_ERROR, 500);
        }

    })
}

const editUser = async (body, file, userData, res) => {
    return new Promise(async () => {
        try {
            if (file) {
                const result = await cloudinary.uploader.upload(file?.path, {
                    resource_type: 'auto', 
                });
                body.image_path = result?.secure_url;
            }
           await UserSchema.findByIdAndUpdate(
                { _id: userData?._id },
                body,
                { new: true}
            ).then(async () => {
                logger.info(`${messageConstants.UPDATE_USER}`);
               return responseData.success(res, body, messageConstants.UPDATE_USER);
            });
        } catch (err) {
            if(err.code === 11000){
                logger.error(`${Object.keys(err.keyValue)} already exists`);
                return responseData.fail(res, `This emailId '${body.email_id}' already exists `, 403);
            }
            logger.error(messageConstants.INTERNAL_SERVER_ERROR, err);
                return responseData.fail(res, messageConstants.INTERNAL_SERVER_ERROR);
        }
    });
}


const createJsonWebTokenForUser = async (user) => {
    user['token'] = await jsonWebToken.createToken(user['_id'])
    await UserSchema.updateOne({
        _id: user['_id']
    }, { $set: { token: user['token'] } });
}

const forgotPasswordLink = async (res, user) => {
    const link = `${process.env.BASE_URL}/change-password/${user._id}/${user.token}`;
    const mailContent = {
        first_name: user.first_name,
        last_name: user.last_name,
        link: link
    }
    console.log('link ', link);
    console.log('User email:', user.email_id); 

    if (!user.email_id) {
        logger.error("User email is missing");
        return responseData.error(res, {}, "Email address is missing for the user.");
    }
   await mail.sendMailToUser(mailTemplateConstants.FORGOT_PASS_TEMPLATE, user.email_id, mailSubjectConstants.FORGOT_PASS_SUBJECT, res, mailContent);
    return responseData.success(res, {}, messageConstants.EMAIL_SENT_FORGOT_PASSWORD);
}

module.exports = {
    signUp,
    signIn,
    forgotPassword,
    changePassword,
    resetPassword,
    deleteAccount,
    editUser,
}