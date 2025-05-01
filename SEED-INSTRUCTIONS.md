# Session Mock Data Seed Instructions

This document provides instructions on how to seed your database with mock session data for testing purposes.

## Prerequisites

- Make sure your database is set up and running
- Ensure you have the necessary environment variables configured (DATABASE_URL)

## Running the Seed

You can seed your database with mock session data using one of the following methods:

### Method 1: Using pnpm

```bash
pnpm prisma:seed:sessions
```

### Method 2: Using the run-seed.js script

```bash
node run-seed.js
```

## What the Seed Creates

The seed script will:

1. Create 3 mock users with different roles (2 psychologists and 1 admin)
2. Create 5 mock patients with realistic data
3. Create 20 mock sessions with:
   - Random assignment to patients and clinicians
   - Various session types and statuses
   - Realistic objectives, activities, and notes
   - Some sessions with AI suggestions and attachments
   - Dates spread over the last 3 months

## Viewing the Data

After running the seed, you can view the data using Prisma Studio:

```bash
pnpm prisma:studio
```

This will open a web interface where you can browse and interact with your database.

## Troubleshooting

If you encounter any issues:

1. Make sure your DATABASE_URL is correctly set in your environment variables
2. Check that your database is running and accessible
3. Ensure you have the necessary permissions to create and modify tables

If you see errors related to the schema, you may need to run migrations first:

```bash
pnpm prisma:migrate
```

## Resetting the Data

The seed script will delete all existing sessions, patients, and users before creating new ones. If you want to keep your existing data, you should back it up before running the seed.
