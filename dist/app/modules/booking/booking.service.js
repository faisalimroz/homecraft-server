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
exports.BookingService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const insertIntoDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(data);
    const { userId, serviceId, day, time, bookingDate } = data;
    const existingBooking = yield prisma_1.default.booking.findFirst({
        where: {
            Day: day,
            Time: time,
            serviceId,
            bookingDate
        },
    });
    if (existingBooking) {
        throw new Error('Slot is not available for this date and service.');
    }
    const result = yield prisma_1.default.booking.create({
        data: {
            bookingDate,
            userId,
            serviceId,
            Day: day,
            Time: time,
        },
    });
    return result;
});
const fetchBookingsForDate = (bookingDate) => __awaiter(void 0, void 0, void 0, function* () {
    if (bookingDate) {
        const bookings = yield prisma_1.default.booking.findMany({
            where: {
                bookingDate,
            },
            select: {
                bookingDate: true,
                Day: true,
                Time: true,
            },
        });
        console.log(bookings);
        return bookings;
    }
    return null;
});
const getAllFromDB = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        include: {
            user: true,
            service: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    };
    if (providerId) {
        // Fetch user details to determine if the user is an admin
        const provider = yield prisma_1.default.provider.findUnique({
            where: { id: providerId },
        });
        if (!provider) {
            throw new Error("User not found");
        }
        const isAdmin = provider.role === client_1.ProviderRole.Admin;
        if (!isAdmin && providerId) {
            // If the user is not an admin and providerId is defined, filter by providerId
            query.where = {
                service: {
                    providerId: providerId,
                },
            };
        }
    }
    else if (providerId) {
        // If userId is not defined but providerId is, filter by providerId
        query.where = {
            service: {
                providerId: providerId,
            },
        };
    }
    // Fetch the bookings from the database
    const result = yield prisma_1.default.booking.findMany(query);
    return result;
});
const getAllFromDBForUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        include: {
            service: {
                include: {
                    provider: {
                        select: {
                            fName: true,
                            lName: true,
                            profileImg: true,
                            email: true,
                            category: true
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    };
    if (userId) {
        query.where = {
            userId: userId,
        };
    }
    const result = yield prisma_1.default.booking.findMany(query);
    return result;
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isBookingExist = yield prisma_1.default.booking.findFirst({
        where: { id },
    });
    if (!isBookingExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Booking does not exist');
    }
    const result = yield prisma_1.default.booking.findUnique({
        where: { id },
        include: {
            user: true,
            service: {
                include: {
                    category: true, // Include the Category relation within Service
                },
            },
            // Include the Payment relation if needed
        },
    });
    return result;
});
const updateOneInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingBooking = yield prisma_1.default.booking.findFirst({
        where: {
            id,
        },
    });
    if (!existingBooking) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Booking does not exist');
    }
    // Prevent status from being downgraded from Confirmed to Pending
    if (existingBooking.status === client_1.Status.Confirmed &&
        payload.status === client_1.Status.Pending) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot change status from Confirmed to Pending');
    }
    // Prevent workStatus from being downgraded from InProgress to Pending
    if (existingBooking.workStatus === client_1.WorkStatus.InProgress &&
        payload.workStatus === client_1.WorkStatus.Pending) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Cannot change work status from In Progress to Pending');
    }
    // Only automatically update workStatus if it's not provided in the payload
    if (!payload.workStatus) {
        if (payload.status === client_1.Status.Confirmed) {
            payload.workStatus = client_1.WorkStatus.InProgress;
        }
        else if (payload.status === client_1.Status.Rejected) {
            payload.workStatus = client_1.WorkStatus.Canceled;
        }
    }
    // Update the booking with the new data
    const updatedBooking = yield prisma_1.default.booking.update({
        where: {
            id,
        },
        data: Object.assign(Object.assign({}, payload), { workStatus: payload.workStatus === client_1.WorkStatus.InProgress ? client_1.WorkStatus.InProgress : payload.workStatus }),
    });
    return updatedBooking;
});
// const deleteByIdFromDB = async (id: string): Promise<Booking> => {
//   const isBookingExist = await prisma.booking.findFirst({
//     where: {
//       id,
//     },
//   });
//   if (!isBookingExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Booking does not exist');
//   }
//   const data = await prisma.booking.delete({
//     where: {
//       id,
//     },
//   });
//   return data;
// };
const deleteByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isBookingExist = yield prisma_1.default.booking.findFirst({
        where: {
            id,
        },
    });
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.payment.deleteMany({
            where: {
                bookingId: isBookingExist === null || isBookingExist === void 0 ? void 0 : isBookingExist.id,
            },
        });
        const data = yield transactionClient.booking.delete({
            where: {
                id,
            },
        });
        return data;
    }));
    return result;
});
const getStatistics = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('hitted');
    const totalUsers = yield prisma_1.default.user.count();
    const totalBookings = yield prisma_1.default.booking.count();
    const totalServices = yield prisma_1.default.service.count();
    const data = {
        totalBookings,
        totalServices,
        totalUsers,
    };
    return data;
});
exports.BookingService = {
    insertIntoDB,
    getAllFromDB,
    getAllFromDBForUser,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
    fetchBookingsForDate,
    getStatistics,
};
