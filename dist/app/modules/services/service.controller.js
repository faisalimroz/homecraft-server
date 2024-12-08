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
exports.ServiceController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const pick_1 = __importDefault(require("../../../shared/pick"));
const service_constant_1 = require("./service.constant");
const http_status_1 = __importDefault(require("http-status"));
const service_service_1 = require("./service.service");
const insertIntoDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const providerId = (_a = req === null || req === void 0 ? void 0 : req.provider) === null || _a === void 0 ? void 0 : _a.providerId;
    const result = yield service_service_1.ServiceServices.insertIntoDB(req.body, providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Service created successfully',
        data: result,
    });
}));
const getAllFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, service_constant_1.ServiceFilterableFields);
    const queryOptions = (0, pick_1.default)(req.query, service_constant_1.queryFields);
    const result = yield service_service_1.ServiceServices.getAllFromDB(filters, queryOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Service fetched successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const getSingleProviderServiceFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield service_service_1.ServiceServices.getSingleProviderServiceFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'provider fetched successfully',
        data: result,
    });
}));
const getAllProviderServiceFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const providerId = (_b = req === null || req === void 0 ? void 0 : req.provider) === null || _b === void 0 ? void 0 : _b.providerId;
    const result = yield service_service_1.ServiceServices.getAllProviderServiceFromDB(providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Service fetched successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const getAllOfferedServicesProvidersFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const providerId = (_c = req === null || req === void 0 ? void 0 : req.provider) === null || _c === void 0 ? void 0 : _c.providerId;
    const result = yield service_service_1.ServiceServices.getAllOfferedServicesProvidersFromDB(providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Offered Service fetched successfully',
        data: result
    });
}));
const getAllOfferedServicesFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield service_service_1.ServiceServices.getAllOfferedServicesFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Offered Service fetched successfully',
        data: result
    });
}));
const getMostPopularServicesFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield service_service_1.ServiceServices.getMostPopularServicesFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Most Popular Service fetched successfully',
        data: result
    });
}));
const deleteOfferedServiceFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield service_service_1.ServiceServices.deleteOfferedServiceFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Offered Service deleted successfully',
        data: result,
    });
}));
const updateServicePriceByOffer = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { offerId } = req.body;
    const result = yield service_service_1.ServiceServices.updateServicePriceByOffer(id, offerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Offer applied successfully',
        data: result,
    });
}));
const getByIdFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield service_service_1.ServiceServices.getByIdFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Service fetched successfully',
        data: result,
    });
}));
const updateOneInDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield service_service_1.ServiceServices.updateOneInDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Service updated successfully',
        data: result,
    });
}));
const deleteByIdFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield service_service_1.ServiceServices.deleteByIdFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Service deleted successfully',
        data: result,
    });
}));
const getOverview = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const providerId = (_d = req === null || req === void 0 ? void 0 : req.provider) === null || _d === void 0 ? void 0 : _d.providerId;
    const result = yield service_service_1.ServiceServices.getOverview(providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'overview fetched successfully',
        data: result,
    });
}));
const getAdditionalServiceFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = req.query.serviceId;
    const result = yield service_service_1.ServiceServices.getAdditionalServiceFromDB(serviceId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Latest Blogs fetched successfully',
        data: result,
    });
}));
const getRelatedServiceFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query, '41');
    const categoryId = req.query.categoryId;
    const serviceId = req.query.serviceId;
    const result = yield service_service_1.ServiceServices.getRelatedServiceFromDB(categoryId, serviceId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Similar Blogs fetched successfully',
        data: result,
    });
}));
exports.ServiceController = {
    insertIntoDB,
    getAllFromDB,
    getSingleProviderServiceFromDB,
    getAllProviderServiceFromDB,
    getAllOfferedServicesProvidersFromDB,
    getAllOfferedServicesFromDB,
    deleteOfferedServiceFromDB,
    updateServicePriceByOffer,
    getByIdFromDB,
    getAdditionalServiceFromDB,
    getRelatedServiceFromDB,
    getMostPopularServicesFromDB,
    updateOneInDB,
    deleteByIdFromDB,
    getOverview,
};
