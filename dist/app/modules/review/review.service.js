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
exports.ReviewServices = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const postReview = (data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewData = Object.assign(Object.assign({}, data), { userId });
    const result = yield prisma_1.default.review.create({
        data: reviewData,
        include: {
            user: true,
            service: true,
        },
    });
    return result;
});
const postProviderReview = (data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(data, '38');
    const reviewData = Object.assign(Object.assign({}, data), { userId });
    const result = yield prisma_1.default.reviewProvider.create({
        data: reviewData,
        include: {
            user: true,
            provider: true,
        },
    });
    return result;
});
const getAllReview = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.review.findMany({
        include: {
            user: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return result;
});
const getReviewByServiceId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.review.findMany({
        where: {
            serviceId: id,
        },
        include: {
            user: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return result;
});
const getReviewByProviderId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.reviewProvider.findMany({
        where: {
            providerId: id,
        },
        include: {
            user: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return result;
});
const deleteReviewFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield prisma_1.default.review.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        },
    });
    if (!review) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Review not found');
    }
    const result = yield prisma_1.default.review.delete({
        where: {
            id,
        },
    });
    return result;
});
exports.ReviewServices = {
    postReview,
    postProviderReview,
    getAllReview,
    getReviewByServiceId,
    getReviewByProviderId,
    deleteReviewFromDB
};
