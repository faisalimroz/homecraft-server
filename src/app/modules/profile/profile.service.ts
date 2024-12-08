import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

interface Provider {
  id: string;
  fName: string;
  lName: string;
  email: string;
  role: string;
  gender: string;
  dob: Date;
  bio: string;
  categoryId: string;
  category: any; // Replace with the appropriate type
  contactNo: string;
  address: string;
  profileImg: string[];
  services: any[]; // Replace with the appropriate type
  createdAt: Date;
}

// Define User interface
interface User {
  id: string;
  fName: string;
  lName: string;
  email: string;
  contactNo: string;
  profileImg: string[];
  createdAt: Date;
}

const getProfile = async (providerId?: string, userId?: string): Promise<any> => {
  let result = null;

  // Check if providerId is provided, fetch provider data
  if (providerId) {
    result = await prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        fName: true,
        lName: true,
        email: true,
        role: true,
        gender: true,
        dob: true,
        bio: true,
        categoryId: true,
        category: true,
        contactNo: true,
        address: true,
        profileImg: true,
        services: true,
        createdAt: true,
      },
    });

    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Provider not found');
    }

    return result; // Return only provider data if found
  }

  // Check if userId is provided, fetch user data
  if (userId) {
    result = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fName: true,
        lName: true,
        email: true,
        role: true,
        contactNo: true,
        profileImg: true,
        createdAt: true,
      },
    });

    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    return result; // Return only user data if found
  }

  // If neither providerId nor userId is provided, or no valid result is found
  throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide either providerId or userId');
};


export const ProfileService = {
  getProfile,
};
