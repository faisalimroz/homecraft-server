import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { ComboBookingController } from './combo-booking.controller';

const router = express.Router();


router.get('/provider', auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER), ComboBookingController.getAllFromDBForProvider);
router.get('/:id', ComboBookingController.getByIdFromDB);


router.post(
  '/',
  auth(ENUM_USER_ROLE.USER),
  ComboBookingController.insertIntoDB
);

router.get('/', ComboBookingController.getAllFromDB);

router.patch(
  '/:id',

  // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER),
  ComboBookingController.updateComboBookingStatus
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  ComboBookingController.deleteByIdFromDB
);

export const ComboBookingRoutes = router;
