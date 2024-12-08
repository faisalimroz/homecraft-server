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
exports.AvailbilityServices = void 0;
// import { Availbility } from '@prisma/client';
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const createAvailbility = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { day, slots, providerId } = data;
    console.log(data, 'data 9');
    // Find the existing availability for the given day and provider
    const existingAvailability = yield prisma_1.default.availability.findFirst({
        where: {
            day,
            providerId,
        },
    });
    if (existingAvailability) {
        const updatedSlots = Array.from(new Set([...existingAvailability.slots, ...slots]));
        // Update the existing record with the merged slots
        const updatedAvailability = yield prisma_1.default.availability.update({
            where: { id: existingAvailability.id },
            data: {
                slots: updatedSlots,
                providerId,
            },
        });
        return updatedAvailability;
    }
    else {
        // If it does not exist, create new availability for the provider
        const newAvailability = yield prisma_1.default.availability.create({
            data: {
                day,
                slots,
                providerId,
            },
        });
        return newAvailability;
    }
});
const getAllAvailbility = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield prisma_1.default.provider.findUnique({
        where: { id: providerId },
    });
    if (!provider) {
        throw new Error("Provider not found.");
    }
    let availabilities;
    if (provider.role === client_1.ProviderRole.Provider) {
        availabilities = yield prisma_1.default.availability.findMany({
            where: { providerId: provider.id },
        });
    }
    else if (provider.role === client_1.ProviderRole.Admin) {
        availabilities = yield prisma_1.default.availability.findMany();
    }
    else {
        throw new Error("Invalid role.");
    }
    const availabilityByDay = {};
    availabilities.forEach(({ day, slots }) => {
        if (!availabilityByDay[day]) {
            availabilityByDay[day] = [];
        }
        availabilityByDay[day].push(...slots);
    });
    return availabilityByDay;
});
const getAllAvailbilityForProvider = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield prisma_1.default.provider.findUnique({
        where: { id: providerId },
    });
    if (!provider) {
        throw new Error("Provider not found.");
    }
    let availabilities;
    if (provider.role === client_1.ProviderRole.Provider) {
        availabilities = yield prisma_1.default.availability.findMany({
            where: { providerId: provider.id },
        });
    }
    else if (provider.role === client_1.ProviderRole.Admin) {
        availabilities = yield prisma_1.default.availability.findMany();
    }
    else {
        throw new Error("Invalid role.");
    }
    const availabilityByDay = {};
    availabilities.forEach(({ day, slots }) => {
        if (!availabilityByDay[day]) {
            availabilityByDay[day] = [];
        }
        availabilityByDay[day].push(...slots);
    });
    return availabilityByDay;
});
const deleteAvailbility = (day, slot) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(day, slot, '58');
    if (day === "All day") {
        // Find all records (for each day including "All day")
        const availabilityRecords = yield prisma_1.default.availability.findMany();
        // Filter out the slot from all records
        const updatedRecords = yield Promise.all(availabilityRecords.map((record) => __awaiter(void 0, void 0, void 0, function* () {
            const updatedSlots = record.slots.filter(s => s !== slot);
            return prisma_1.default.availability.update({
                where: { id: record.id },
                data: { slots: updatedSlots }
            });
        })));
        return updatedRecords;
    }
    else {
        // Find records for the specific day
        const availabilityRecords = yield prisma_1.default.availability.findMany({
            where: { day }
        });
        if (availabilityRecords.length === 0) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, `No availability found for day: ${day}`);
        }
        // Filter out the slot from the specific day's records
        const updatedRecords = yield Promise.all(availabilityRecords.map((record) => __awaiter(void 0, void 0, void 0, function* () {
            const updatedSlots = record.slots.filter(s => s !== slot);
            return prisma_1.default.availability.update({
                where: { id: record.id },
                data: { slots: updatedSlots }
            });
        })));
        // Additionally, remove the slot from the "All day" entry if it exists
        const allDayRecord = yield prisma_1.default.availability.findFirst({
            where: { day: "All day" }
        });
        if (allDayRecord) {
            const updatedAllDaySlots = allDayRecord.slots.filter(s => s !== slot);
            yield prisma_1.default.availability.update({
                where: { id: allDayRecord.id },
                data: { slots: updatedAllDaySlots }
            });
        }
        return updatedRecords;
    }
});
exports.AvailbilityServices = {
    createAvailbility,
    getAllAvailbility,
    getAllAvailbilityForProvider,
    deleteAvailbility,
};
// model Booking {
//   id                String           @id @default(uuid())
//   booking_date      Date             @map("booking_date")
//   status            Status           @default(pending)
//   user_id           String           @map("user_id")
//   service_id        String           @map("service_id")
//   availability_id   String           @map("availability_id")
//   isPaid            Boolean          @default(false)
//   user              User             @relation(fields: [user_id], references: [id])
//   service           Service          @relation(fields: [service_id], references: [id])
//   Availability      Availability     @relation(fields: [availability_id], references: [id])
//   createdAt         DateTime         @default(now()) @map("created_at")
//   updatedAt         DateTime         @updatedAt @map("updated_at")
//   @@unique([availability_id, service_id])
//   @@map("bookings")
// }
