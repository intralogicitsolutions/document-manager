const { Response } = require("../middlewares");
const { StatusCodes, ResponseMessage } = require("../constants");
const { Users } = require("../models");
const { EncDec } = require("../helper");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
// const { v4: uuidv4 } = require('uuid');

class AuthService { }

AuthService.signup = async (req, res) => {
    const body = req.body;
    const { email_id, password, } = body;

    const data = await Users.find({ email_id });
    if (data && data?.length) {
        return Response.errors(req, res, StatusCodes.HTTP_BAD_REQUEST, ResponseMessage.USER_ALREADY_EXISTS);
    }

    const encryptedPassword = await EncDec.hash_password(password);
    body['password'] = encryptedPassword;

    if (req.file) {
        body['image_path'] = req.file.path; // Use the path from multer
    }

    const user = await new Users(body).save();
    delete user._doc.password;
    Response.success(req, res, StatusCodes.HTTP_OK, ResponseMessage.SUCCESS, user);
}

AuthService.signin = async (req, res) => {
    const { email_id, password } = req.body;
    let user = await Users.findOne({ email_id });
    console.log("user :: ", user);
    user = user._doc;
    let isMatch = await EncDec.compare_passwords(password, user.password);
    if (!isMatch) {
        return Response.errors(req, res, StatusCodes.HTTP_BAD_REQUEST, ResponseMessage.INCORRECT_PASSWORD);
    }

    delete user.password;
    const jwt_token = await generateAuthToken(user);
    console.log("jwt_token :", jwt_token);
    user['access_token'] = jwt_token;
    console.log(user['access_token']);

    Response.success(req, res, StatusCodes.HTTP_OK, ResponseMessage.SUCCESS, user);
}


AuthService.forgotPassword = async (req, res) => {
    try {
        const { email_id } = req.body;

        const user = await Users.findOne({ email_id });
        if (!user) {
            return Response.errors(req, res, StatusCodes.HTTP_NOT_FOUND, ResponseMessage.USER_NOT_FOUND);
        }

        const otp = Math.floor(1000 + Math.random() * 9000);
        user.otp = otp;
        user.otp_expires = Date.now() + 10 * 60 * 1000;
        await user.save();
        
        const emailBody = `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`;
        await sendResetEmail(req, res, email_id, emailBody); 

    } catch (error) {
        console.error("Forgot password error: ", error);
        return Response.errors(req, res, StatusCodes.HTTP_INTERNAL_SERVER_ERROR, "Internal Server Error");
    }
}


AuthService.resetPassword = async (req, res) => {
    
    const { otp, new_password, email_id } = req.body;

    try {
      
       
        const user = await Users.findOne({ email_id, otp });

        if (!user) {
            return Response.errors(req, res, StatusCodes.HTTP_BAD_REQUEST, ResponseMessage.INVALID_OTP);
        }

       
        if (user.otp_expires && user.otp_expires < Date.now()) {
            return Response.errors(req, res, StatusCodes.HTTP_BAD_REQUEST, ResponseMessage.OTP_EXPIRED);
        }

        const encryptedPassword = await EncDec.hash_password(new_password);
        user.password = encryptedPassword;
       
        user.otp = null;
        user.otp_expires = null;
        await user.save();

        return Response.success(req, res, StatusCodes.HTTP_OK, ResponseMessage.PASSWORD_UPDATED);
    } catch (error) {
        return Response.errors(req, res, StatusCodes.HTTP_BAD_REQUEST, ResponseMessage.INVALID_OTP);
    }
}



const generateAuthToken = async (user) => {

    let jwt_token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '8h' });
    return jwt_token;
}

const sendResetEmail = async (req, res, email, message, resetToken) => {
    console.log('SMTP Credentials:',process.env.SMTP_USER, process.env.SMTP_PASS)
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 465,
            secure: true, 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
        });

        let mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Password Reset Request',
            text: message
        };

         transporter.sendMail(mailOptions,(error, info) => {
            if (error) {
                console.error("Error sending email:", error); // Log the error
                return res.status(400).json({ status: 400, message: "Error sending email." });
            }
            console.log("Email sent:", info.response);
            res.status(200).json({resetToken, status: 200, message: "OTP sent successfully!" });
        });

        
    } catch (error) {
        console.error("Error sending email: ", error);
        return Response.errors(req, res, StatusCodes.HTTP_BAD_REQUEST, "Error sending email.");
    }
}



module.exports = AuthService;