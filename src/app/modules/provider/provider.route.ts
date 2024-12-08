import express from 'express';
import { ProviderController } from './provider.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */

const router = express.Router();

router.patch(
  '/:id/status',
//   validateRequest(UserValidation.userUpdateZodSchema),
  auth( ENUM_USER_ROLE.ADMIN),
  ProviderController.updateStatusInDB
);

router.get(
  '/',
 
  ProviderController.getAllFromDB
);

router.get(
  '/admin',
  auth( ENUM_USER_ROLE.ADMIN),
  ProviderController.getAllFromDBForAdmin
);

router.get(
  '/:id',
  ProviderController.getByIdFromDB
);
router.patch(
  '/:id',
//   validateRequest(UserValidation.userUpdateZodSchema),
  auth(ENUM_USER_ROLE.PROVIDER, ENUM_USER_ROLE.ADMIN),
  ProviderController.updateOneInDB
);

router.delete(
  '/:id',
  auth( ENUM_USER_ROLE.ADMIN),
  ProviderController.deleteByIdFromDB
);

export const ProviderRoutes = router;
