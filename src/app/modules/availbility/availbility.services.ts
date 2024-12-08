// import { Availbility } from '@prisma/client';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { ProviderRole } from '@prisma/client';

const createAvailbility = async (data: { day: string; slots: string[]; providerId: string }): Promise<any> => {
  const { day, slots, providerId } = data;
  console.log(data,'data 9')
  // Find the existing availability for the given day and provider
  const existingAvailability = await prisma.availability.findFirst({
    where: {
      day,
      providerId, 
    },
  });

  if (existingAvailability) {
    
    const updatedSlots = Array.from(new Set([...existingAvailability.slots, ...slots]));

    // Update the existing record with the merged slots
    const updatedAvailability = await prisma.availability.update({
      where: { id: existingAvailability.id }, 
      data: {
        slots: updatedSlots,
        providerId, 
      },
    });

    return updatedAvailability;
  } else {
    // If it does not exist, create new availability for the provider
    const newAvailability = await prisma.availability.create({
      data: {
        day,
        slots,
        providerId, 
      },
    });

    return newAvailability;
  }
};


const getAllAvailbility = async (providerId: string): Promise<{ [key: string]: string[] }> => {
  
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    throw new Error("Provider not found.");
  }

  let availabilities;
  if (provider.role === ProviderRole.Provider) {
    availabilities = await prisma.availability.findMany({
      where: { providerId: provider.id }, 
    });
  } else if (provider.role === ProviderRole.Admin) {
  
    availabilities = await prisma.availability.findMany();

  } else {
    throw new Error("Invalid role.");
  }


  const availabilityByDay: { [key: string]: string[] } = {};

  availabilities.forEach(({ day, slots }: { day: string; slots: string[] }) => {
    if (!availabilityByDay[day]) {
      availabilityByDay[day] = [];
    }

    availabilityByDay[day].push(...slots);
  });

  return availabilityByDay;
};
const getAllAvailbilityForProvider = async (providerId: string): Promise<{ [key: string]: string[] }> => {
  
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    throw new Error("Provider not found.");
  }

  let availabilities;
  if (provider.role === ProviderRole.Provider) {
    availabilities = await prisma.availability.findMany({
      where: { providerId: provider.id }, 
    });
  } else if (provider.role === ProviderRole.Admin) {
  
    availabilities = await prisma.availability.findMany();

  } else {
    throw new Error("Invalid role.");
  }


  const availabilityByDay: { [key: string]: string[] } = {};

  availabilities.forEach(({ day, slots }: { day: string; slots: string[] }) => {
    if (!availabilityByDay[day]) {
      availabilityByDay[day] = [];
    }

    availabilityByDay[day].push(...slots);
  });

  return availabilityByDay;
};


const deleteAvailbility = async (day: string, slot: string): Promise<any> => {
  console.log(day, slot, '58');
  
  if (day === "All day") {
    // Find all records (for each day including "All day")
    const availabilityRecords = await prisma.availability.findMany();

    // Filter out the slot from all records
    const updatedRecords = await Promise.all(
      availabilityRecords.map(async (record) => {
        const updatedSlots = record.slots.filter(s => s !== slot);
        return prisma.availability.update({
          where: { id: record.id },
          data: { slots: updatedSlots }
        });
      })
    );

    return updatedRecords;
  } else {
    // Find records for the specific day
    const availabilityRecords = await prisma.availability.findMany({
      where: { day }
    });

    if (availabilityRecords.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, `No availability found for day: ${day}`);
    }

    // Filter out the slot from the specific day's records
    const updatedRecords = await Promise.all(
      availabilityRecords.map(async (record) => {
        const updatedSlots = record.slots.filter(s => s !== slot);
        return prisma.availability.update({
          where: { id: record.id },
          data: { slots: updatedSlots }
        });
      })
    );

    // Additionally, remove the slot from the "All day" entry if it exists
    const allDayRecord = await prisma.availability.findFirst({  // Use findFirst here
      where: { day: "All day" }
    });

    if (allDayRecord) {
      const updatedAllDaySlots = allDayRecord.slots.filter(s => s !== slot);
      await prisma.availability.update({
        where: { id: allDayRecord.id },
        data: { slots: updatedAllDaySlots }
      });
    }

    return updatedRecords;
  }
};



export const AvailbilityServices = {
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
