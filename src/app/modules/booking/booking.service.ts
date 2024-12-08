import { Booking, Prisma, ProviderRole, Status, WorkStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data:any): Promise<Booking> => {
  console.log(data);
  const { userId, serviceId, day, time, bookingDate } = data;

 
 
  const existingBooking = await prisma.booking.findFirst({
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

  const result = await prisma.booking.create({
    data: {
      bookingDate,
      userId,
      serviceId,
      Day: day,         
      Time: time,         
    },
  });

  return result;
};


const fetchBookingsForDate = async (
  bookingDate: string
): Promise<Partial<any> | null> => {

  if (bookingDate) {
    const bookings = await prisma.booking.findMany({
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
};

const getAllFromDB = async ( providerId: string): Promise<Booking[]> => {

  const query: Prisma.BookingFindManyArgs = {
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
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new Error("User not found");
    }

    const isAdmin = provider.role === ProviderRole.Admin;

    if (!isAdmin && providerId) {
      // If the user is not an admin and providerId is defined, filter by providerId
      query.where = {
        service: {
          providerId: providerId,
        },
      };
    }
  } else if (providerId) {
    // If userId is not defined but providerId is, filter by providerId
    query.where = {
      service: {
        providerId: providerId,
      },
    };
  }

  // Fetch the bookings from the database
  const result = await prisma.booking.findMany(query);

  return result;
};

const getAllFromDBForUser = async (userId: string): Promise<Booking[]> => {

  const query: Prisma.BookingFindManyArgs = {
    include: {
      service: {
        include: {
          provider: {
            select: {
              fName: true,
              lName: true,
              profileImg: true,
              email:true,
              category:true
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

  
  const result = await prisma.booking.findMany(query);
  return result;
};


const getByIdFromDB = async (id: string): Promise<Booking | null> => {
  const isBookingExist = await prisma.booking.findFirst({
    where: { id },
  });

  if (!isBookingExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking does not exist');
  }

  const result = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true, // Include the User relation
      service: {
        include: {
          category: true, // Include the Category relation within Service
        },
      },
      // Include the Payment relation if needed
    },
  });

  return result;
};


const updateOneInDB = async (
  id: string,
  payload: Partial<Booking>
): Promise<Booking> => {
  const existingBooking = await prisma.booking.findFirst({
    where: {
      id,
    },
  });

  if (!existingBooking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking does not exist');
  }

  // Prevent status from being downgraded from Confirmed to Pending
  if (
    existingBooking.status === Status.Confirmed &&
    payload.status === Status.Pending
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot change status from Confirmed to Pending'
    );
  }

  // Prevent workStatus from being downgraded from InProgress to Pending
  if (
    existingBooking.workStatus === WorkStatus.InProgress &&
    payload.workStatus === WorkStatus.Pending
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot change work status from In Progress to Pending'
    );
  }

  // Only automatically update workStatus if it's not provided in the payload
  if (!payload.workStatus) {
    if (payload.status === Status.Confirmed) {
      payload.workStatus = WorkStatus.InProgress;
    } else if (payload.status === Status.Rejected) {
      payload.workStatus = WorkStatus.Canceled;
    }
  }

  // Update the booking with the new data
  const updatedBooking = await prisma.booking.update({
    where: {
      id,
    },
    data: {
      ...payload,
      workStatus: payload.workStatus === WorkStatus.InProgress ? WorkStatus.InProgress : payload.workStatus,
    },
  });

  return updatedBooking;
};



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

const deleteByIdFromDB = async (id: string): Promise<Booking> => {
  const isBookingExist = await prisma.booking.findFirst({
    where: {
      id,
    },
  });

  const result = await prisma.$transaction(async transactionClient => {
    await transactionClient.payment.deleteMany({
      where: {
        bookingId: isBookingExist?.id,
      },
    });

    const data = await transactionClient.booking.delete({
      where: {
        id,
      },
    });
    return data;
  });
  return result;
};

const getStatistics = async () => {
  console.log('hitted');
  const totalUsers = await prisma.user.count();
  const totalBookings = await prisma.booking.count();
  const totalServices = await prisma.service.count();

  const data = {
    totalBookings,
    totalServices,
    totalUsers,
  };
  return data;
};

export const BookingService = {
  insertIntoDB,
  getAllFromDB,
  getAllFromDBForUser,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
  fetchBookingsForDate,
  getStatistics,
};
