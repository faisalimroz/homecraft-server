import { Role } from '@prisma/client';

export type IResponseUser = {
  id: string;
  fName: string;
  lName: string;
  email: string;
  contactNo: string;
  profileImg: string[]; // Update this to match the database model
  createdAt: Date;
};
