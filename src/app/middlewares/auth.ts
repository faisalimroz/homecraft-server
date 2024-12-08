import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { jwtHelpers } from '../../helpers/jwtHelpers';

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get authorization token
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      // Verify token
      const verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret);

   

      // Check user role and set req.user or req.provider
      if (verifiedUser.role === 'Provider' || verifiedUser.role === 'Admin') {
        req.provider = verifiedUser; 
      } else if (verifiedUser.role === 'User') {
        req.user = verifiedUser; 
      }

      // Role-based authorization guard
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
