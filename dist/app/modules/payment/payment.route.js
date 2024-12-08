"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router.post('/success', payment_controller_1.PaymentController.paymentVerify);
router.post('/success/combo', payment_controller_1.PaymentController.paymentVerifyForCombo);
router.post('/init', payment_controller_1.PaymentController.initPayment);
router.post('/init/combo', payment_controller_1.PaymentController.initPaymentForCombo);
router.get('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), payment_controller_1.PaymentController.getAllFromDB);
router.get('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), payment_controller_1.PaymentController.deleteFromDB);
router.delete('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN), payment_controller_1.PaymentController.deleteFromDB);
exports.PaymentRoutes = router;
