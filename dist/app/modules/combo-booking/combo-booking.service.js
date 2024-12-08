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
exports.ComboBookingService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const insertIntoDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, comboId } = data;
    const result = yield prisma_1.default.comboBooking.create({
        data: {
            userId,
            comboId
        },
    });
    return result;
});
const getAllFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Fetch all combo bookings with necessary relations
    const results = yield prisma_1.default.comboBooking.findMany({
        where: {
            userId: userId,
        },
        include: {
            user: {
                select: {
                    fName: true,
                    lName: true,
                    email: true,
                    contactNo: true,
                },
            },
            ComboPack: {
                include: {
                    provider: {
                        include: {
                            category: true,
                        },
                    },
                },
            },
        },
    });
    if (!results || results.length === 0) {
        return null;
    }
    // Collect formatted combo booking data
    const formattedBookings = [];
    for (const result of results) {
        // Check if ComboPack exists and has services
        if (!result.ComboPack || !result.ComboPack.services) {
            console.error(`Combo Pack or services not found for booking ID: ${result.id}`);
            continue; // Skip this booking and move to the next
        }
        // Fetch all service names from the services table
        const services = yield prisma_1.default.service.findMany({
            where: {
                id: { in: result.ComboPack.services },
            },
            select: {
                id: true,
                serviceName: true,
            },
        });
        // Create a service map to easily get service names by ID
        const serviceMap = services.reduce((acc, service) => {
            acc[service.id] = service.serviceName;
            return acc;
        }, {});
        // Format the combo pack data with service names
        const formattedData = {
            bookingId: result.id,
            isPaid: result.isPaid,
            status: result.status,
            user: result.user
                ? {
                    name: `${result.user.fName} ${result.user.lName}`,
                    email: result.user.email,
                    phone: result.user.contactNo,
                }
                : { name: 'Unknown User', email: '', phone: '' },
            comboPack: {
                id: result.ComboPack.id,
                comboName: result.ComboPack.comboName,
                plan: result.ComboPack.plan,
                amount: result.ComboPack.amount,
                discountAmount: result.ComboPack.discountAmount,
                services: result.ComboPack.services.map((serviceId) => serviceMap[serviceId] || "Unknown Service"),
                providerName: `${result.ComboPack.provider.fName} ${result.ComboPack.provider.lName}`,
                providerCategory: ((_a = result.ComboPack.provider.category) === null || _a === void 0 ? void 0 : _a.categoryName) || 'Unknown Category',
                providerImage: result.ComboPack.provider.profileImg,
                providerEmail: result.ComboPack.provider.email,
                providerContact: result.ComboPack.provider.contact
            },
            createdAt: result.createdAt,
        };
        // Add the formatted booking to the list
        formattedBookings.push(formattedData);
    }
    return formattedBookings.length > 0 ? formattedBookings : null;
});
const getAllFromDBForProvider = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    // Check the provider's role from the provider table
    const provider = yield prisma_1.default.provider.findUnique({
        where: { id: providerId },
        select: { role: true },
    });
    if (!provider) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Provider not found');
    }
    // Determine whether to show all bookings or filter by providerId
    let comboBookings;
    if (provider.role === 'Admin') {
        // Admin can see all combo bookings
        comboBookings = yield prisma_1.default.comboBooking.findMany({
            include: {
                user: {
                    select: {
                        fName: true,
                        lName: true,
                        email: true,
                        contactNo: true,
                    },
                },
                ComboPack: {
                    include: {
                        provider: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
        });
    }
    else if (provider.role === 'Provider') {
        // Provider can only see their own combo bookings
        comboBookings = yield prisma_1.default.comboBooking.findMany({
            where: {
                ComboPack: {
                    providerId,
                },
            },
            include: {
                user: {
                    select: {
                        fName: true,
                        lName: true,
                        email: true,
                        contactNo: true,
                        profileImg: true
                    },
                },
                ComboPack: {
                    include: {
                        provider: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
        });
    }
    else {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Unauthorized access');
    }
    if (!comboBookings || comboBookings.length === 0) {
        return null;
    }
    // Collect formatted combo booking data
    const formattedBookings = [];
    for (const booking of comboBookings) {
        // Check if ComboPack exists and has services
        if (!booking.ComboPack || !booking.ComboPack.services) {
            console.error(`Combo Pack or services not found for booking ID: ${booking.id}`);
            continue; // Skip this booking and move to the next
        }
        // Fetch all service names from the services table based on ComboPack services
        const services = yield prisma_1.default.service.findMany({
            where: {
                id: { in: booking.ComboPack.services },
            },
            select: {
                id: true,
                serviceName: true,
            },
        });
        // Create a service map to easily get service names by ID
        const serviceMap = services.reduce((acc, service) => {
            acc[service.id] = service.serviceName;
            return acc;
        }, {});
        // Format the combo pack data with service names
        const formattedData = {
            bookingId: booking.id,
            isPaid: booking.isPaid,
            status: booking.status,
            user: booking.user
                ? {
                    name: `${booking.user.fName} ${booking.user.lName}`,
                    email: booking.user.email,
                    phone: booking.user.contactNo,
                    profileImg: booking.user.profileImg
                }
                : { name: 'Unknown User', email: '', phone: '' },
            comboPack: {
                id: booking.ComboPack.id,
                comboName: booking.ComboPack.comboName,
                plan: booking.ComboPack.plan,
                amount: booking.ComboPack.amount,
                discountAmount: booking.ComboPack.discountAmount,
                services: booking.ComboPack.services.map((serviceId) => serviceMap[serviceId] || 'Unknown Service'),
                providerName: `${booking.ComboPack.provider.fName} ${booking.ComboPack.provider.lName}`,
                providerCategory: ((_b = booking.ComboPack.provider.category) === null || _b === void 0 ? void 0 : _b.categoryName) || 'Unknown Category',
            },
            createdAt: booking.createdAt,
        };
        // Add the formatted booking to the list
        formattedBookings.push(formattedData);
    }
    return formattedBookings.length > 0 ? formattedBookings : null;
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    // Check if the booking exists
    const isBookingExist = yield prisma_1.default.comboBooking.findFirst({
        where: { id },
    });
    if (!isBookingExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Combo Booking does not exist');
    }
    // Fetch the booking with necessary relations
    const result = yield prisma_1.default.comboBooking.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    fName: true,
                    lName: true,
                    email: true,
                    contactNo: true,
                },
            },
            ComboPack: {
                include: {
                    provider: {
                        include: {
                            category: true,
                        },
                    },
                },
            },
        },
    });
    if (!result) {
        return null;
    }
    // Fetch all service names from the services table
    const services = yield prisma_1.default.service.findMany({
        where: {
            id: { in: result.ComboPack.services },
        },
        select: {
            id: true,
            serviceName: true,
        },
    });
    // Create a service map to easily get service names by ID
    const serviceMap = services.reduce((acc, service) => {
        acc[service.id] = service.serviceName;
        return acc;
    }, {});
    // Format the combo pack data with service names
    const formattedData = {
        bookingId: result.id,
        isPaid: result.isPaid,
        status: result.status,
        user: result.user
            ? {
                name: `${result.user.fName} ${result.user.lName}`,
                email: result.user.email,
                phone: result.user.contactNo,
            }
            : { name: 'Unknown User', email: '', phone: '' },
        comboPack: {
            id: result.ComboPack.id,
            comboName: result.ComboPack.comboName,
            plan: result.ComboPack.plan,
            amount: result.ComboPack.amount,
            discountAmount: result.ComboPack.discountAmount,
            services: result.ComboPack.services.map((serviceId) => serviceMap[serviceId] || "Unknown Service"),
            providerName: `${result.ComboPack.provider.fName} ${result.ComboPack.provider.lName}`,
            providerCategory: ((_c = result.ComboPack.provider.category) === null || _c === void 0 ? void 0 : _c.categoryName) || 'Unknown Category',
        },
        createdAt: result.createdAt,
    };
    return formattedData;
});
const updateComboBookingStatus = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload, '355');
    // Check if the booking exists
    const existingBooking = yield prisma_1.default.comboBooking.findUnique({
        where: { id }
    });
    if (!existingBooking) {
        throw new Error("Booking does not exist");
    }
    // Update the booking status
    const updatedBooking = yield prisma_1.default.comboBooking.update({
        where: { id },
        data: { status: payload.status } // Pass status directly
    });
    return updatedBooking;
});
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
exports.ComboBookingService = {
    insertIntoDB,
    getAllFromDB,
    getAllFromDBForProvider,
    getByIdFromDB,
    updateComboBookingStatus,
    deleteByIdFromDB,
};
