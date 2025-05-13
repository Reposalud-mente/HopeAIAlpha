/**
 * User Service
 * 
 * This service handles user operations, integrating Auth0 authentication
 * with the Supabase database.
 */

import { withDb, withTransaction } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { formatAuth0User } from '@/lib/auth/auth0-config';

export type Auth0User = {
  sub: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  role?: string;
  [key: string]: any;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  licenseNumber?: string;
  specialty?: string;
  profileImageUrl?: string;
  clinicId?: string;
};

/**
 * Find a user by their Auth0 ID
 * 
 * @param auth0Id - The Auth0 ID (sub) of the user
 * @returns The user profile or null if not found
 */
export async function findUserByAuth0Id(auth0Id: string): Promise<UserProfile | null> {
  return withDb(async (db) => {
    const user = await db.user.findFirst({
      where: {
        id: auth0Id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        licenseNumber: true,
        specialty: true,
        profileImageUrl: true,
        clinicId: true,
      },
    });

    return user;
  });
}

/**
 * Find a user by their email
 * 
 * @param email - The email of the user
 * @returns The user profile or null if not found
 */
export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  return withDb(async (db) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        licenseNumber: true,
        specialty: true,
        profileImageUrl: true,
        clinicId: true,
      },
    });

    return user;
  });
}

/**
 * Create or update a user from Auth0
 * 
 * This function is called after a user logs in with Auth0.
 * It creates a new user in the database if they don't exist,
 * or updates their information if they do.
 * 
 * @param auth0User - The user object from Auth0
 * @returns The created or updated user profile
 */
export async function createOrUpdateUserFromAuth0(auth0User: Auth0User): Promise<UserProfile> {
  const formattedUser = formatAuth0User(auth0User);
  
  if (!formattedUser) {
    throw new Error('Invalid Auth0 user data');
  }

  return withTransaction(async (tx) => {
    // Check if user exists by email
    const existingUser = await tx.user.findUnique({
      where: {
        email: formattedUser.email,
      },
    });

    // If user exists, update their information
    if (existingUser) {
      const updatedUser = await tx.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          email: formattedUser.email,
          firstName: formattedUser.firstName || existingUser.firstName,
          lastName: formattedUser.lastName || existingUser.lastName,
          role: (formattedUser.role as UserRole) || existingUser.role,
          profileImageUrl: formattedUser.picture || existingUser.profileImageUrl,
          lastLoginAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          licenseNumber: true,
          specialty: true,
          profileImageUrl: true,
          clinicId: true,
        },
      });

      return updatedUser;
    }

    // If user doesn't exist, create a new one with a UUID
    // Generate a UUID for the new user
    const uuid = await tx.$queryRaw`SELECT uuid_generate_v4()`;
    const userId = uuid[0].uuid_generate_v4;
    
    const newUser = await tx.user.create({
      data: {
        id: userId,
        email: formattedUser.email,
        firstName: formattedUser.firstName || 'New',
        lastName: formattedUser.lastName || 'User',
        role: (formattedUser.role as UserRole) || 'PSYCHOLOGIST',
        passwordHash: 'auth0-managed', // We don't store the password, Auth0 handles that
        profileImageUrl: formattedUser.picture,
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        licenseNumber: true,
        specialty: true,
        profileImageUrl: true,
        clinicId: true,
      },
    });

    return newUser;
  });
}

/**
 * Update a user's profile
 * 
 * @param userId - The ID of the user to update
 * @param data - The data to update
 * @returns The updated user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile> {
  return withDb(async (db) => {
    const updatedUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        licenseNumber: data.licenseNumber,
        specialty: data.specialty,
        profileImageUrl: data.profileImageUrl,
        clinicId: data.clinicId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        licenseNumber: true,
        specialty: true,
        profileImageUrl: true,
        clinicId: true,
      },
    });

    return updatedUser;
  });
}

/**
 * Get all users (for admin purposes)
 * 
 * @returns Array of user profiles
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  return withDb(async (db) => {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        licenseNumber: true,
        specialty: true,
        profileImageUrl: true,
        clinicId: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    });

    return users;
  });
}