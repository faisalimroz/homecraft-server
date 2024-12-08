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
exports.ComboPackService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const insertIntoDB = (data, providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const comboData = {
        comboName: data.comboName,
        plan: data.plan,
        services: data.selectedServices,
        amount: data.amount,
        discountAmount: data.discountAmount,
        providerId: providerId,
        discount: data.discount
    };
    // Create a new ComboPack entry in the database
    const result = yield prisma_1.default.comboPack.create({
        data: comboData,
        include: {
            provider: true, // Include provider information if necessary
        },
    });
    return result;
});
const getAllFromDBForProvider = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    // First, fetch the provider's role based on the providerId
    const provider = yield prisma_1.default.provider.findUnique({
        where: { id: providerId },
        select: { role: true },
    });
    // Return an empty array if the provider doesn't exist or the role isn't found
    if (!provider) {
        throw new Error('Provider not found');
    }
    // Construct the query based on the provider's role
    const isAdmin = provider.role === 'Admin';
    const comboPacks = yield prisma_1.default.comboPack.findMany({
        where: isAdmin ? {} : { providerId },
        include: {
            provider: {
                include: {
                    category: true,
                },
            },
        },
    });
    // Fetch all services to build a service map
    const services = yield prisma_1.default.service.findMany({
        select: {
            id: true,
            serviceName: true,
        },
    });
    // Create a service map with service IDs as keys and service names as values
    const serviceMap = services.reduce((acc, service) => {
        acc[service.id] = service.serviceName;
        return acc;
    }, {});
    // Format the data based on the retrieved combo packs
    const formattedData = comboPacks.map((pack) => {
        var _a, _b;
        const providerDetails = pack.provider;
        // Build provider information fields
        const providerName = providerDetails ? `${providerDetails.fName} ${providerDetails.lName}` : "Unknown Provider";
        const providerImage = ((_a = providerDetails === null || providerDetails === void 0 ? void 0 : providerDetails.profileImg) === null || _a === void 0 ? void 0 : _a.length)
            ? providerDetails.profileImg[providerDetails.profileImg.length - 1]
            : "";
        const providerCategory = (providerDetails === null || providerDetails === void 0 ? void 0 : providerDetails.role) === 'Admin'
            ? 'Admin'
            : ((_b = providerDetails === null || providerDetails === void 0 ? void 0 : providerDetails.category) === null || _b === void 0 ? void 0 : _b.categoryName) || "Unknown Category";
        return {
            id: pack === null || pack === void 0 ? void 0 : pack.id,
            name: pack.comboName,
            plan: pack.plan,
            services: pack.services.map((serviceId) => serviceMap[serviceId] || ""),
            providerImage: providerImage,
            providerName: providerName,
            providerInfo: providerCategory,
            amount: pack.discountAmount,
        };
    });
    return formattedData;
});
const getAllFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.comboPack.findMany({
        include: {
            provider: {
                include: {
                    category: true,
                },
            },
        },
    });
    const services = yield prisma_1.default.service.findMany({
        select: {
            id: true,
            serviceName: true,
        },
    });
    // Create a service map
    const serviceMap = services.reduce((acc, service) => {
        acc[service.id] = service.serviceName;
        return acc;
    }, {});
    // Format the result data
    const formattedData = result.map((pack) => {
        var _a, _b;
        const provider = pack.provider;
        // Build provider information fields
        const providerName = provider ? `${provider.fName} ${provider.lName}` : "Unknown Provider";
        const providerImage = provider && ((_a = provider.profileImg) === null || _a === void 0 ? void 0 : _a.length)
            ? provider.profileImg[provider.profileImg.length - 1]
            : "";
        const providerCategory = (provider === null || provider === void 0 ? void 0 : provider.role) === 'Admin'
            ? 'Admin'
            : ((_b = provider === null || provider === void 0 ? void 0 : provider.category) === null || _b === void 0 ? void 0 : _b.categoryName) || "Unknown Category";
        return {
            id: pack === null || pack === void 0 ? void 0 : pack.id,
            name: pack.comboName,
            plan: pack.plan,
            services: pack.services.map((serviceId) => serviceMap[serviceId] || ""),
            providerImage: providerImage,
            providerName: providerName,
            providerInfo: providerCategory,
            amount: pack.discountAmount,
        };
    });
    return formattedData;
});
const getSingleServiceFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch the single comboPack entry using the provided ID
    const result = yield prisma_1.default.comboPack.findUnique({
        where: { id },
    });
    // If no record is found, return null
    if (!result) {
        return null;
    }
    // Fetch all services to create a service mapping
    const services = yield prisma_1.default.service.findMany({
        select: {
            id: true,
            serviceName: true,
        },
    });
    // Create a service map for quick lookup
    const serviceMap = services.reduce((acc, service) => {
        acc[service.id] = service.serviceName;
        return acc;
    }, {});
    // Format and return the comboPack data
    const formattedData = {
        id: result.id,
        comboName: result.comboName,
        plan: result.plan,
        // Map the services to an array of objects with id and serviceName
        services: result.services.map((serviceId) => ({
            id: serviceId,
            serviceName: serviceMap[serviceId] || "Unknown Service",
        })),
        amount: result.amount,
        discountAmount: result.discountAmount,
        discount: result.discount
    };
    return formattedData;
});
const UpdateOneIntoDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedData = {
        comboName: data.comboName,
        plan: data.plan,
        services: data.selectedServices,
        amount: data.amount,
        discountAmount: data.discountAmount,
        discount: data.discount,
    };
    const result = yield prisma_1.default.comboPack.update({
        where: { id },
        data: updatedData,
        include: {
            provider: true,
        },
    });
    return result;
});
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isComboPackExist = yield prisma_1.default.comboPack.findFirst({
        where: { id },
    });
    // If the ComboPack does not exist, throw an error with 404 status
    if (!isComboPackExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'ComboPack does not exist');
    }
    // Delete the ComboPack and return the deleted data
    const result = yield prisma_1.default.comboPack.delete({
        where: { id },
    });
    return result;
});
exports.ComboPackService = {
    insertIntoDB,
    getAllFromDBForProvider,
    getAllFromDB,
    UpdateOneIntoDB,
    getSingleServiceFromDB,
    deleteByIdFromDB
};
