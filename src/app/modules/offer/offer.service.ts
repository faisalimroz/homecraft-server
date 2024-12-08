import { Offer, offerStatus, ProviderRole } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: Offer, providerId: string): Promise<Offer> => {
  
  const newOfferData = {
    ...data, 
    providerId, 
  };


  const result = await prisma.offer.create({
    data: newOfferData,
  });

  return result;
};

const getAllFromDB = async (providerId: string): Promise<Offer[]> => {
  // Get the current date
  const currentDate = new Date();

  // Fetch the provider's role from the provider table
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { role: true },
  });

  if (!provider) {
    throw new Error("Provider not found");
  }

  // Determine the query based on the provider's role
  let offers: Offer[] = [];

  if (provider.role === ProviderRole.Provider) {
    // If the role is 'Provider', fetch only the offers associated with the providerId
    offers = await prisma.offer.findMany({
      where: {
        providerId, // Directly filter by providerId, the foreign key
      },
    });
  } else if (provider.role === ProviderRole.Admin) {
    // If the role is 'Admin', fetch all offers
    offers = await prisma.offer.findMany();
  }

  // Update the status of each offer based on the end date
  const updatedOffers = await Promise.all(
    offers.map(async (offer) => {
      const newStatus =
        offer.endDate < currentDate ? offerStatus.Inactive : offerStatus.Active;

      if (offer.status !== newStatus) {
        // Update the offer status if it has changed
        return prisma.offer.update({
          where: { id: offer.id },
          data: { status: newStatus },
        });
      }

      return offer;
    })
  );

  return updatedOffers;
};




const updateOneInDB = async (
  id: string,
  payload: Partial<Offer>
): Promise<Offer> => {
  const isofferExist = await prisma.offer.findFirst({
    where: {
      id,
    },
  });

  if (!isofferExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Offer does not exist');
  }

  const result = await prisma.offer.update({ 
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Offer> => {
  const isofferExist = await prisma.offer.findFirst({
    where: {
      id,
    },
  });

  if (!isofferExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'faq does not exist');
  }

  const data = await prisma.offer.delete({
    where: {
      id,
    },
  });
  return data;
};

export const OfferService = {
  insertIntoDB,
  getAllFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
