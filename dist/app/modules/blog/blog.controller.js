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
exports.BlogController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const blog_service_1 = require("./blog.service");
const insertIntoDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const providerId = (_a = req === null || req === void 0 ? void 0 : req.provider) === null || _a === void 0 ? void 0 : _a.providerId;
    const result = yield blog_service_1.BlogService.insertIntoDB(req.body, providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Blog created successfully',
        data: result,
    });
}));
const getAllFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId, month, year } = req.query;
    const parsedMonth = month ? parseInt(month, 10) : undefined;
    const parsedYear = year ? parseInt(year, 10) : undefined;
    const result = yield blog_service_1.BlogService.getAllFromDB(categoryId, parsedMonth, parsedYear);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Blogs fetched successfully',
        data: result,
    });
}));
const getAllProviderBlogFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const providerId = (_b = req === null || req === void 0 ? void 0 : req.provider) === null || _b === void 0 ? void 0 : _b.providerId;
    const result = yield blog_service_1.BlogService.getAllProviderBlogFromDB(providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Blogs fetched successfully',
        data: result,
    });
}));
const getLatestTenFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogId = req.query.blogId;
    const result = yield blog_service_1.BlogService.getLatestTenFromDB(blogId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Latest Blogs fetched successfully',
        data: result,
    });
}));
const getBlogsByCategoryFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = req.query.categoryId;
    const blogId = req.query.blogId;
    const result = yield blog_service_1.BlogService.getBlogsByCategoryFromDB(categoryId, blogId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Similar Blogs fetched successfully',
        data: result,
    });
}));
const getByIdFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield blog_service_1.BlogService.getByIdFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Blogs fetched successfully',
        data: result,
    });
}));
const updateOneInDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield blog_service_1.BlogService.updateOneInDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Blogs updated successfully',
        data: result,
    });
}));
const deleteByIdFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield blog_service_1.BlogService.deleteByIdFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Blogs deleted successfully',
        data: result,
    });
}));
exports.BlogController = {
    insertIntoDB,
    getAllFromDB,
    getAllProviderBlogFromDB,
    getLatestTenFromDB,
    getBlogsByCategoryFromDB,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
};
