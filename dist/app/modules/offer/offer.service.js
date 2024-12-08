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
exports.OfferService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const insertIntoDB = (data, providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const newOfferData = Object.assign(Object.assign({}, data), { providerId });
    const result = yield prisma_1.default.offer.create({
        data: newOfferData,
    });
    return result;
});
const getAllFromDB = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the current date
    const currentDate = new Date();
    // Fetch the provider's role from the provider table
    const provider = yield prisma_1.default.provider.findUnique({
        where: { id: providerId },
        select: { role: true },
    });
    if (!provider) {
        throw new Error("Provider not found");
    }
    // Determine the query based on the provider's role
    let offers = [];
    if (provider.role === client_1.ProviderRole.Provider) {
        // If the role is 'Provider', fetch only the offers associated with the providerId
        offers = yield prisma_1.default.offer.findMany({
            where: {
                providerId, // Directly filter by providerId, the foreign key
            },
        });
    }
    else if (provider.role === client_1.ProviderRole.Admin) {
        // If the role is 'Admin', fetch all offers
        offers = yield prisma_1.default.offer.findMany();
    }
    // Update the status of each offer based on the end date
    const updatedOffers = yield Promise.all(offers.map((offer) => __awaiter(void 0, void 0, void 0, function* () {
        const newStatus = offer.endDate < currentDate ? client_1.offerStatus.Inactive : client_1.offerStatus.Active;
        if (offer.status !== newStatus) {
            // Update the offer status if it has changed
            return prisma_1.default.offer.update({
                where: { id: offer.id },
                data: { status: newStatus },
            });
        }
        return offer;
    })));
    return updatedOffers;
});
const updateOneInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isofferExist = yield prisma_1.default.offer.findFirst({
        where: {
            id,
        },
    });
    if (!isofferExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Offer does not exist');
    }
    const result = yield prisma_1.default.offer.update({
        where: {
            id,
        },
        data: payload,
    });
    return result;
});
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isofferExist = yield prisma_1.default.offer.findFirst({
        where: {
            id,
        },
    });
    if (!isofferExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'faq does not exist');
    }
    const data = yield prisma_1.default.offer.delete({
        where: {
            id,
        },
    });
    return data;
});
exports.OfferService = {
    insertIntoDB,
    getAllFromDB,
    updateOneInDB,
    deleteByIdFromDB,
};
