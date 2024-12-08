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
exports.PaymentService = void 0;
// @typescript-eslint/no-unused-vars
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ssl_service_1 = require("../ssl/ssl.service");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const IdGenerator_1 = require("../../../helpers/IdGenerator");
const initPayment = (data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = (0, IdGenerator_1.generateSixDigitId)();
    const user = yield prisma_1.default.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true,
            fName: true,
            lName: true,
            email: true,
            contactNo: true,
            profileImg: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            password: false,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User Not Found');
    }
    const paymentSession = yield ssl_service_1.sslService.initPayment({
        total_amount: data.amount,
        tran_id: transactionId,
        cus_name: `${user === null || user === void 0 ? void 0 : user.fName} ${user === null || user === void 0 ? void 0 : user.lName}`,
        cus_email: user === null || user === void 0 ? void 0 : user.email,
        cus_add1: data.address,
        cus_phone: user === null || user === void 0 ? void 0 : user.contactNo,
        cus_country: data === null || data === void 0 ? void 0 : data.country,
        cus_state: data === null || data === void 0 ? void 0 : data.state,
        cus_city: data === null || data === void 0 ? void 0 : data.city,
        cus_postcode: data === null || data === void 0 ? void 0 : data.zipCode,
    });
    yield prisma_1.default.payment.create({
        data: {
            amount: data.amount,
            transactionId: transactionId,
            bookingId: data.bookingId,
            address: data.address,
            country: data.country,
            state: data.state,
            city: data.city,
            zipCode: data.zipCode,
        },
    });
    // Return the redirect URL for the payment gateway
    return paymentSession.redirectGatewayURL;
});
const initPaymentForCombo = (data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = (0, IdGenerator_1.generateSixDigitId)();
    const user = yield prisma_1.default.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true,
            fName: true,
            lName: true,
            email: true,
            contactNo: true,
            profileImg: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            // Exclude the password field
            password: false,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User Not Found');
    }
    const paymentSession = yield ssl_service_1.sslService.initPaymentForCombo({
        total_amount: data.amount,
        tran_id: transactionId,
        cus_name: `${user === null || user === void 0 ? void 0 : user.fName} ${user === null || user === void 0 ? void 0 : user.lName}`,
        cus_email: user === null || user === void 0 ? void 0 : user.email,
        cus_add1: data.address,
        cus_phone: user === null || user === void 0 ? void 0 : user.contactNo,
        cus_country: data === null || data === void 0 ? void 0 : data.country,
        cus_state: data === null || data === void 0 ? void 0 : data.state,
        cus_city: data === null || data === void 0 ? void 0 : data.city,
        cus_postcode: data === null || data === void 0 ? void 0 : data.zipCode,
    });
    yield prisma_1.default.comboPayment.create({
        data: {
            amount: data.amount,
            transactionId: transactionId,
            comboBookingId: data.comboBookingId,
            address: data.address,
            country: data.country,
            state: data.state,
            city: data.city,
            zipCode: data.zipCode,
        },
    });
    // Return the redirect URL for the payment gateway
    return paymentSession.redirectGatewayURL;
});
const paymentVerify = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isPaymentExist = yield prisma_1.default.payment.findFirst({
        where: {
            transactionId: id,
        },
    });
    console.log(isPaymentExist, '96');
    if (!isPaymentExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Payment does not exist');
    }
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        // Update payment status to PAID
        const updatedPayments = yield transactionClient.payment.updateMany({
            where: {
                transactionId: id,
            },
            data: {
                status: client_1.Status.Confirmed,
            },
        });
        if (updatedPayments) {
            yield transactionClient.booking.update({
                where: {
                    id: isPaymentExist === null || isPaymentExist === void 0 ? void 0 : isPaymentExist.bookingId,
                },
                data: {
                    isPaid: client_1.PaymentStatus.Paid,
                },
            });
        }
        return updatedPayments;
    }));
    return result;
});
const paymentVerifyForCombo = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isPaymentExist = yield prisma_1.default.comboPayment.findFirst({
        where: {
            transactionId: id,
        },
    });
    console.log(isPaymentExist, '96');
    if (!isPaymentExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Payment does not exist');
    }
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        // Update payment status to PAID
        const updatedPayments = yield transactionClient.comboPayment.updateMany({
            where: {
                transactionId: id,
            },
            data: {
                status: client_1.Status.Confirmed,
            },
        });
        if (updatedPayments) {
            yield transactionClient.comboBooking.update({
                where: {
                    id: isPaymentExist === null || isPaymentExist === void 0 ? void 0 : isPaymentExist.comboBookingId,
                },
                data: {
                    isPaid: client_1.PaymentStatus.Paid,
                },
            });
        }
        return updatedPayments;
    }));
    return result;
});
const getAllFromDB = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    // Initialize the query object
    const query = {
        include: {
            booking: {
                include: {
                    service: true,
                    user: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    };
    // Fetch provider details to determine if the user is a provider or admin
    const provider = yield prisma_1.default.provider.findUnique({
        where: { id: providerId }, // Now checking in the Provider table
    });
    if (!provider) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Provider not found");
    }
    const isAdmin = (provider === null || provider === void 0 ? void 0 : provider.role) === client_1.ProviderRole.Admin; // Assuming Provider is linked to a User
    if (!isAdmin) {
        // If the user is not an admin, filter by providerId (matching services offered by this provider)
        query.where = {
            booking: {
                service: {
                    providerId: providerId, // Only show payments for this provider
                },
            },
        };
    }
    // If the user is an admin, no additional filter is needed (they can see all payments)
    // Fetch the payments from the database
    const result = yield prisma_1.default.payment.findMany(query);
    return result;
});
const deleteFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.payment.delete({
        where: {
            id,
        },
    });
    return result;
});
exports.PaymentService = {
    initPayment,
    initPaymentForCombo,
    getAllFromDB,
    deleteFromDB,
    paymentVerify,
    paymentVerifyForCombo
};
