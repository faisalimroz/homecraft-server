import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { BookingController } from './booking.controller';

const router = express.Router();

router.get('/user',auth(ENUM_USER_ROLE.USER), BookingController.getAllFromDBForUser);
router.get('/check-available-slot', BookingController.fetchBookingsForDate);
router.get('/:id', BookingController.getByIdFromDB);
router.get('/statistics', BookingController.getStatistics);

router.post(
  '/',
  auth(ENUM_USER_ROLE.USER),
  BookingController.insertIntoDB
);

router.get('/',auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER), BookingController.getAllFromDB);

router.patch(
  '/:id',

  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER),
  BookingController.updateOneInDB
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  BookingController.deleteByIdFromDB
);

export const BookingRoutes = router;
