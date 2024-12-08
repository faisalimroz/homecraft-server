import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProviderService } from './provider.service';

const getAllFromDB: RequestHandler = catchAsync(async (req, res) => {
  const result = await ProviderService.getAllFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Provider retrieved successfully !',
    data: result,
  });
});

const getAllFromDBForAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await ProviderService.getAllFromDBForAdmin();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users retrieved successfully !',
    data: result,
  });
});

const getByIdFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProviderService.getByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Provider fetched successfully!',
    data: result,
  });
});

const updateOneInDB: RequestHandler = catchAsync(async (req, res) => {
  console.log(req.body,'31')
  const { id } = req.params;
  const result = await ProviderService.updateOneInDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Provider updated successfully!',
    data: result,
  });
});

const updateStatusInDB: RequestHandler = catchAsync(async (req, res) => {

  const { id } = req.params;
  const result = await ProviderService.updateStatusInDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Provider status updated successfully!',
    data: result,
  });
});

const deleteByIdFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProviderService.deleteByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User deleted successfully!',
    data: result,
  });
});

export const ProviderController = {
  getAllFromDB,
  getAllFromDBForAdmin,
  getByIdFromDB,
updateOneInDB,
updateStatusInDB,
  deleteByIdFromDB,
};
