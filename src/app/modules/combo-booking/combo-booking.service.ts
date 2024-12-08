import { Booking, ComboBooking, Prisma, ProviderRole, Status, WorkStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: ComboBooking): Promise<ComboBooking> => {
  const { userId, comboId } = data;

 

  const result = await prisma.comboBooking.create({
    data: {
      userId,
      comboId       
    },
  });

  return result;
};



type FormattedComboBooking = {
  bookingId: string;
  isPaid: string;
  status:string;
  user: {
    name: string;
    email: string;
    phone: string;
    profileImg?: any;
  };
  comboPack: {
    id: string;
    comboName: string;
    plan: string;
    amount: number;
    discountAmount: number;
    services: string[]; // Array of service names (string)
    providerName: string;
    providerCategory: string;
    providerImage?: string[];
    providerEmail?: string;
    providerContact?:string
  };
  createdAt: Date; // Change to string if you want to return a formatted date string
};

const getAllFromDB = async (userId:string): Promise<FormattedComboBooking[] | null> => {
  // Fetch all combo bookings with necessary relations
  const results: any[] = await prisma.comboBooking.findMany({
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
  const formattedBookings: FormattedComboBooking[] = [];

  for (const result of results) {
    // Check if ComboPack exists and has services
    if (!result.ComboPack || !result.ComboPack.services) {
      console.error(`Combo Pack or services not found for booking ID: ${result.id}`);
      continue; // Skip this booking and move to the next
    }

    // Fetch all service names from the services table
    const services = await prisma.service.findMany({
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
    }, {} as Record<string, string>);

    // Format the combo pack data with service names
    const formattedData: FormattedComboBooking = {
      bookingId: result.id,
      isPaid:result.isPaid,
      status:result.status,
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
        services: result.ComboPack.services.map((serviceId: string) => serviceMap[serviceId] || "Unknown Service"),
        providerName: `${result.ComboPack.provider.fName} ${result.ComboPack.provider.lName}`,
        providerCategory: result.ComboPack.provider.category?.categoryName || 'Unknown Category',
        providerImage: result.ComboPack.provider.profileImg,
        providerEmail:  result.ComboPack.provider.email,
        providerContact:  result.ComboPack.provider.contact

      },
      createdAt: result.createdAt,
    };

    // Add the formatted booking to the list
    formattedBookings.push(formattedData);
  }

  return formattedBookings.length > 0 ? formattedBookings : null;
};
const getAllFromDBForProvider = async (providerId: string): Promise<FormattedComboBooking[] | null> => {
  // Check the provider's role from the provider table
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { role: true },
  });

  if (!provider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Provider not found');
  }

  // Determine whether to show all bookings or filter by providerId
  let comboBookings: any[];

  if (provider.role === 'Admin') {
    // Admin can see all combo bookings
    comboBookings = await prisma.comboBooking.findMany({
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
  } else if (provider.role === 'Provider') {
    // Provider can only see their own combo bookings
    comboBookings = await prisma.comboBooking.findMany({
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
            profileImg:true
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
  } else {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized access');
  }

  if (!comboBookings || comboBookings.length === 0) {
    return null;
  }

  // Collect formatted combo booking data
  const formattedBookings: FormattedComboBooking[] = [];

  for (const booking of comboBookings) {
    // Check if ComboPack exists and has services
    if (!booking.ComboPack || !booking.ComboPack.services) {
      console.error(`Combo Pack or services not found for booking ID: ${booking.id}`);
      continue; // Skip this booking and move to the next
    }

    // Fetch all service names from the services table based on ComboPack services
    const services = await prisma.service.findMany({
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
    }, {} as Record<string, string>);

    // Format the combo pack data with service names
    const formattedData: FormattedComboBooking = {
      bookingId: booking.id,
      isPaid:booking.isPaid,
      status:booking.status,
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
        services: booking.ComboPack.services.map(
          (serviceId: string) => serviceMap[serviceId] || 'Unknown Service'
        ),
        providerName: `${booking.ComboPack.provider.fName} ${booking.ComboPack.provider.lName}`,
        providerCategory: booking.ComboPack.provider.category?.categoryName || 'Unknown Category',
      },
      createdAt: booking.createdAt,
    };

    // Add the formatted booking to the list
    formattedBookings.push(formattedData);
  }

  return formattedBookings.length > 0 ? formattedBookings : null;
};

const getByIdFromDB = async (id: string): Promise<FormattedComboBooking | null> => {
  // Check if the booking exists
  const isBookingExist = await prisma.comboBooking.findFirst({
    where: { id },
  });

  if (!isBookingExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Combo Booking does not exist');
  }

  // Fetch the booking with necessary relations
  const result = await prisma.comboBooking.findUnique({
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
  const services = await prisma.service.findMany({
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
  }, {} as Record<string, string>);

  // Format the combo pack data with service names
  const formattedData: FormattedComboBooking = {
    bookingId: result.id,
    isPaid:result.isPaid,
    status:result.status,
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
      providerCategory: result.ComboPack.provider.category?.categoryName || 'Unknown Category',
    },
    createdAt: result.createdAt,
  };

  return formattedData;
};

const updateComboBookingStatus = async (id: string, payload: any) => {
  console.log(payload,'355')
  // Check if the booking exists
  const existingBooking = await prisma.comboBooking.findUnique({
    where: { id }
  });

  if (!existingBooking) {
    throw new Error("Booking does not exist");
  }


  // Update the booking status
  const updatedBooking = await prisma.comboBooking.update({
    where: { id },
    data: { status: payload.status } // Pass status directly
  });

  return updatedBooking;
};






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


export const ComboBookingService = {
  insertIntoDB,
  getAllFromDB,
  getAllFromDBForProvider,
  getByIdFromDB,
  updateComboBookingStatus,
  deleteByIdFromDB,

};
