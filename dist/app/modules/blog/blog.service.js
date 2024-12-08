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
exports.BlogService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const insertIntoDB = (data, providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, categoryId } = data;
    let { blogImg } = data;
    if (!blogImg || typeof blogImg !== 'string') {
        throw new Error('No image selected. Please upload a valid image.');
    }
    try {
        const myCloud = yield cloudinary_1.default.v2.uploader.upload(blogImg, {
            folder: 'Home Crafter/Blogs',
        });
        blogImg = [myCloud.secure_url];
    }
    catch (error) {
        throw new Error('Image upload failed. Please try again.');
    }
    const result = yield prisma_1.default.blog.create({
        data: {
            title,
            content,
            blogImg,
            categoryId,
            providerId,
        },
    });
    return result;
});
const getAllFromDB = (categoryId, month, year) => __awaiter(void 0, void 0, void 0, function* () {
    const whereConditions = {};
    if (categoryId) {
        whereConditions.categoryId = categoryId;
    }
    if (month && year) {
        whereConditions.createdAt = {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1) // 
        };
    }
    const result = yield prisma_1.default.blog.findMany({
        where: whereConditions,
        include: {
            category: true,
            provider: true,
        }
    });
    return result;
});
const getAllProviderBlogFromDB = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!providerId) {
        throw new Error('Provider ID is required');
    }
    // Step 1: Find the provider by providerId to check their role
    const provider = yield prisma_1.default.provider.findUnique({
        where: { id: providerId },
        select: { role: true }, // Assuming 'role' is a field in your provider table
    });
    if (!provider) {
        throw new Error('Provider not found');
    }
    // Step 2: Use a switch case to handle different roles
    let result;
    switch (provider.role) {
        case client_1.ProviderRole.Provider:
            // If the role is 'Provider', find blogs specific to that providerId
            result = yield prisma_1.default.blog.findMany({
                where: { providerId: providerId },
                include: {
                    category: true,
                    provider: true,
                },
            });
            break;
        case client_1.ProviderRole.Admin:
            // If the role is 'Admin', retrieve all blogs
            result = yield prisma_1.default.blog.findMany({
                include: {
                    category: true,
                    provider: true,
                },
            });
            break;
        default:
            throw new Error('Invalid provider role');
    }
    return result;
});
const getLatestTenFromDB = (excludedBlogId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.blog.findMany({
        where: {
            id: {
                not: excludedBlogId,
            },
        },
        select: {
            id: true,
            title: true,
            blogImg: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return result;
});
const getBlogsByCategoryFromDB = (categoryId, excludedBlogId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogs = yield prisma_1.default.blog.findMany({
            where: {
                categoryId: categoryId,
                id: {
                    not: excludedBlogId,
                },
            },
            select: {
                id: true,
                title: true,
                blogImg: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (blogs.length === 0) {
            console.log('No blogs found in this category excluding the specified blog.');
            // Optional: handle case when no blogs are found
        }
        return blogs;
    }
    catch (error) {
        console.error('Error fetching blogs:', error);
        throw new Error('An error occurred while fetching blogs.');
    }
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isBlogExist = yield prisma_1.default.blog.findFirst({
        where: {
            id,
        },
    });
    if (!isBlogExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Blog does not exist');
    }
    const result = yield prisma_1.default.blog.findUnique({
        where: {
            id,
        },
        include: {
            category: true,
            provider: true
        }
    });
    return result;
});
const updateOneInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isBlogExist = yield prisma_1.default.blog.findFirst({
        where: {
            id,
        },
    });
    if (!isBlogExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Blog does not exist');
    }
    const result = yield prisma_1.default.blog.update({
        where: {
            id,
        },
        data: payload,
    });
    return result;
});
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isBlogExist = yield prisma_1.default.blog.findFirst({
        where: {
            id,
        },
    });
    if (!isBlogExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Blog does not exist');
    }
    const data = yield prisma_1.default.blog.delete({
        where: {
            id,
        },
    });
    return data;
});
exports.BlogService = {
    insertIntoDB,
    getAllFromDB,
    getAllProviderBlogFromDB,
    getLatestTenFromDB,
    getBlogsByCategoryFromDB,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
};
