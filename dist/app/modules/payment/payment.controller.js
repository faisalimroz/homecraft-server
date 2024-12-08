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
exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const initPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const result = yield payment_service_1.PaymentService.initPayment(req.body, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Payment init successfully',
        data: result,
    });
});
const initPaymentForCombo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.userId;
    const result = yield payment_service_1.PaymentService.initPaymentForCombo(req.body, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Payment init successfully',
        data: result,
    });
});
const paymentVerify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query;
    const { transectionId } = id;
    const result = yield payment_service_1.PaymentService.paymentVerify(transectionId);
    console.log(result, '35');
    if (result && result.count > 0) {
        res.redirect('https://home-crafter.vercel.app/booking-done');
    }
    else {
        // Handle the case where the update failed
        (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.INTERNAL_SERVER_ERROR,
            message: 'Payment verification failed',
        });
    }
});
const paymentVerifyForCombo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query;
    const { transectionId } = id;
    const result = yield payment_service_1.PaymentService.paymentVerifyForCombo(transectionId);
    if (result && result.count > 0) {
        const redirectUrl = 'https://home-crafter.vercel.app/combo-booking-done';
        res.redirect(redirectUrl);
    }
    else {
        // Handle the case where the update failed
        (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.INTERNAL_SERVER_ERROR,
            message: 'Payment verification failed',
        });
    }
});
const getAllFromDB = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const providerId = (_c = req === null || req === void 0 ? void 0 : req.provider) === null || _c === void 0 ? void 0 : _c.providerId;
        const result = yield payment_service_1.PaymentService.getAllFromDB(providerId);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Payments fetched successfully',
            data: result
        });
    }
    catch (error) {
        next(error);
    }
});
const deleteFromDB = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield payment_service_1.PaymentService.deleteFromDB(id);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Payment delete successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.PaymentController = {
    initPayment,
    initPaymentForCombo,
    paymentVerify,
    paymentVerifyForCombo,
    getAllFromDB,
    deleteFromDB,
};
