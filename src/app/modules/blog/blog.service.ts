import { Blog, ProviderRole } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import cloudinary from 'cloudinary';

type BlogPreview = {
  id: string;
  title: string;
  blogImg: string[];
  createdAt: Date;
};

const insertIntoDB = async (data: Blog,providerId:string): Promise<Blog> => {
  const { title, content, categoryId } = data;
  let { blogImg } = data;

  
  if (!blogImg || typeof blogImg !== 'string') {
    throw new Error('No image selected. Please upload a valid image.');
  }


  try {
    const myCloud = await cloudinary.v2.uploader.upload(blogImg, {
      folder: 'Home Crafter/Blogs',
    });

    blogImg = [myCloud.secure_url];
  } catch (error) {
    throw new Error('Image upload failed. Please try again.');
  }

  const result = await prisma.blog.create({
    data: {
      title,
      content,
      blogImg,
      categoryId,
      providerId,
    },
  });

  return result;
};

const getAllFromDB = async (categoryId?: string, month?: number, year?: number): Promise<Blog[]> => {
  const whereConditions: any = {};

  if (categoryId) {
    whereConditions.categoryId = categoryId;
  }

  if (month && year) {
    whereConditions.createdAt = {
      gte: new Date(year, month - 1, 1), 
      lt: new Date(year, month, 1) // 
    };
  }

  const result = await prisma.blog.findMany({
    where: whereConditions,
    include: {
      category: true,
      provider: true,
    
    }
  });
  return result;
};

const getAllProviderBlogFromDB = async (providerId?: string): Promise<Blog[]> => {
  if (!providerId) {
    throw new Error('Provider ID is required');
  }

  // Step 1: Find the provider by providerId to check their role
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { role: true }, // Assuming 'role' is a field in your provider table
  });

  if (!provider) {
    throw new Error('Provider not found');
  }

  // Step 2: Use a switch case to handle different roles
  let result;

  switch (provider.role) {
    case ProviderRole.Provider:
      // If the role is 'Provider', find blogs specific to that providerId
      result = await prisma.blog.findMany({
        where: { providerId: providerId }, // Filter by providerId
        include: {
          category: true,
          provider: true,
        },
      });
      break;

    case ProviderRole.Admin:
      // If the role is 'Admin', retrieve all blogs
      result = await prisma.blog.findMany({
        include: {
          category: true,
          provider: true,
        },
      });
      break;

    default:
      throw new Error('Invalid provider role');
  }

  return result;
};

const getLatestTenFromDB = async (excludedBlogId: string): Promise<BlogPreview[]> => {
  const result = await prisma.blog.findMany({
    where: {
      id: {
        not: excludedBlogId,
      },
    },
    select: {
      id: true,
      title: true,
      blogImg: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return result;
};


const getBlogsByCategoryFromDB = async (categoryId: string, excludedBlogId: string): Promise<BlogPreview[]> => {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        categoryId: categoryId,
        id: {
          not: excludedBlogId,
        },
      },
      select: {
        id: true,
        title: true,
        blogImg: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });


  

    if (blogs.length === 0) {
      console.log('No blogs found in this category excluding the specified blog.');
      // Optional: handle case when no blogs are found
    }

    return blogs;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error('An error occurred while fetching blogs.');
  }
};

const getByIdFromDB = async (id: string): Promise<Blog | null> => {
  const isBlogExist = await prisma.blog.findFirst({
    where: {
      id,
    },
   
  });

  if (!isBlogExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog does not exist');
  }

  const result = await prisma.blog.findUnique({
    where: {
      id,
    },
    include:{
      category: true,
      provider:true
    }
  });
  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<Blog>
): Promise<Blog> => {
  const isBlogExist = await prisma.blog.findFirst({
    where: {
      id,
    },
  });

  if (!isBlogExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog does not exist');
  }

  const result = await prisma.blog.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Blog> => {
  const isBlogExist = await prisma.blog.findFirst({
    where: {
      id,
    },
  });

  if (!isBlogExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog does not exist');
  }

  const data = await prisma.blog.delete({
    where: {
      id,
    },
  });
  return data;
};

export const BlogService = {
  insertIntoDB,
  getAllFromDB,
  getAllProviderBlogFromDB,
  getLatestTenFromDB,
  getBlogsByCategoryFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
