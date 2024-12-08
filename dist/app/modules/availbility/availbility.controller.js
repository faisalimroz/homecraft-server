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
exports.AvailbilityController = void 0;
const availbility_services_1 = require("./availbility.services");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const createAvailbility = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const availabilityData = req.body;
    console.log(availabilityData, '999999');
    const providerId = (_a = req === null || req === void 0 ? void 0 : req.provider) === null || _a === void 0 ? void 0 : _a.providerId;
    const availabilities = yield Promise.all(Object.entries(availabilityData).map(([day, slots]) => __awaiter(void 0, void 0, void 0, function* () {
        return availbility_services_1.AvailbilityServices.createAvailbility({ day, slots: slots, providerId });
    })));
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Availbility created successfully',
        data: availabilities,
    });
}));
const getAllAvailbility = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const providerId = (_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.providerId;
    const availabilities = yield availbility_services_1.AvailbilityServices.getAllAvailbility(providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Availbility fetched successfully',
        data: availabilities,
    });
}));
const getAllAvailbilityForProvider = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const providerId = (_c = req === null || req === void 0 ? void 0 : req.provider) === null || _c === void 0 ? void 0 : _c.providerId;
    const availabilities = yield availbility_services_1.AvailbilityServices.getAllAvailbility(providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Availbility fetched successfully for provider',
        data: availabilities,
    });
}));
const deleteAvailbility = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { day, slot } = req.body;
    if (!day || !slot) {
        return res.status(400).json({
            success: false,
            message: 'Day and slot are required fields',
        });
    }
    const availabilities = yield availbility_services_1.AvailbilityServices.deleteAvailbility(day, slot);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Availbility deleted successfully',
        data: availabilities,
    });
}));
exports.AvailbilityController = {
    createAvailbility,
    getAllAvailbility,
    getAllAvailbilityForProvider,
    deleteAvailbility
};
