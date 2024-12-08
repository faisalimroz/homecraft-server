import express from 'express';
import { AvailbilityController } from './availbility.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.delete('/', AvailbilityController.deleteAvailbility);
router.post('/', auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER), AvailbilityController.createAvailbility);
router.get('/', auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER),AvailbilityController.getAllAvailbilityForProvider);
router.get('/all',AvailbilityController.getAllAvailbility);


export const AvailbilityRoutes = router;
