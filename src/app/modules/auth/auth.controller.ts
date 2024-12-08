import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';

const createUser: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthService.Signup(req.body);
  delete result.password;

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User created successfully!',
    data: result,
  });
});
const ProviderSignup: RequestHandler = catchAsync(async (req, res) => {
  const result = await AuthService.ProviderSignup(req.body);
  delete result.password;

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Account created. Await admin approval and check your email',
    data: result,
  });
});

const loginUser: RequestHandler = catchAsync(async (req, res) => {
  const { ...loginData } = req.body;
  const result = await AuthService.LoginUser(loginData);
  const { refreshToken, token } = result;

  //set refresh token into cookie

  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.send({
    statusCode: 200,
    success: true,
    message: 'Login Successfully!',
    token,
  });
});
const loginProvider: RequestHandler = catchAsync(async (req, res) => {
  const { ...loginData } = req.body;
  const result = await AuthService.LoginProvider(loginData);
  const { refreshToken, token } = result;

  //set refresh token into cookie

  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.send({
    statusCode: 200,
    success: true,
    message: 'Login Successfully!',
    token,
  });
});

const refreshToken: RequestHandler = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.RefreshToken(refreshToken);

  // set refresh token into cookie

  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User signin successfully',
    data: result,
  });
});

const changePassword: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { ...passwordData } = req.body;

  await AuthService.changePassword(passwordData, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully !',
  });
});
const forgotPassword: RequestHandler = catchAsync(async (req, res) => {
  
  const { email } = req.body;

  const message = await AuthService.forgotPassword(email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message:message
  });
});

const resetPassword: RequestHandler = catchAsync(async (req, res) => {
  
  const { token, newPassword } = req.body;

  const message = await AuthService.resetPassword(token, newPassword );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message:message
  });
});

export const AuthController = {
  createUser,
  ProviderSignup,
  loginUser,
  loginProvider,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword
};
