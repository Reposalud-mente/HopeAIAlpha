# Auth0 Authentication System

This document provides an overview of the Auth0 authentication system implemented in HopeAI.

## Overview

HopeAI uses Auth0 as the authentication provider for secure user authentication and role-based access control. The implementation follows best practices for Next.js 15 App Router and provides a seamless authentication experience for users.

## Configuration

### Environment Variables

The following environment variables are required for Auth0 configuration:

```
AUTH0_SECRET=a_32_byte_hex_encoded_secret_for_cookie_encryption
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://dev-hopeai.us.auth0.com
AUTH0_CLIENT_ID=6QHlKSDpNbbXK0dOkufSe5zWC3xnus6y
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_AUDIENCE=https://hopeai-api.com
AUTH0_SCOPE=openid profile email
```

- `AUTH0_SECRET`: A 32-byte hex-encoded secret used for cookie encryption
- `AUTH0_BASE_URL`: The base URL of your application
- `AUTH0_ISSUER_BASE_URL`: The Auth0 domain for your tenant
- `AUTH0_CLIENT_ID`: The Auth0 client ID
- `AUTH0_CLIENT_SECRET`: The Auth0 client secret
- `AUTH0_AUDIENCE`: The API audience (optional)
- `AUTH0_SCOPE`: The scopes to request during authentication

### Auth0 Dashboard Configuration

In the Auth0 dashboard, you need to configure the following:

1. **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback` (for development)
2. **Allowed Logout URLs**: `http://localhost:3000` (for development)
3. **Allowed Web Origins**: `http://localhost:3000` (for development)

For production, you'll need to add the production URLs as well.

## Role-Based Access Control

HopeAI implements role-based access control with the following roles:

- `PSYCHOLOGIST`: Regular users with access to patient data and reports
- `SUPERVISOR`: Users who can supervise psychologists and access additional features
- `ADMIN`: Users with full administrative access

### Role Assignment in Auth0

Roles are assigned to users in Auth0 using the following methods:

1. **Auth0 Roles**: Assign roles to users in the Auth0 dashboard
2. **Custom Claims**: Add a custom claim `https://hopeai.com/role` with the user's role

## Authentication Flow

1. User navigates to a protected route
2. Middleware checks if the user is authenticated
3. If not authenticated, user is redirected to Auth0 login page
4. After successful authentication, Auth0 redirects back to the callback URL
5. The callback handler creates or updates the user in the database
6. User is redirected to the original URL or dashboard

## API Routes

The following API routes are available for authentication:

- `/api/auth/login`: Redirects to Auth0 login page
- `/api/auth/logout`: Logs out the user from Auth0
- `/api/auth/callback`: Handles the Auth0 callback after login
- `/api/auth/profile`: Returns the user profile

## Client-Side Authentication

The `AuthProvider` component provides authentication context to the application:

```tsx
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { user, isAuthenticated, isLoading, loginWithAuth0, logoutWithAuth0 } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return (
      <button onClick={() => loginWithAuth0()}>
        Log In
      </button>
    );
  }
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={() => logoutWithAuth0()}>
        Log Out
      </button>
    </div>
  );
}
```

## Role-Based Access Control Components

The following components are available for role-based access control:

- `RoleGuard`: Base component for role-based access control
- `AdminGuard`: Only allows ADMIN users
- `SupervisorGuard`: Allows SUPERVISOR and ADMIN users
- `PsychologistGuard`: Allows all authenticated users (PSYCHOLOGIST, SUPERVISOR, ADMIN)
- `AuthGuard`: Allows any authenticated user regardless of role

Example usage:

```tsx
import { AdminGuard } from '@/components/auth/RoleGuard';

function AdminPage() {
  return (
    <AdminGuard fallback={<div>You don't have permission to access this page.</div>}>
      <div>Admin content here</div>
    </AdminGuard>
  );
}
```

## API Route Protection

API routes can be protected using the `withAuth` middleware:

```tsx
import { withAuth, withAdminAuth } from '@/lib/auth/api-auth';
import { NextRequest, NextResponse } from 'next/server';

// Protect a route for all authenticated users
export const GET = withAuth(async (req: NextRequest, user: any) => {
  return NextResponse.json({ message: 'Protected data', user });
});

// Protect a route for ADMIN users only
export const POST = withAdminAuth(async (req: NextRequest, user: any) => {
  return NextResponse.json({ message: 'Admin-only data', user });
});
```

## Server-Side Authentication

For server-side authentication in route handlers or server components:

```tsx
import { getAuthUser, hasRequiredRole } from '@/lib/auth/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (!hasRequiredRole(user, ['ADMIN'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  return NextResponse.json({ message: 'Admin data', user });
}
```

## Troubleshooting

### Common Issues

1. **Session Not Persisting**: Make sure the `AUTH0_SECRET` is properly set and consistent across deployments
2. **Callback URL Errors**: Verify that the callback URL is correctly configured in Auth0 dashboard
3. **Role Not Recognized**: Check that roles are properly assigned in Auth0 and the namespace is correct

### Debugging

Enable debug mode in development by setting:

```
AUTH0_DEBUG=true
```

This will log additional information to the console during authentication flows.

## Security Considerations

1. **CSRF Protection**: Implemented by Auth0 SDK
2. **XSS Protection**: Use proper content security policies
3. **Token Storage**: Tokens are stored in HTTP-only cookies
4. **Session Management**: Sessions are managed securely by Auth0 SDK

## References

- [Auth0 Next.js SDK Documentation](https://auth0.github.io/nextjs-auth0/index.html)
- [Auth0 Dashboard](https://manage.auth0.com/)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
