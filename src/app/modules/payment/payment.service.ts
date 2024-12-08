// @typescript-eslint/no-unused-vars
import { Payment, PaymentStatus, Prisma, ProviderRole, Status } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { sslService } from '../ssl/ssl.service';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { generateSixDigitId } from '../../../helpers/IdGenerator';

const initPayment = async (data: any,userId:string) => {
  const transactionId = generateSixDigitId();
  const user = await prisma.user.findFirst({
    where: {
      id:userId,
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

  if(!user){
    throw new ApiError(httpStatus.NOT_FOUND,'User Not Found')
  }
 
  const paymentSession = await sslService.initPayment({
    total_amount: data.amount,
    tran_id: transactionId,
    cus_name: `${user?.fName} ${user?.lName}`,
    cus_email: user?.email,
    cus_add1: data.address,
    cus_phone: user?.contactNo,
    cus_country: data?.country,
    cus_state: data?.state,
    cus_city: data?.city,
    cus_postcode: data?.zipCode,
  });

 
   await prisma.payment.create({
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
};
const initPaymentForCombo = async (data: any,userId:string) => {
  const transactionId = generateSixDigitId();
  const user = await prisma.user.findFirst({
    where: {
      id:userId,
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

  if(!user){
    throw new ApiError(httpStatus.NOT_FOUND,'User Not Found')
  }
 
  const paymentSession = await sslService.initPaymentForCombo({
    total_amount: data.amount,
    tran_id: transactionId,
    cus_name: `${user?.fName} ${user?.lName}`,
    cus_email: user?.email,
    cus_add1: data.address,
    cus_phone: user?.contactNo,
    cus_country: data?.country,
    cus_state: data?.state,
    cus_city: data?.city,
    cus_postcode: data?.zipCode,
  });

  
  await prisma.comboPayment.create({
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
};




const paymentVerify = async (id: any): Promise<any> => {
  const isPaymentExist = await prisma.payment.findFirst({
    where: {
      transactionId: id,
    },
  });
  console.log(isPaymentExist,'96')

  if (!isPaymentExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment does not exist');
  }
  const result = await prisma.$transaction(async transactionClient => {
    // Update payment status to PAID
    const updatedPayments = await transactionClient.payment.updateMany({
      where: {
        transactionId: id,
      },
      data: {
        status: Status.Confirmed,
      },
    });

    if (updatedPayments) {
      await transactionClient.booking.update({
        where: {
          id: isPaymentExist?.bookingId,
        },
        data: {
          isPaid: PaymentStatus.Paid,
        },
      });
    }

    return updatedPayments;
  });
  return result;
};
const paymentVerifyForCombo = async (id: any): Promise<any> => {
  const isPaymentExist = await prisma.comboPayment.findFirst({
    where: {
      transactionId: id,
    },
  });
  console.log(isPaymentExist,'96')

  if (!isPaymentExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment does not exist');
  }
  const result = await prisma.$transaction(async transactionClient => {
    // Update payment status to PAID
    const updatedPayments = await transactionClient.comboPayment.updateMany({
      where: {
        transactionId: id,
      },
      data: {
        status: Status.Confirmed,
      },
    });

    if (updatedPayments) {
      await transactionClient.comboBooking.update({
        where: {
          id: isPaymentExist?.comboBookingId,
        },
        data: {
          isPaid: PaymentStatus.Paid,
        },
      });
    }

    return updatedPayments;
  });
  return result;
};


const getAllFromDB = async (providerId?: string): Promise<Payment[]> => {
  // Initialize the query object
  const query: Prisma.PaymentFindManyArgs = {
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
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },  // Now checking in the Provider table
  });

  if (!provider) {
    throw new ApiError(httpStatus.NOT_FOUND, "Provider not found");
  }

  const isAdmin = provider?.role === ProviderRole.Admin // Assuming Provider is linked to a User

  if (!isAdmin) {
    // If the user is not an admin, filter by providerId (matching services offered by this provider)
    query.where = {
      booking: {
        service: {
          providerId: providerId,  // Only show payments for this provider
        },
      },
    };
  }

  // If the user is an admin, no additional filter is needed (they can see all payments)

  // Fetch the payments from the database
  const result = await prisma.payment.findMany(query);

  return result;
};


const deleteFromDB = async (id: string): Promise<Payment | null> => {
  const result = await prisma.payment.delete({
    where: {
      id,
    },
  });
  return result;
};

export const PaymentService = {
  initPayment,
  initPaymentForCombo,
  getAllFromDB,
  deleteFromDB,
  paymentVerify,
  paymentVerifyForCombo
};
