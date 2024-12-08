interface ProviderInterface {
    id: string;
    fName: string;
    lName: string;
    email: string;
    role: ProviderRole;
    gender: string;
    dob: Date;
    bio: string;
    categoryId?: string | null;
    category?: Category | null;
    contactNo: string;
    address: string;
    profileImg: string[];
    services: Service[];
    createdAt: Date;
    updatedAt: Date;
    approvalStatus: ApprovalStatus;
  }
  
  type ProviderRole = "Provider" | "Admin";
  
  type ApprovalStatus = "Pending" | "Approved" | "Rejected";
  
  interface Category {
    id: string;
    name: string;
  }
  
  interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
  }
  
  export interface PartialProvider {
    id: string;
    fName: string;
    lName: string;
    email: string;
    gender: string;
    contactNo: string;
    profileImg: string;
    approvalStatus: string;
    createdAt: Date;
  }