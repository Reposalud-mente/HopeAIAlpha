# Alpha Environment Setup Guide

This document provides instructions for setting up and using the Alpha environment for the HopeAI Clinical Dashboard application. The Alpha environment uses Auth0 for authentication and Supabase for the database.

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Access to the Auth0 dashboard
- Access to the Supabase project

## Environment Configuration

The Alpha environment uses the `.env.alpha` file for configuration. This file contains the following variables:

- **Database Configuration**:
  - `DATABASE_URL`: Connection string for Supabase via connection pooling
  - `DIRECT_URL`: Direct connection string for Supabase (used for migrations)
  - `DISABLE_PRISMA_ACCELERATE`: Set to `true` to disable Prisma Accelerate

- **Auth0 Configuration**:
  - `AUTH0_SECRET`: Secret for Auth0 session encryption
  - `AUTH0_BASE_URL`: Base URL of the application
  - `AUTH0_ISSUER_BASE_URL`: Auth0 domain
  - `AUTH0_CLIENT_ID`: Auth0 client ID
  - `AUTH0_CLIENT_SECRET`: Auth0 client secret
  - `AUTH0_SCOPE`: Auth0 scopes (usually `openid profile email`)

- **Application Configuration**:
  - `NEXT_PUBLIC_APP_ENV`: Set to `development` for local development
  - `NEXT_PUBLIC_ENABLE_MONITORING`: Enable monitoring features

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd clinical-dashboard-app/consolidated-app
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Generate Prisma client**:
   ```bash
   pnpm setup:alpha
   ```

4. **Test database connection**:
   ```bash
   pnpm test:alpha-db
   ```

5. **Start the development server**:
   ```bash
   pnpm dev:alpha
   ```

## Database Schema

The Alpha environment uses a PostgreSQL database hosted on Supabase. The schema is defined in `schema.prisma.alpha` and includes the following main models:

- `User`: User accounts with authentication information
- `Patient`: Patient records
- `Assessment`: Clinical assessments
- `ClinicalNote`: Notes from therapy sessions
- `TreatmentPlan`: Treatment plans for patients
- `Session`: Therapy session records
- `Report`: Clinical reports

## Authentication Flow

The application uses Auth0 for authentication:

1. User clicks "Login" and is redirected to the Auth0 login page
2. After successful authentication, Auth0 redirects back to the application
3. The application verifies the Auth0 token and creates/updates the user in the database
4. The user is redirected to the dashboard

## Available Scripts

- `pnpm dev:alpha`: Start the development server with Alpha environment
- `pnpm build:alpha`: Build the application for production with Alpha environment
- `pnpm start:alpha`: Start the production server with Alpha environment
- `pnpm prisma:studio:alpha`: Open Prisma Studio to explore the database
- `pnpm prisma:generate:alpha`: Generate Prisma client for the Alpha environment
- `pnpm setup:alpha`: Set up the Alpha environment (copy schema and generate client)
- `pnpm test:alpha-db`: Test the connection to the Alpha database

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Check that your `.env.alpha` file has the correct database connection strings
2. Ensure you have access to the Supabase project
3. Check if the IP address is allowed in Supabase

### Auth0 Authentication Issues

If you encounter authentication issues:

1. Check that your Auth0 application is configured correctly
2. Ensure the callback URL is set correctly in Auth0
3. Verify that the Auth0 credentials in `.env.alpha` are correct

## Deployment

To deploy the Alpha environment:

1. Build the application:
   ```bash
   pnpm build:alpha
   ```

2. Start the production server:
   ```bash
   pnpm start:alpha
   ```

## Additional Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)