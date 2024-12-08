import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import { ComboPackService } from './combo-pack.service';
import catchAsync from '../../../shared/catchAsync';
import { RequestHandler } from 'express';

const insertIntoDB: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId;

  const result = await ComboPackService.insertIntoDB(req.body,providerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Combo Pack post successfully',
    data: result,
  });
});

const getAllFromDBForProvider: RequestHandler = catchAsync(async (req, res) => {
  const providerId = req?.provider?.providerId
  const result = await ComboPackService.getAllFromDBForProvider(providerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Combo Pack Retrieve successfully',
    data: result,
  });
});
const getAllFromDB: RequestHandler = catchAsync(async (req, res) => {
  const result = await ComboPackService.getAllFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Combo Pack Retrieve successfully',
    data: result,
  });
});
const getSingleServiceFromDB: RequestHandler = catchAsync(async (req, res) => {
  const {id} = req.params;
  const result = await ComboPackService.getSingleServiceFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Combo Pack Retrieve successfully',
    data: result,
  });
});

const UpdateOneIntoDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ComboPackService.UpdateOneIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Combo Pack Updated successfully',
    data: result,
  });
});

const deleteByIdFromDB: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ComboPackService.deleteByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Combo Pack Deleted successfully',
    data: result,
  });
});


export const ComboPackController = {
  insertIntoDB,
  getAllFromDBForProvider,
  getAllFromDB,
  UpdateOneIntoDB,
  getSingleServiceFromDB,
  deleteByIdFromDB
};
