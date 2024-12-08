"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../modules/auth/auth.route");
// import { UserRoutes } from '../modules/user/user.route';
const category_route_1 = require("../modules/category/category.route");
const service_route_1 = require("../modules/services/service.route");
const review_route_1 = require("../modules/review/review.route");
const comment_route_1 = require("../modules/comment/comment.route");
// import { FaqRoutes } from '../modules/faq/faq.route';
const blog_route_1 = require("../modules/blog/blog.route");
const profile_route_1 = require("../modules/profile/profile.route");
const availbility_routes_1 = require("../modules/availbility/availbility.routes");
const booking_route_1 = require("../modules/booking/booking.route");
// import { FeedbackRoutes } from '../modules/feedback/feedback.route';
const payment_route_1 = require("../modules/payment/payment.route");
const offer_route_1 = require("../modules/offer/offer.route");
const provider_route_1 = require("../modules/provider/provider.route");
const user_route_1 = require("../modules/user/user.route");
const combo_pack_route_1 = require("../modules/combo-pack/combo-pack.route");
const combo_booking_route_1 = require("../modules/combo-booking/combo-booking.route");
const faq_route_1 = require("../modules/faq/faq.route");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/categories',
        route: category_route_1.CategoryRoutes,
    },
    {
        path: '/services',
        route: service_route_1.ServiceRoutes,
    },
    {
        path: '/availbility',
        route: availbility_routes_1.AvailbilityRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: '/user',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/provider',
        route: provider_route_1.ProviderRoutes,
    },
    {
        path: '/profile',
        route: profile_route_1.ProfileRoutes,
    },
    {
        path: '/booking',
        route: booking_route_1.BookingRoutes,
    },
    {
        path: '/payment',
        route: payment_route_1.PaymentRoutes,
    },
    {
        path: '/blogs',
        route: blog_route_1.BlogRoutes,
    },
    {
        path: '/reviews',
        route: review_route_1.ReviewRoutes,
    },
    {
        path: '/comments',
        route: comment_route_1.CommentRoutes,
    },
    {
        path: '/offer',
        route: offer_route_1.OfferRoutes,
    },
    {
        path: '/combo-pack',
        route: combo_pack_route_1.ComboPackRoutes,
    },
    {
        path: '/combo-booking',
        route: combo_booking_route_1.ComboBookingRoutes,
    },
    {
        path: '/faqs',
        route: faq_route_1.FaqRoutes,
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
