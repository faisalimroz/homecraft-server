"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComboBookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const combo_booking_controller_1 = require("./combo-booking.controller");
const router = express_1.default.Router();
router.get('/provider', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), combo_booking_controller_1.ComboBookingController.getAllFromDBForProvider);
router.get('/:id', combo_booking_controller_1.ComboBookingController.getByIdFromDB);
router.post('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.USER), combo_booking_controller_1.ComboBookingController.insertIntoDB);
router.get('/', combo_booking_controller_1.ComboBookingController.getAllFromDB);
router.patch('/:id', 
// auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.PROVIDER),
combo_booking_controller_1.ComboBookingController.updateComboBookingStatus);
router.delete('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.USER), combo_booking_controller_1.ComboBookingController.deleteByIdFromDB);
exports.ComboBookingRoutes = router;
