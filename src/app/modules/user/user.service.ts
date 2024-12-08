/* eslint-disable no-undef */
/* @typescript-eslint/no-unused-vars */

import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { IResponseUser } from './user.interface';
import cloudinary from 'cloudinary';
import { sendEMail } from '../../utils/sendMail';
import fs from 'fs/promises';



const getAllFromDB = async (): Promise<Partial<IResponseUser[]>> => {
  const result = await prisma.user.findMany({
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
  return result;
};

const getByIdFromDB = async (id: string): Promise<IResponseUser | null> => {
  const result = await prisma.user.findUnique({
    where: {
      id,
    },
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
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Found!');
  }
  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<User>
): Promise<IResponseUser> => {
  const isUserExist = await prisma.user.findFirst({
    where: {
      id,
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // Destructure payload
  let { profileImg }: any = payload;
  const { password, ...userData }: any = payload;

  // Handle profile image update
  if (profileImg) {
    // Upload new profile image to Cloudinary
    let images: any = [];
    if (typeof profileImg === 'string') {
      images.push(profileImg);
    } else {
      images = profileImg;
    }

    const imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: 'auth',
      });
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    profileImg = imagesLinks.map(image => image.url);

    // Delete old profile image(s) if they exist
    if (isUserExist.profileImg && isUserExist.profileImg.length > 0) {
      // Assuming profileImg is an array of URLs
      const publicIds = isUserExist.profileImg.map(url =>
        url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'))
      );

      // Delete images from Cloudinary
      await Promise.all(
        publicIds.map(publicId =>
          cloudinary.v2.uploader.destroy(publicId, { invalidate: true })
        )
      );
    }
  }

  // Handle password update
  if (password) {
    const salt = await bcrypt.genSalt(Number(config.bycrypt_salt_rounds));
    const hashedPassword = await bcrypt.hash(password, salt);
    userData.password = hashedPassword;
  }

  // Update user data in the database
  const result = await prisma.user.update({
    where: {
      id,
    },
    data: {
      ...userData,
      profileImg: profileImg || isUserExist.profileImg, // Keep old image(s) if new one is not provided
    },
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

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<IResponseUser> => {
  // Check if the user exists and select only necessary fields
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fName: true,
      lName: true,
      email: true,
      contactNo: true,
      profileImg: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // Perform a transaction to delete the user and related entities
  await prisma.$transaction(async (prisma) => {
    // Delete the user's comments
    await prisma.comment.deleteMany({
      where: {
        userId: id,
      },
    });

    // Delete the user's reviews
    await prisma.review.deleteMany({
      where: {
        userId: id,
      },
    });

    // Delete the user's bookings
    await prisma.booking.deleteMany({
      where: {
        userId: id,
      },
    });

    // Finally, delete the user
    await prisma.user.delete({
      where: {
        id,
      },
    });
  });

  // Return the deleted user's data in IResponseUser format
  return user;
};

export const UserService = {

  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
