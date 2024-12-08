import express from 'express';
import { ProfileController } from './profile.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER, ENUM_USER_ROLE.USER),
  ProfileController.getProfile
);

export const ProfileRoutes = router;
