Home Crafter Backend

Overview

The Home Crafter Backend is a RESTful API built for the multi-vendor home service web application. It handles key backend functionality such as user management, service bookings, payments, and provider administration. The backend is built with TypeScript, Express.js, and Prisma, and includes integration with third-party services like Cloudinary for media handling and SslCommerz for secure payment processing.

Features

User Authentication and Authorization: JWT-based authentication with role-based access control for User, Provider, and Admin.

Service Booking System: Endpoints to handle service creation, booking, and management.

Provider Management: Manage service providers, handle service listings, and track provider statistics.

Email Notifications: Providers receive email notifications upon account approval or rejection, and users can receive password reset emails.

File Uploads: Use Cloudinary for storing and managing images (service photos, provider avatars, etc.).

Payment Integration: SslCommerz for secure payment transactions during service booking.

CRUD Operations: Fully implemented CRUD for users, services, providers, and reviews.

Pagination, Filtering, and Sorting: Built-in support for paginated and filtered results across services and other entities.

Data Validation: Zod is used for robust schema validation to ensure data integrity.


Technology Stack

Backend Framework: Express.js

Language: TypeScript

ORM: Prisma (PostgreSQL)

Authentication: JWT for session management

File Storage: Cloudinary for media uploads

Payment Gateway: SslCommerz for secure service bookings

Email Service: Nodemailer for sending email notifications

Validation: Zod for schema validation

Deployment: Vercel for frontend, suitable hosting services for backend