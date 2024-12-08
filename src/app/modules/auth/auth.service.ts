// @typescript-eslint/no-unused-vars
import { Provider, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import prisma from '../../../shared/prisma';
import cloudinary from 'cloudinary';
import fs from "fs/promises";
import path from 'path';

import {
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface';
import { generateResetToken } from '../../../helpers/generateResetToken';
import { sendEMail } from '../../utils/sendMail';

const Signup = async (data: User): Promise<Partial<User>> => {
  const { fName,lName, email, password, contactNo } = data;

  const isEmailExist = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (isEmailExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exits');
  }

  let { profileImg } = data;
  let images: any = [];

  if (typeof profileImg === 'string') {
    images.push(profileImg);
  } else {
    images = profileImg;
  }
  if (!profileImg) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please Select Image');
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: 'Home Crafter/Auth/User',
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  profileImg = imagesLinks.map(image => image.url);

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bycrypt_salt_rounds)
  );
  const result = await prisma.user.create({
    data: {
      fName,
      lName,
      email,
      password: hashedPassword,
      contactNo,
      profileImg,
      createdAt: new Date(),
    },
  });

  return result;
};

const ProviderSignup = async (data: Provider): Promise<Partial<Provider>> => {
  const { fName,lName, email, password, contactNo,gender,dob,bio,categoryId,address } = data;

  const isEmailExist = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (isEmailExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exits');
  }

  let { profileImg } = data;
  let images: any = [];

  if (typeof profileImg === 'string') {
    images.push(profileImg);
  } else {
    images = profileImg;
  }
  if (!profileImg) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please Select Image');
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: 'Home Crafter/Auth/Provider',
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  profileImg = imagesLinks.map(image => image.url);

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bycrypt_salt_rounds)
  );
  const result = await prisma.provider.create({
    data: {
      fName,
      lName,
      email,
      password: hashedPassword,
      contactNo,
      profileImg,
      gender,
      dob,
      bio,
      categoryId,
      address
    
    },
  });

  return result;
};

const LoginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  // Check if the user exists
  const isUserExist = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  // Check if the provider exists
  const isProviderExist = await prisma.provider.findFirst({
    where: {
      email,
    },
  });

  // If neither user nor provider exists, throw an error
  if (!isUserExist && !isProviderExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User or Provider does not exist');
  }

  // Variables to store the tokens and role
  let token: string;
  let refreshToken: string;
  let role: string;

  if (isUserExist) {
    // Check the password for the user
    if (!(await bcrypt.compare(password, isUserExist.password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Email or Password is incorrect');
    }

    // Generate tokens for the user
    const { id: userId } = isUserExist;
    role = isUserExist.role;
    token = jwtHelpers.createToken(
      { userId, role },
      config.jwt.secret as Secret,
      config.jwt.expires_in as string
    );
    refreshToken = jwtHelpers.createToken(
      { userId, role },
      config.jwt.refresh_secret as Secret,
      config.jwt.refresh_expires_in as string
    );
  } else if (isProviderExist) {
    // Check the password for the provider
    if (!(await bcrypt.compare(password, isProviderExist.password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Email or Password is incorrect');
    }

    // Check the approval status for the provider
    const { approvalStatus } = isProviderExist;
    if (approvalStatus === 'Pending') {
      throw new ApiError(httpStatus.FORBIDDEN, 'Your account is pending approval. Please wait for admin approval.');
    }

    if (approvalStatus === 'Rejected') {
      throw new ApiError(httpStatus.FORBIDDEN, 'Your account has been rejected. Please contact support for further assistance.');
    }

    // Generate tokens for the provider
    const { id: providerId } = isProviderExist;
    role = isProviderExist.role;
    token = jwtHelpers.createToken(
      { providerId, role },
      config.jwt.secret as Secret,
      config.jwt.expires_in as string
    );
    refreshToken = jwtHelpers.createToken(
      { providerId, role },
      config.jwt.refresh_secret as Secret,
      config.jwt.refresh_expires_in as string
    );
  } else {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An unexpected error occurred');
  }

  // Return the tokens
  return {
    token,
    refreshToken,
  };
};

const LoginProvider = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  const isProviderExist = await prisma.provider.findFirst({
    where: {
      email,
    },
  });
  console.log(isProviderExist)

  if (!isProviderExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Provider does not exist');
  }

  if (
    isProviderExist.password &&
    !(await bcrypt.compare(password, isProviderExist.password))
  ) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Email or Password is incorrect'
    );
  }

  // Check the approval status
  const { approvalStatus } = isProviderExist;
  
  if (approvalStatus === 'Pending') {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Your account is pending approval. Please wait for admin approval.'
    );
  }

  if (approvalStatus === 'Rejected') {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Your account has been rejected. Please contact support for further assistance.'
    );
  }

  
  const { id: providerId, role } = isProviderExist;

  const token = jwtHelpers.createToken(
    { providerId, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { providerId, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    token,
    refreshToken,
  };
};


const RefreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  //verify token

  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }
  // console.log(verifiedToken);
  const { userId } = verifiedToken;

  // checking deleted user's refresh token

  const isUserExist = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }
  //generate new token
  const { id, role } = isUserExist;
  const newAccessToken = jwtHelpers.createToken(
    {
      id: id,
      role: role,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    token: newAccessToken,
  };
};

