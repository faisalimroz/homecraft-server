"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailbilityRoutes = void 0;
const express_1 = __importDefault(require("express"));
const availbility_controller_1 = require("./availbility.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router.delete('/', availbility_controller_1.AvailbilityController.deleteAvailbility);
router.post('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), availbility_controller_1.AvailbilityController.createAvailbility);
router.get('/', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.PROVIDER), availbility_controller_1.AvailbilityController.getAllAvailbilityForProvider);
router.get('/all', availbility_controller_1.AvailbilityController.getAllAvailbility);
exports.AvailbilityRoutes = router;
