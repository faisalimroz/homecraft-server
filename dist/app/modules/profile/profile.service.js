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
exports.ProfileService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const getProfile = (providerId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    let result = null;
    // Check if providerId is provided, fetch provider data
    if (providerId) {
        result = yield prisma_1.default.provider.findUnique({
            where: { id: providerId },
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
                category: true,
                contactNo: true,
                address: true,
                profileImg: true,
                services: true,
                createdAt: true,
            },
        });
        if (!result) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Provider not found');
        }
        return result; // Return only provider data if found
    }
    // Check if userId is provided, fetch user data
    if (userId) {
        result = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fName: true,
                lName: true,
                email: true,
                role: true,
                contactNo: true,
                profileImg: true,
                createdAt: true,
            },
        });
        if (!result) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
        return result; // Return only user data if found
    }
    // If neither providerId nor userId is provided, or no valid result is found
    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide either providerId or userId');
});
exports.ProfileService = {
    getProfile,
};