const changePassword = async (payload: any, id: string): Promise<void> => {
  const { oldPassword, newPassword } = payload;

  // Check if user exists
  const isUserExist = await prisma.user.findUnique({
    where: { id: id },
  });

  // Variable to check if user or provider
  let isProvider = false;

  // If user not found, check if provider exists
  if (!isUserExist) {
    const isProviderExist = await prisma.provider.findUnique({
      where: { id: id },
    });

    if (!isProviderExist) {
      throw new Error('User or Provider does not exist');
    }
    
    isProvider = true; // Mark as a provider
  }

  // Check old password for both user and provider
  const passwordToCompare = isProvider 
    ? (await prisma.provider.findUnique({ where: { id } }))?.password 
    : isUserExist?.password; // Use optional chaining to avoid null errors

  // Check if passwordToCompare is available before comparing
  if (passwordToCompare && !(await bcrypt.compare(oldPassword, passwordToCompare))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Old Password is incorrect');
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10); // You can adjust the salt rounds as needed

  // Update password in the appropriate table
  if (isProvider) {
    await prisma.provider.update({
      where: { id: id },
      data: {
        password: hashedPassword,
      },
    });
  } else if (isUserExist) { // Ensure isUserExist is not null before updating
    await prisma.user.update({
      where: { id: id },
      data: {
        password: hashedPassword,
      },
    });
  }
};


const forgotPassword = async (email: string): Promise<string> => {
  let userOrProvider: any = await prisma.user.findUnique({
    where: { email },
  });

  let isUser = true;

  // If no user is found, check if it's a provider
  if (!userOrProvider) {
    isUser = false;
    userOrProvider = await prisma.provider.findUnique({
      where: { email },
    });
  }

  // If neither user nor provider found, throw an error
  if (!userOrProvider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User or Provider does not exist');
  }

  // Check if SMTP_MAIL is configured
  if (!config.SMTP_MAIL) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'SMTP_MAIL is not defined in the configuration.');
  }

  // Generate reset token and its expiration date
  const { hashedToken, expires } = await generateResetToken();

  // Update reset token and expiration date based on user type
  if (isUser) {
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: expires,
      },
    });
  } else {
    await prisma.provider.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: expires,
      },
    });
  }

  // Define the email subject and sender
  const subject = 'Home Crafter - Password Recovery';
  const from = config.SMTP_MAIL;

  // Embed the HTML content directly in the code
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Home Crafter - Password Reset Request</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #fff;
                border-radius: 10px;
                padding: 40px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 10px;
                border-bottom: 1px solid #eaeaea;
            }
            h1 {
                font-size: 24px;
                color: #333;
                margin-bottom: 20px;
                text-align: center;
            }
            p {
                font-size: 16px;
                color: #555;
                line-height: 1.5;
                margin: 20px 0;
            }
            .reset-button {
                text-align: center;
                margin: 30px 0;
            }
            .reset-button a {
                background-color: #4f46e5;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
                box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2);
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #888;
            }
            .footer p {
                margin: 0;
            }
            .footer a {
                color: #888;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><span style="color: #4f46e5;">Home</span> Crafter</h1>
            </div>
            <h1>Password Reset Request</h1>
            <p>We received a request to reset your password for your account associated with ${email}. If you made this request, please click the button below to reset your password:</p>
            <div class="reset-button">
                <a href="http://localhost:3000/reset-password?token=${hashedToken}" target="_blank">Reset Your Password</a>
            </div>
            <p>If you did not request a password reset, you can safely ignore this email. Your password will not be changed until you access the link above and create a new one.</p>
            <p>Best regards,<br>The Home Crafter Admin</p>
            <div class="footer">
                <p>&copy; 2024 Home Crafter. All rights reserved @Syed Gaziul Haque</p>
            </div>
        </div>
    </body>
    </html>
  `;

  // Send the password reset email using the `sendEMail` function
  await sendEMail(from, email, subject, htmlContent);

  // Return success message
  return 'Password reset email has been sent successfully!';
};


export const resetPassword = async (token: string, newPassword: string): Promise<string> => {

  let userOrProvider:any = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpire: {
        gte: new Date(), 
      },
    },
  });

  let isProvider = false;

 
  if (!userOrProvider) {
    userOrProvider = await prisma.provider.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpire: {
          gte: new Date(), 
        },
      },
    });

    isProvider = !!userOrProvider; 
  }

  
  if (!userOrProvider) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired reset token');
  }

  
  const hashedPassword = await bcrypt.hash(newPassword, 10);

 
  if (isProvider) {
  
    await prisma.provider.update({
      where: { id: userOrProvider.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null, 
      },
    });
  } else {
   
    await prisma.user.update({
      where: { id: userOrProvider.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null, 
        resetPasswordExpire: null, 
      },
    });
  }

  return 'Password reset successful. You can now log in with your new password.';
};



export const AuthService = {
  Signup,
  ProviderSignup,
  LoginUser,
  LoginProvider,
  RefreshToken,
  changePassword,
  forgotPassword,
  resetPassword
};
