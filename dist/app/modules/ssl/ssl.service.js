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
exports.sslService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
/**
 * Initialize payment for standard payments.
 */
const initPayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            store_id: config_1.default.ssl.storeId,
            store_passwd: config_1.default.ssl.storePass,
            total_amount: payload.total_amount,
            currency: 'USD',
            tran_id: payload.tran_id,
            success_url: 'https://home-crafter-backend.vercel.app/api/v1/payment/success',
            fail_url: 'https://home-crafter-backend.vercel.app/fail',
            cancel_url: 'https://home-crafter-backend.vercel.app/cancel',
            ipn_url: 'http://localhost:3030/ipn',
            shipping_method: 'N/A',
            product_name: 'Service Payment',
            product_category: 'Payment',
            product_profile: 'User',
            cus_name: payload.cus_name,
            cus_email: payload.cus_email,
            cus_add1: payload.cus_add1,
            cus_city: payload.cus_city,
            cus_state: payload.cus_state,
            cus_postcode: payload.zipCode,
            cus_country: payload.cus_country,
            cus_phone: payload.cus_phone,
            cus_fax: '01711111111',
            ship_name: 'Customer Name',
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };
        const response = yield (0, axios_1.default)({
            method: 'post',
            url: config_1.default.ssl.sslPaymentUrl,
            data: data,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data;
    }
    catch (err) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Payment error');
    }
});
/**
 * Initialize payment for combo packages.
 */
const initPaymentForCombo = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            store_id: config_1.default.ssl.storeId,
            store_passwd: config_1.default.ssl.storePass,
            total_amount: payload.total_amount,
            currency: 'USD',
            tran_id: payload.tran_id,
            success_url: 'https://home-crafter-backend.vercel.app/api/v1/payment/success/combo',
            fail_url: 'https://home-crafter-backend.vercel.app/fail',
            cancel_url: 'https://home-crafter-backend.vercel.app/cancel',
            ipn_url: 'http://localhost:3030/ipn',
            shipping_method: 'N/A',
            product_name: 'Service Payment',
            product_category: 'Payment',
            product_profile: 'User',
            cus_name: payload.cus_name,
            cus_email: payload.cus_email,
            cus_add1: payload.cus_add1,
            cus_city: payload.cus_city,
            cus_state: payload.cus_state,
            cus_postcode: payload.zipCode,
            cus_country: payload.cus_country,
            cus_phone: payload.cus_phone,
            cus_fax: '01711111111',
            ship_name: 'Customer Name',
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };
        const response = yield (0, axios_1.default)({
            method: 'post',
            url: config_1.default.ssl.sslPaymentUrl,
            data: data,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data;
    }
    catch (err) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Payment error');
    }
});
/**
 * Validate the payment.
 */
const validate = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, axios_1.default)({
            method: 'GET',
            url: `${config_1.default.ssl.sslValidationUrl}?val_id=${data.val_id}&store_id=${config_1.default.ssl.storeId}&store_passwd=${config_1.default.ssl.storePass}&format=json`,
        });
        return response.data;
    }
    catch (err) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Payment validation error');
    }
});
exports.sslService = {
    initPayment,
    initPaymentForCombo,
    validate,
};
