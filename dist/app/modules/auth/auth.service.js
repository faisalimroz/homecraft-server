"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.resetPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const generateResetToken_1 = require("../../../helpers/generateResetToken");
const sendMail_1 = require("../../utils/sendMail");
const Signup = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { fName, lName, email, password, contactNo } = data;
    const isEmailExist = yield prisma_1.default.user.findFirst({
        where: {
            email,
        },
    });
    if (isEmailExist) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Email already exits');
    }
    let { profileImg } = data;
    let images = [];
    if (typeof profileImg === 'string') {
        images.push(profileImg);
    }
    else {
        images = profileImg;
    }
    if (!profileImg) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please Select Image');
    }
    const imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
        const result = yield cloudinary_1.default.v2.uploader.upload(images[i], {
            folder: 'Home Crafter/Auth/User',
        });
        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }
    profileImg = imagesLinks.map(image => image.url);
    const hashedPassword = yield bcrypt_1.default.hash(password, Number(config_1.default.bycrypt_salt_rounds));
    const result = yield prisma_1.default.user.create({
        data: {
            fName,
            lName,
            email,
            password: hashedPassword,
            contactNo,
            profileImg,
            createdAt: new Date(),
        },
    });
    return result;
});
const ProviderSignup = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { fName, lName, email, password, contactNo, gender, dob, bio, categoryId, address } = data;
    const isEmailExist = yield prisma_1.default.user.findFirst({
        where: {
            email,
        },
    });
    if (isEmailExist) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Email already exits');
    }
    let { profileImg } = data;
    let images = [];
    if (typeof profileImg === 'string') {
        images.push(profileImg);
    }
    else {
        images = profileImg;
    }
    if (!profileImg) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please Select Image');
    }
    const imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
        const result = yield cloudinary_1.default.v2.uploader.upload(images[i], {
            folder: 'Home Crafter/Auth/Provider',
        });
        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }
    profileImg = imagesLinks.map(image => image.url);
    const hashedPassword = yield bcrypt_1.default.hash(password, Number(config_1.default.bycrypt_salt_rounds));
    const result = yield prisma_1.default.provider.create({
        data: {
            fName,
            lName,
            email,
            password: hashedPassword,
            contactNo,
            profileImg,
            gender,
            dob,
            bio,
            categoryId,
            address
        },
    });
    return result;
});
const LoginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    // Check if the user exists
    const isUserExist = yield prisma_1.default.user.findFirst({
        where: {
            email,
        },
    });
    // Check if the provider exists
    const isProviderExist = yield prisma_1.default.provider.findFirst({
        where: {
            email,
        },
    });
    // If neither user nor provider exists, throw an error
    if (!isUserExist && !isProviderExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User or Provider does not exist');
    }
    // Variables to store the tokens and role
    let token;
    let refreshToken;
    let role;
    if (isUserExist) {
        // Check the password for the user
        if (!(yield bcrypt_1.default.compare(password, isUserExist.password))) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Email or Password is incorrect');
        }
        // Generate tokens for the user
        const { id: userId } = isUserExist;
        role = isUserExist.role;
        token = jwtHelpers_1.jwtHelpers.createToken({ userId, role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
        refreshToken = jwtHelpers_1.jwtHelpers.createToken({ userId, role }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    }
    else if (isProviderExist) {
        // Check the password for the provider
        if (!(yield bcrypt_1.default.compare(password, isProviderExist.password))) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Email or Password is incorrect');
        }
        // Check the approval status for the provider
        const { approvalStatus } = isProviderExist;
        if (approvalStatus === 'Pending') {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Your account is pending approval. Please wait for admin approval.');
        }
        if (approvalStatus === 'Rejected') {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Your account has been rejected. Please contact support for further assistance.');
        }
        // Generate tokens for the provider
        const { id: providerId } = isProviderExist;
        role = isProviderExist.role;
        token = jwtHelpers_1.jwtHelpers.createToken({ providerId, role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
        refreshToken = jwtHelpers_1.jwtHelpers.createToken({ providerId, role }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    }
    else {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'An unexpected error occurred');
    }
    // Return the tokens
    return {
        token,
        refreshToken,
    };
});
const LoginProvider = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const isProviderExist = yield prisma_1.default.provider.findFirst({
        where: {
            email,
        },
    });
    console.log(isProviderExist);
    if (!isProviderExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Provider does not exist');
    }
    if (isProviderExist.password &&
        !(yield bcrypt_1.default.compare(password, isProviderExist.password))) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Email or Password is incorrect');
    }
    // Check the approval status
    const { approvalStatus } = isProviderExist;
    if (approvalStatus === 'Pending') {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Your account is pending approval. Please wait for admin approval.');
    }
    if (approvalStatus === 'Rejected') {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Your account has been rejected. Please contact support for further assistance.');
    }
    const { id: providerId, role } = isProviderExist;
    const token = jwtHelpers_1.jwtHelpers.createToken({ providerId, role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.createToken({ providerId, role }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        token,
        refreshToken,
    };
});
const RefreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    //verify token
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.refresh_secret);
    }
    catch (err) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Invalid Refresh Token');
    }
    // console.log(verifiedToken);
    const { userId } = verifiedToken;
    // checking deleted user's refresh token
    const isUserExist = yield prisma_1.default.user.findFirst({
        where: {
            id: userId,
        },
    });
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    //generate new token
    const { id, role } = isUserExist;
    const newAccessToken = jwtHelpers_1.jwtHelpers.createToken({
        id: id,
        role: role,
    }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    return {
        token: newAccessToken,
    };
});
const changePassword = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { oldPassword, newPassword } = payload;
    // Check if user exists
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: { id: id },
    });
    // Variable to check if user or provider
    let isProvider = false;
    // If user not found, check if provider exists
    if (!isUserExist) {
        const isProviderExist = yield prisma_1.default.provider.findUnique({
            where: { id: id },
        });
        if (!isProviderExist) {
            throw new Error('User or Provider does not exist');
        }
        isProvider = true; // Mark as a provider
    }
    // Check old password for both user and provider
    const passwordToCompare = isProvider
        ? (_a = (yield prisma_1.default.provider.findUnique({ where: { id } }))) === null || _a === void 0 ? void 0 : _a.password
        : isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.password; // Use optional chaining to avoid null errors
    // Check if passwordToCompare is available before comparing
    if (passwordToCompare && !(yield bcrypt_1.default.compare(oldPassword, passwordToCompare))) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Old Password is incorrect');
    }
    // Hash the new password
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10); // You can adjust the salt rounds as needed
    // Update password in the appropriate table
    if (isProvider) {
        yield prisma_1.default.provider.update({
            where: { id: id },
            data: {
                password: hashedPassword,
            },
        });
    }
    else if (isUserExist) { // Ensure isUserExist is not null before updating
        yield prisma_1.default.user.update({
            where: { id: id },
            data: {
                password: hashedPassword,
            },
        });
    }
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    let userOrProvider = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    let isUser = true;
    // If no user is found, check if it's a provider
    if (!userOrProvider) {
        isUser = false;
        userOrProvider = yield prisma_1.default.provider.findUnique({
            where: { email },
        });
    }
    // If neither user nor provider found, throw an error
    if (!userOrProvider) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User or Provider does not exist');
    }
    // Check if SMTP_MAIL is configured
    if (!config_1.default.SMTP_MAIL) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'SMTP_MAIL is not defined in the configuration.');
    }
    // Generate reset token and its expiration date
    const { hashedToken, expires } = yield (0, generateResetToken_1.generateResetToken)();
    // Update reset token and expiration date based on user type
    if (isUser) {
        yield prisma_1.default.user.update({
            where: { email },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpire: expires,
            },
        });
    }
    else {
        yield prisma_1.default.provider.update({
            where: { email },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpire: expires,
            },
        });
    }
    // Define the email subject and sender
    const subject = 'Home Crafter - Password Recovery';
    const from = config_1.default.SMTP_MAIL;
    // Embed the HTML content directly in the code
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Home Crafter - Password Reset Request</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #fff;
                border-radius: 10px;
                padding: 40px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 10px;
                border-bottom: 1px solid #eaeaea;
            }
            h1 {
                font-size: 24px;
                color: #333;
                margin-bottom: 20px;
                text-align: center;
            }
            p {
                font-size: 16px;
                color: #555;
                line-height: 1.5;
                margin: 20px 0;
            }
            .reset-button {
                text-align: center;
                margin: 30px 0;
            }
            .reset-button a {
                background-color: #4f46e5;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
                box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2);
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #888;
            }
            .footer p {
                margin: 0;
            }
            .footer a {
                color: #888;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><span style="color: #4f46e5;">Home</span> Crafter</h1>
            </div>
            <h1>Password Reset Request</h1>
            <p>We received a request to reset your password for your account associated with ${email}. If you made this request, please click the button below to reset your password:</p>
            <div class="reset-button">
                <a href="http://localhost:3000/reset-password?token=${hashedToken}" target="_blank">Reset Your Password</a>
            </div>
            <p>If you did not request a password reset, you can safely ignore this email. Your password will not be changed until you access the link above and create a new one.</p>
            <p>Best regards,<br>The Home Crafter Admin</p>
            <div class="footer">
                <p>&copy; 2024 Home Crafter. All rights reserved @Syed Gaziul Haque</p>
            </div>
        </div>
    </body>
    </html>
  `;
    // Send the password reset email using the `sendEMail` function
    yield (0, sendMail_1.sendEMail)(from, email, subject, htmlContent);
    // Return success message
    return 'Password reset email has been sent successfully!';
});
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    let userOrProvider = yield prisma_1.default.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpire: {
                gte: new Date(),
            },
        },
    });
    let isProvider = false;
    if (!userOrProvider) {
        userOrProvider = yield prisma_1.default.provider.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpire: {
                    gte: new Date(),
                },
            },
        });
        isProvider = !!userOrProvider;
    }
    if (!userOrProvider) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid or expired reset token');
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    if (isProvider) {
        yield prisma_1.default.provider.update({
            where: { id: userOrProvider.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpire: null,
            },
        });
    }
    else {
        yield prisma_1.default.user.update({
            where: { id: userOrProvider.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpire: null,
            },
        });
    }
    return 'Password reset successful. You can now log in with your new password.';
});
exports.resetPassword = resetPassword;
exports.AuthService = {
    Signup,
    ProviderSignup,
    LoginUser,
    LoginProvider,
    RefreshToken,
    changePassword,
    forgotPassword,
    resetPassword: exports.resetPassword
};
