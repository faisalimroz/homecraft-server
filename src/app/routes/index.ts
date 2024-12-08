import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
// import { UserRoutes } from '../modules/user/user.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { ServiceRoutes } from '../modules/services/service.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { CommentRoutes } from '../modules/comment/comment.route';
// import { FaqRoutes } from '../modules/faq/faq.route';
import { BlogRoutes } from '../modules/blog/blog.route';
import { ProfileRoutes } from '../modules/profile/profile.route';
import { AvailbilityRoutes } from '../modules/availbility/availbility.routes';
import { BookingRoutes } from '../modules/booking/booking.route';
// import { FeedbackRoutes } from '../modules/feedback/feedback.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { OfferRoutes } from '../modules/offer/offer.route';
import { ProviderRoutes } from '../modules/provider/provider.route';
import { UserRoutes } from '../modules/user/user.route';
import { ComboPackRoutes } from '../modules/combo-pack/combo-pack.route';
import { ComboBookingRoutes } from '../modules/combo-booking/combo-booking.route';
import { FaqRoutes } from '../modules/faq/faq.route';

const router = express.Router();

const moduleRoutes = [
  
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/services',
    route: ServiceRoutes,
  },
  {
    path: '/availbility',
    route: AvailbilityRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/provider',
    route: ProviderRoutes,
  },
  {
    path: '/profile',
    route: ProfileRoutes,
  },
  {
    path: '/booking',
    route: BookingRoutes,
  },
  {
    path: '/payment',
    route: PaymentRoutes,
  },
  {
    path: '/blogs',
    route: BlogRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/comments',
    route: CommentRoutes,
  },
  {
    path: '/offer',
    route: OfferRoutes,
  },
  {
    path: '/combo-pack',
    route: ComboPackRoutes,
  },
  {
    path: '/combo-booking',
    route: ComboBookingRoutes,
  },
  {
    path: '/faqs',
    route: FaqRoutes,
  },
 
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
