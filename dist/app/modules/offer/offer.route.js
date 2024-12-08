"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const offer_controller_1 = require("./offer.controller");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PROVIDER, user_1.ENUM_USER_ROLE.ADMIN), offer_controller_1.OfferController.insertIntoDB);
router.get('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PROVIDER, user_1.ENUM_USER_ROLE.ADMIN), offer_controller_1.OfferController.getAllFromDB);
router.patch('/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.PROVIDER), offer_controller_1.OfferController.updateOneInDB);
router.delete('/:id', offer_controller_1.OfferController.deleteByIdFromDB);
exports.OfferRoutes = router;
