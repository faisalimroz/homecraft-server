import { Review, ReviewProvider } from '@prisma/client';
import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

interface ReviewData {
  serviceId: string;
  rating: number;
  comment: string;
}


const postReview = async (
  data: any,
  userId: string
): Promise<Review> => {
  
  const reviewData = {
    ...data,
     userId 
  };

 
  const result = await prisma.review.create({
    data: reviewData,
    include: {
      user: true,
      service: true,
    
    },
  });

  return result;
};

const postProviderReview = async (
  data: any,
  userId: string
): Promise<ReviewProvider> => {
  console.log(data,'38')
 
  const reviewData = {
    ...data,
    userId,  
  };

 
  const result = await prisma.reviewProvider.create({
    data: reviewData,
    include: {
      user: true,
      provider: true,
    },
  });

  return result; 
};

const getAllReview = async (): Promise<Review[] | any> => {
  const result = await prisma.review.findMany({
    include: {
      user: true,
    },
    orderBy:{
      createdAt: 'desc'
    }
  });
  return result
  
};

const getReviewByServiceId = async (id: string): Promise<any[] | null> => {

  const result = await prisma.review.findMany({
    where: {
      serviceId: id,
    },
    include: {
      user: true,
    },
    orderBy:{
      createdAt: 'desc'
    }
  });
  return result;
};
const getReviewByProviderId = async (id: string): Promise<ReviewProvider[] | null> => {

  const result = await prisma.reviewProvider.findMany({
    where: {
      providerId: id,
    },
    include: {
      user: true,
    },
    orderBy:{
      createdAt: 'desc'
    }
  });
  return result;
};
const deleteReviewFromDB = async (id: string): Promise<any> => {

  const review = await prisma.review.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });

  
  if (!review) {
     throw new ApiError(httpStatus.NOT_FOUND,'Review not found')
  }

  
 const result =  await prisma.review.delete({
    where: {
       id,
    },
   
  });
  return result;
};
export const ReviewServices = {
  postReview,
  postProviderReview,
  getAllReview,
  getReviewByServiceId,
  getReviewByProviderId,
  deleteReviewFromDB
};
