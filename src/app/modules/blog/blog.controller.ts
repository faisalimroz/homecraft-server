import { RequestHandler } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BlogService } from './blog.service';

const insertIntoDB: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId;
  const result = await BlogService.insertIntoDB(req.body,providerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blog created successfully',
    data: result,
  });
});

const getAllFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { categoryId, month, year } = req.query; 
  
  const parsedMonth = month ? parseInt(month as string, 10) : undefined;
  const parsedYear = year ? parseInt(year as string, 10) : undefined;

  const result = await BlogService.getAllFromDB(categoryId as string, parsedMonth, parsedYear);


  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blogs fetched successfully',
    data: result,
  });
});
const getAllProviderBlogFromDB: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId;
  const result = await BlogService.getAllProviderBlogFromDB(providerId);


  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blogs fetched successfully',
    data: result,
  });
});

const getLatestTenFromDB: RequestHandler = catchAsync(async (req, res) => {
  const blogId  = req.query.blogId as string;
  const result = await BlogService.getLatestTenFromDB(blogId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Latest Blogs fetched successfully',
    data: result,
  });
});

const getBlogsByCategoryFromDB: RequestHandler = catchAsync(async (req, res) => {
  const categoryId = req.query.categoryId as string;
  const blogId  = req.query.blogId as string;
  const result = await BlogService.getBlogsByCategoryFromDB(categoryId,blogId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Similar Blogs fetched successfully',
    data: result,
  });
});
const getByIdFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BlogService.getByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blogs fetched successfully',
    data: result,
  });
});

const updateOneInDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BlogService.updateOneInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blogs updated successfully',
    data: result,
  });
});

const deleteByIdFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BlogService.deleteByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blogs deleted successfully',
    data: result,
  });
});

export const BlogController = {
  insertIntoDB,
  getAllFromDB,
  getAllProviderBlogFromDB,
  getLatestTenFromDB,
  getBlogsByCategoryFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
