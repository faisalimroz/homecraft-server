"use strict";
/* eslint-disable no-undef */
/* @typescript-eslint/no-unused-vars */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const sendMail_1 = require("../../utils/sendMail");
const getAllFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.provider.findMany({
        where: {
            role: 'Provider',
            approvalStatus: 'Approved',
        },
        select: {
            id: true,
            fName: true,
            lName: true,
            profileImg: true,
            category: {
                select: {
                    id: true,
                    categoryName: true,
                },
            },
            reviewProviders: {
                select: {
                    rating: true,
                },
            },
        },
    });
    const providersWithRatings = result.map((provider) => {
        const totalReviews = provider.reviewProviders.length;
        const averageRating = totalReviews > 0
            ? provider.reviewProviders.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;
        return Object.assign(Object.assign({}, provider), { averageRating: parseFloat(averageRating.toFixed(2)), totalReviews });
    });
    return providersWithRatings;
});
const getAllFromDBForAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.provider.findMany({
        where: {
            role: 'Provider',
        },
        select: {
            id: true,
            fName: true,
            lName: true,
            email: true,
            gender: true,
            contactNo: true,
            profileImg: true,
            approvalStatus: true,
            category: true,
            createdAt: true,
        },
    });
    return result;
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.provider.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            fName: true,
            lName: true,
            email: true,
            role: true,
            gender: true,
            dob: true,
            bio: true,
            category: true,
            contactNo: true,
            address: true,
            profileImg: true,
            services: true,
            createdAt: true,
            reviewProviders: {
                select: {
                    rating: true,
                },
            },
        },
    });
    if (!result) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Provider Not Found!');
    }
    // Calculate the average rating and total number of reviews
    const totalReviews = result.reviewProviders.length;
    const averageRating = totalReviews > 0
        ? result.reviewProviders.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;
    // Add the calculated fields to the result
    return Object.assign(Object.assign({}, result), { averageRating: parseFloat(averageRating.toFixed(2)), totalReviews });
});
const updateOneInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isProviderExist = yield prisma_1.default.provider.findFirst({
        where: {
            id,
        },
    });
    if (!isProviderExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Provider does not exist');
    }
    // Destructure payload
    let { profileImg } = payload;
    console.log(profileImg, '149');
    const { password, categoryId } = payload, userData = __rest(payload, ["password", "categoryId"]);
    // Handle profile image update
    if (profileImg) {
        let images = [];
        if (typeof profileImg === 'string') {
            images.push(profileImg);
        }
        else {
            images = profileImg;
        }
        const imagesLinks = [];
        for (let i = 0; i < images.length; i++) {
            const result = yield cloudinary_1.default.v2.uploader.upload(images[i], {
                folder: 'auth',
            });
            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        profileImg = imagesLinks.map(image => image.url);
        // Delete old profile image(s) if they exist
        if (isProviderExist.profileImg && isProviderExist.profileImg.length > 0) {
            const publicIds = isProviderExist.profileImg.map(url => url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.')));
            yield Promise.all(publicIds.map(publicId => cloudinary_1.default.v2.uploader.destroy(publicId, { invalidate: true })));
        }
    }
    // Handle password update
    if (password) {
        const salt = yield bcrypt_1.default.genSalt(Number(config_1.default.bycrypt_salt_rounds));
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        userData.password = hashedPassword;
    }
    // Ensure categoryId is valid or unset it if not provided
    let validCategoryId = null;
    if (categoryId) {
        const category = yield prisma_1.default.category.findUnique({
            where: { id: categoryId },
        });
        if (category) {
            validCategoryId = categoryId;
        }
        else {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid category ID');
        }
    }
    // Update user data in the database
    const result = yield prisma_1.default.provider.update({
        where: {
            id,
        },
        data: Object.assign(Object.assign({}, userData), { profileImg: profileImg || isProviderExist.profileImg, categoryId: validCategoryId }),
        select: {
            id: true,
            fName: true,
            lName: true,
            email: true,
            role: true,
            gender: true,
            dob: true,
            bio: true,
            categoryId: true,
            contactNo: true,
            address: true,
            profileImg: true,
            createdAt: true,
            updatedAt: true,
            approvalStatus: true,
        },
    });
    return result;
});
const updateStatusInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the provider exists in the database
    const isProviderExist = yield prisma_1.default.provider.findFirst({
        where: { id },
    });
    // If provider does not exist, throw a 404 error
    if (!isProviderExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Provider does not exist');
    }
    const { approvalStatus } = payload;
    // Check if approvalStatus is provided in the payload
    if (!approvalStatus) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'ApprovalStatus is required');
    }
    // Prevent changing approvalStatus from 'Approved' to 'Pending'
    if (isProviderExist.approvalStatus === 'Approved' && approvalStatus === 'Pending') {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot change status from Approved to Pending');
    }
    // Only update the approvalStatus field
    const result = yield prisma_1.default.provider.update({
        where: { id },
        data: {
            approvalStatus,
        },
        select: {
            id: true,
            fName: true,
            lName: true,
            email: true,
            gender: true,
            contactNo: true,
            profileImg: true,
            approvalStatus: true,
            createdAt: true,
        },
    });
    if (result.approvalStatus === client_1.ApprovalStatus.Approved) {
        const subject = 'Home Crafter - Approval Status Update';
        const from = config_1.default.SMTP_MAIL;
        if (!from) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'SMTP_MAIL is not defined in the configuration.');
        }
        // Directly embed HTML content in the code
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="Join request approval for Home Crafter">
            <meta name="author" content="Home Crafter">
            <title>Welcome to Home Crafter - Provider Approval</title>
            <style>
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    background-color: #f3f4f6;
                    margin: 0;
                    padding: 0;
                    color: #444;
                }
                .container {
                    max-width: 700px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    padding: 50px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .header img {
                    max-width: 200px;
                }
                .main-content {
                    text-align: center;
                    margin: 40px 0;
                }
                .main-content h1 {
                    font-size: 28px;
                    color: #333333;
                    margin-bottom: 10px;
                }
                .main-content p {
                    font-size: 16px;
                    color: #666666;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }
                .cta-button {
                    text-align: center;
                    margin: 40px 0;
                }
                .cta-button a {
                    background-color: #4f46e5;
                    color: white;
                    padding: 18px 40px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: 600;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
                    transition: all 0.3s ease;
                }
                .cta-button a:hover {
                    background-color: #3b3acf;
                    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
                }
                .footer {
                    text-align: center;
                    font-size: 12px;
                    color: #888888;
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 1px solid #e0e0e0;
                }
                .footer p {
                    margin: 0;
                }
                .footer a {
                    color: #888888;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header Section -->
                <div class="header">
                    <h1><span style="color: #4f46e5;">Home</span> Crafter</h1>
                </div>
    
                <!-- Main Content Section -->
                <div class="main-content">
                    <h1>Congratulations, Your Join Request Has Been Approved!</h1>
                    <p>
                        Dear ${result === null || result === void 0 ? void 0 : result.fName} ${result === null || result === void 0 ? void 0 : result.lName},
                        <br><br>
                        We're thrilled to welcome you as a provider on the Home Crafter platform! Your request to join our network of professionals has been successfully reviewed and approved.
                    </p>
    
                    <p>
                        If you have any questions or need further assistance, feel free to contact our support team at 
                        <a href="mailto:mikatsyed@gmail.com">mikatsyed@gmail.com</a>.
                        <br><br>
                        We wish you great success in your journey with us!
                    </p>
                </div>
    
                <!-- Footer Section -->
                <div class="footer">
                    <p>&copy; 2024 Home Crafter. All rights reserved.@Syed Gaziul Haque</p>
                </div>
            </div>
        </body>
        </html>
      `;
        // Send email
        yield (0, sendMail_1.sendEMail)(from, result === null || result === void 0 ? void 0 : result.email, subject, htmlContent);
    }
    if (result.approvalStatus === client_1.ApprovalStatus.Rejected) {
        const subject = 'Home Crafter - Approval Status Update';
        const from = config_1.default.SMTP_MAIL;
        if (!from) {
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'SMTP_MAIL is not defined in the configuration.');
        }
        // Directly embed HTML content in the code for rejection template
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="Join request rejection for Home Crafter">
            <meta name="author" content="Home Crafter">
            <title>Home Crafter - Provider Join Request Rejected</title>
            <style>
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    background-color: #f3f4f6;
                    margin: 0;
                    padding: 0;
                    color: #444;
                }
                .container {
                    max-width: 700px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    padding: 50px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .header img {
                    max-width: 200px;
                }
                .main-content {
                    text-align: center;
                    margin: 40px 0;
                }
                .main-content h1 {
                    font-size: 28px;
                    color: #333333;
                    margin-bottom: 10px;
                }
                .main-content p {
                    font-size: 16px;
                    color: #666666;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }
                .cta-button {
                    text-align: center;
                    margin: 40px 0;
                }
                .cta-button a {
                    background-color: #e53e3e;
                    color: white;
                    padding: 18px 40px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: 600;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(229, 62, 62, 0.3);
                    transition: all 0.3s ease;
                }
                .cta-button a:hover {
                    background-color: #c53030;
                    box-shadow: 0 6px 20px rgba(229, 62, 62, 0.4);
                }
                .footer {
                    text-align: center;
                    font-size: 12px;
                    color: #888888;
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 1px solid #e0e0e0;
                }
                .footer p {
                    margin: 0;
                }
                .footer a {
                    color: #888888;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header Section -->
                <div class="header">
                    <h1><span style="color: #4f46e5;">Home</span> Crafter</h1>
                </div>
    
                <!-- Main Content Section -->
                <div class="main-content">
                    <h1>We're Sorry, Your Join Request Has Been Rejected</h1>
                    <p>
                        Dear ${result === null || result === void 0 ? void 0 : result.fName} ${result === null || result === void 0 ? void 0 : result.lName},
                        <br><br>
                        After careful consideration, we regret to inform you that your request to join the Home Crafter platform as a provider has not been approved at this time.
                        <br><br>
                        We understand this may not be the response you were hoping for, but we encourage you to continue improving your profile and skills. You are welcome to reapply in the future.
                    </p>
    
                    <!-- Call to Action Button -->
                    <div class="cta-button">
                        <a href="https://home-crafter.com/signup/provider">Reapply</a>
                    </div>
    
                    <p>
                        If you have any questions or need further clarification, feel free to reach out to our support team at 
                        <a href="mailto:mikatsyed@gmail.com">mikatsyed@gmail.com</a>.
                        <br><br>
                        Thank you for your interest in joining Home Crafter.
                    </p>
                </div>
    
                <!-- Footer Section -->
                <div class="footer">
                    <p>&copy; 2024 Home Crafter. All rights reserved. @Syed Gaziul Haque</p>
                </div>
            </div>
        </body>
        </html>
      `;
        // Send rejection email
        yield (0, sendMail_1.sendEMail)(from, result === null || result === void 0 ? void 0 : result.email, subject, htmlContent);
    }
    return result;
});
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if the provider exists
        const isProviderExist = yield prisma.provider.findFirst({
            where: {
                id,
            },
            select: {
                id: true,
                fName: true,
                lName: true,
                email: true,
                gender: true,
                contactNo: true,
                profileImg: true,
                approvalStatus: true,
                createdAt: true,
            },
        });
        if (!isProviderExist) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Provider does not exist');
        }
        // Delete related data in the transaction
        yield prisma.service.deleteMany({
            where: {
                providerId: id,
            },
        });
        yield prisma.availability.deleteMany({
            where: {
                providerId: id,
            },
        });
        yield prisma.offer.deleteMany({
            where: {
                providerId: id,
            },
        });
        yield prisma.blog.deleteMany({
            where: {
                providerId: id, // Assuming `providerId` references the provider in the blogs table
            },
        });
        // Finally, delete the provider (user) from the database
        yield prisma.provider.delete({
            where: {
                id,
            },
        });
        // Return the provider's data before deletion
        return isProviderExist;
    }));
    return result;
});
exports.ProviderService = {
    getAllFromDB,
    getAllFromDBForAdmin,
    getByIdFromDB,
    updateOneInDB,
    updateStatusInDB,
    deleteByIdFromDB,
};
