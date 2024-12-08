import { Category } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { queryHelpers } from '../../../helpers/queryHelpers';
import { IGenericResponse } from '../../../interfaces/common';
import cloudinary from 'cloudinary';

const insertIntoDB = async (data: Category): Promise<Category> => {
  const { categoryName, categoryImg, categoryIcon } = data;
  
  // Upload category image and icon concurrently
  const [imageUploadResponse, iconUploadResponse] = await Promise.all([
    cloudinary.v2.uploader.upload(categoryImg, {
      folder: 'Home Crafter/Category/images',
    }),
    cloudinary.v2.uploader.upload(categoryIcon, {
      folder: 'Home Crafter/Category/icons',
      resource_type: 'image',
      format: 'png'
     
    })
  ]);

  const updatedCategoryImg = imageUploadResponse.secure_url;
  const updatedCategoryIcon = iconUploadResponse.secure_url;
  

  // Insert into database
  const result = await prisma.category.create({
    data: {
      categoryName,
      categoryImg: updatedCategoryImg,
      categoryIcon: updatedCategoryIcon,
    },
  });

  return result;
};





const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<Category[]>> => {
  const { limit, page } = queryHelpers.calculatePagination(options);

  const result = await prisma.category.findMany({
  
    include: {
      _count: {
        select: {
          services: true,  
        },
      },
    },
  });

  const total = await prisma.category.count();

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result
  };
};


const getAllNameFromDB = async (): Promise<{ id: string; name: string }[]> => {
  const result = await prisma.category.findMany({
    select: {
      id: true,
      categoryName: true,  // Assuming the name field is called `categoryName`
    },
  });

  return result.map(({ id, categoryName }) => ({ id, name: categoryName }));
};



// const getByIdFromDB = async (id: string): Promise<Category | null> => {
//   const isCategoryExist = await prisma.category.findFirst({
//     where: {
//       id,
//     },
//   });

//   if (!isCategoryExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Category does not exist');
//   }

//   const result = await prisma.category.findUnique({
//     where: {
//       id,
//     },
//   });
//   return result;
// };

const updateOneInDB = async (
  id: string,
  payload: Partial<Category>
): Promise<Category> => {
  const isCategoryExist = await prisma.category.findFirst({
    where: {
      id,
    },
  });

  if (!isCategoryExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category does not exist');
  }

  const result = await prisma.category.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Category> => {
  const result = await prisma.$transaction(async prismaClient => {
    const existingCategory = await prismaClient.category.findFirst({
      where: {
        id,
      },
      include: {
        services: true, // Include associated services
      },
    });

    if (!existingCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Category does not exist');
    }

    // Delete the associated services
    await prismaClient.service.deleteMany({
      where: {
        categoryId: id,
      },
    });

    // Delete the category
    const deletedCategory = await prismaClient.category.delete({
      where: {
        id,
      },
    });

    return deletedCategory;
  });

  return result;
};

export const CategoryService = {
  insertIntoDB,
  getAllFromDB,
  getAllNameFromDB,
  // getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
