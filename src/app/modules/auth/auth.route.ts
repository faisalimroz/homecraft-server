import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validate';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.post(
  '/signup',
  // validateRequest(AuthValidation.signupZodSchema),
  AuthController.createUser
);
router.post(
  '/provider/signup',
  // validateRequest(AuthValidation.signupZodSchema),
  AuthController.ProviderSignup
);
router.post(
  '/login',
  // validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginUser
);
router.post(
  '/provider/login',
  // validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginProvider
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenZodSchema),
  AuthController.refreshToken
);

router.patch(
  '/change-password/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER, ENUM_USER_ROLE.USER),
  validateRequest(AuthValidation.changePasswordZodSchema),
  AuthController.changePassword
);
router.post(
  '/forgot-password',
  AuthController.forgotPassword
);
router.post(
  '/reset-password',
  AuthController.resetPassword
);

export const AuthRoutes = router;
