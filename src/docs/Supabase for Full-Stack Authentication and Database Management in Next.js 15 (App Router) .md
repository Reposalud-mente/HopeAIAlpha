# **Implementing Supabase for Full-Stack Authentication and Database Management in Next.js 15 (App Router) with Prisma: A Guide for Rapid Alpha Deployment**

This report provides a comprehensive guide to leveraging Supabase as a Backend-as-a-Service (BaaS) for a telemedicine platform built with Next.js 15 (App Router). It focuses on implementing full user authentication, completely replacing Auth0, and managing an existing Supabase database (pre-populated with seed data) where Prisma is utilized for development-phase schema definitions. The objective is to facilitate a rapid, robust, and secure alpha phase deployment. All guidance and code examples adhere to best practices and library versions current as of May 2025\.

## **1\. Overview: Supabase Auth in the Next.js 15 Ecosystem**

Migrating from Auth0 to Supabase Auth within a Next.js 15 (App Router) project, particularly for a telemedicine platform aiming for a streamlined alpha launch, offers several compelling advantages. Supabase, as an open-source Firebase alternative, provides a tightly integrated suite of tools including a PostgreSQL database, authentication, real-time subscriptions, and edge functions.1 This integration is a primary benefit, reducing the complexity of managing disparate services often encountered when pairing Auth0 with a separate database backend.

For a telemedicine platform where user data integrity and access control are paramount, Supabase's architecture, which directly links authentication with its PostgreSQL database through the auth.users table and Row Level Security (RLS), offers a more cohesive and manageable security model.1 This contrasts with Auth0, which, while powerful and feature-rich, operates as a separate identity platform, potentially requiring more intricate synchronization logic to maintain consistency with application-specific user data in Supabase.4

The use of Supabase can also lead to a simplified development workflow and potentially lower costs, especially during the alpha phase. Supabase's free tier is often sufficient for initial development and testing.5 Consolidating authentication and database services under a single provider streamlines configuration, reduces the number of SDKs to manage, and can simplify the overall architecture. This is particularly beneficial when speed and simplicity are prioritized for an alpha release. While Auth0 excels in complex enterprise scenarios with extensive identity federation requirements, Supabase Auth provides a robust and developer-friendly solution for common authentication needs, including email/password, social logins, and magic links, directly within the same ecosystem as the application's data.1 The @supabase/ssr library, specifically designed for Next.js server-side rendering capabilities (including the App Router), further simplifies session management and secure data access in both Server and Client Components.4

## **2\. Migration Strategy: Decommissioning Auth0 and Embracing Supabase Auth**

Transitioning from Auth0 to Supabase Auth, especially in a scenario with no active users to migrate, is a relatively straightforward process focused on removing Auth0 dependencies and configuring Supabase.

### **2.1. Decommissioning Auth0**

The first step involves thoroughly removing Auth0 from the Next.js project to ensure a clean slate for Supabase Auth integration.6

1. **Uninstall Auth0 SDKs:** Remove packages like @auth0/nextjs-auth0 and any other Auth0-specific libraries from package.json.  
   Bash  
   pnpm uninstall @auth0/nextjs-auth0  
   \# or if using yarn:  
   \# yarn remove @auth0/nextjs-auth0

2. **Remove Auth0 Configuration:**  
   * Delete any Auth0-specific environment variables from .env.local and other environment files (e.g., AUTH0\_SECRET, AUTH0\_BASE\_URL, AUTH0\_ISSUER\_BASE\_URL, AUTH0\_CLIENT\_ID, AUTH0\_CLIENT\_SECRET).  
   * Remove any Auth0-specific configuration files or initialization logic.  
3. **Eliminate Auth0 API Routes and Logic:** Delete any API routes in the app/api/auth/\[...auth0\] directory or similar custom routes that handled Auth0 callbacks, login, logout, or user session management.6  
4. **Remove Auth0 Components and Hooks:** Identify and remove React components, Higher-Order Components (HOCs), or hooks imported from Auth0 SDKs (e.g., UserProvider, useUser, withPageAuthRequired, withApiAuthRequired).6 Replace their functionality with Supabase equivalents as detailed in Section 3\.  
5. **Clean Up Auth0-Related State:** If Auth0 was integrated with global state management (e.g., Context API, Zustand, Redux), remove any Auth0-specific state, reducers, or actions.

### **2.2. Initial Supabase Auth Configuration**

With Auth0 removed, configure Supabase Auth within your Supabase project dashboard.

1. **Enable Authentication Providers:**  
   * Navigate to your Supabase project dashboard, then to "Authentication" \-\> "Providers."  
   * Enable the **Email** provider. Configure its settings, such as enabling "Secure email change" and "Confirm email" (default and recommended).1  
   * If social logins are desired for the alpha (e.g., Google, GitHub), enable them here and configure their respective Client IDs and Secrets. This typically involves creating OAuth applications with the chosen providers and providing callback URLs.8 The callback URL will usually be YOUR\_SITE\_URL/auth/callback.  
2. **Configure Email Templates:**  
   * Go to "Authentication" \-\> "Templates."  
   * Customize the "Confirm signup," "Reset password," and "Magic Link" email templates.  
   * Crucially for Next.js server-side auth flow, modify the "Confirm signup" template. Change the confirmation link from {{.ConfirmationURL }} to {{.SiteURL }}/auth/confirm?token\_hash={{.TokenHash }}\&type=email.4 This ensures the confirmation link directs to your Next.js application's Route Handler for server-side verification. {{.SiteURL }} should be set correctly in your Supabase project's "Authentication" \-\> "Settings" \-\> "Site URL".  
3. **Set Redirect URLs:**  
   * Under "Authentication" \-\> "Settings" 2, ensure your application's base URL (e.g., http://localhost:3000 for development, your production URL for deployment) is added to the "Site URL" field.  
   * Additional redirect URLs, including wildcards if necessary for previews or dynamic environments, should be added to the "Redirect URLs" allow list.8 This is vital for OAuth providers and email confirmation links.

### **2.3. User Data Considerations (No Active Users)**

Since there are no active users on the platform, user data migration from Auth0 is not required.6 New users will sign up directly through Supabase Auth. Any existing seed data in Supabase tables will need to be associated with these new Supabase users, typically via foreign key relationships and appropriate RLS policies (covered in sections 3.9 and 3.10).

## **3\. Implementation Guide & Code Examples for Next.js 15 with Supabase Auth**

This section details the practical implementation of Supabase Auth within a Next.js 15 App Router project, using the @supabase/ssr library for robust session management. The @supabase/ssr library is fundamental for handling authentication in server-side contexts, managing cookies, and ensuring sessions are correctly propagated between the client and server.4

### **3.1. Setting up Supabase Client and Server-Side Utilities**

A robust setup requires distinct Supabase client instances for browser (Client Components) and server (Server Components, Route Handlers, Server Actions) environments.4

1. **Install Packages:**  
   Bash  
   pnpm install @supabase/supabase-js @supabase/ssr

   (4)  
2. Environment Variables (.env.local):  
   Store your Supabase project URL and anon (publishable) key. The service role key is needed for admin tasks, like the user import script if it were necessary, but should generally not be used for client-facing app logic. As of May 2025, Supabase is transitioning API key terminology: anon key becomes publishable key and service\_role key becomes secret key. New projects created after May 1, 2025, will use the new keys by default.10 For this guide, we'll use the common NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY which maps to the publishable key.  
   \#.env.local  
   NEXT\_PUBLIC\_SUPABASE\_URL=your-supabase-url  
   NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=your-supabase-anon-key  
   \# SUPABASE\_SERVICE\_ROLE\_KEY=your-supabase-service-role-key \# Only if needed for specific admin server actions

   (4)  
3. **Client Utility (utils/supabase/client.ts):** For use in Client Components.  
   TypeScript  
   // utils/supabase/client.ts  
   import { createBrowserClient } from '@supabase/ssr';

   export function createClient() {  
     return createBrowserClient(  
       process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
       process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!  
     );  
   }

   * **Explanation:** createBrowserClient from @supabase/ssr is tailored for browser environments. It initializes using the publicly accessible Supabase URL and anon/publishable key.4  
4. **Server Utility (utils/supabase/server.ts):** For Server Components, Route Handlers, and Server Actions.  
   TypeScript  
   // utils/supabase/server.ts  
   import { createServerClient, type CookieOptions } from '@supabase/ssr';  
   import { cookies } from 'next/headers';

   export function createClient() {  
     const cookieStore \= cookies();  
     return createServerClient(  
       process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
       process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!,  
       {  
         cookies: {  
           get(name: string) {  
             return cookieStore.get(name)?.value;  
           },  
           set(name: string, value: string, options: CookieOptions) {  
             try {  
               cookieStore.set({ name, value,...options });  
             } catch (error) {  
               // The \`set\` method was called from a Server Component.  
               // This can be ignored if you have middleware refreshing  
               // user sessions.  
             }  
           },  
           remove(name: string, options: CookieOptions) {  
             try {  
               cookieStore.delete({ name,...options });  
             } catch (error)  
               // The \`delete\` method was called from a Server Component.  
               // This can be ignored if you have middleware refreshing  
               // user sessions.  
             }  
           },  
         },  
       }  
     );  
   }

   * **Explanation:** createServerClient from @supabase/ssr is designed for server-side execution. It critically requires access to Next.js's cookies() function (from next/headers) to manage session cookies by reading and writing them.4 The try-catch blocks around cookieStore.set and cookieStore.delete are a safeguard. In Server Components, direct cookie modification isn't allowed; the middleware is responsible for persisting cookie changes to the browser. These errors can often be ignored if middleware is correctly configured.4  
5. **Middleware (middleware.ts):** This is essential for session management, particularly for refreshing authentication tokens and ensuring session consistency across requests.  
   TypeScript  
   // middleware.ts  
   import { createServerClient, type CookieOptions } from '@supabase/ssr';  
   import { NextResponse, type NextRequest } from 'next/server';

   export async function middleware(request: NextRequest) {  
     let response \= NextResponse.next({  
       request: {  
         headers: request.headers,  
       },  
     });

     const supabase \= createServerClient(  
       process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
       process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!,  
       {  
         cookies: {  
           get(name: string) {  
             return request.cookies.get(name)?.value;  
           },  
           set(name: string, value: string, options: CookieOptions) {  
             // If the cookie is set in the server client, update it in the request for the current lifecycle  
             // and in the response to send it back to the browser.  
             request.cookies.set({ name, value,...options });  
             response \= NextResponse.next({  
               request: {  
                 headers: request.headers,  
               },  
             });  
             response.cookies.set({ name, value,...options });  
           },  
           remove(name: string, options: CookieOptions) {  
             // If the cookie is removed in the server client, update it in the request and response.  
             request.cookies.set({ name, value: '',...options });  
             response \= NextResponse.next({  
               request: {  
                 headers: request.headers,  
               },  
             });  
             response.cookies.delete({ name,...options });  
           },  
         },  
       }  
     );

     // IMPORTANT: Avoid running \`getUser\` if the path is an API route an OPTIONS request  
     // or a static file.  
     if (  
       request.nextUrl.pathname.startsWith('/api/') && request.method \=== 'OPTIONS' ||  
       request.nextUrl.pathname.startsWith('/\_next/') ||  
       request.nextUrl.pathname.startsWith('/static/') |

| // Adjust if you have a different static folder  
/.(.\*)$/.test(request.nextUrl.pathname) // Match files with extensions  
) {  
return response;  
}

  // Refresh session if expired \- important to do before accessing RLS data or Server Components  
  // that rely on authentication.  
  await supabase.auth.getUser();

  return response;  
}

export const config \= {  
  matcher: \[  
    /\*  
     \* Match all request paths except for the ones starting with:  
     \* \- \_next/static (static files)  
     \* \- \_next/image (image optimization files)  
     \* \- favicon.ico (favicon file)  
     \* Feel free to modify this pattern to include more paths.  
     \*/  
    '/((?\!\_next/static|\_next/image|favicon.ico|.\*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).\*)',  
  \],  
};  
\`\`\`  
\*   \*\*Explanation:\*\* The middleware is a cornerstone of the \`@supabase/ssr\` strategy.\[4\] It intercepts requests based on the \`matcher\` config. For each matched request, it initializes a server-side Supabase client configured to use the request's cookies for reading and the response's cookies for writing. The call to \`await supabase.auth.getUser()\` is crucial: it attempts to retrieve the current user, which implicitly refreshes the session token if it's expired. The (potentially) updated session is then available to subsequent Server Components or Route Handlers via the request cookies, and the browser's cookies are updated via \`Set-Cookie\` headers on the response. This ensures session state remains synchronized. The re-creation of \`response\` after \`request.cookies.set/delete\` is vital because \`request.cookies\` is read-only in middleware; modifications must be applied to the outgoing \`response\` object.\[4\] The conditional check before \`getUser()\` prevents unnecessary operations on static assets or API preflight requests.

This foundational setup of Supabase clients and middleware is pivotal. Any inaccuracies here can lead to cascading authentication issues throughout the application. The middleware, in particular, acts as the central nervous system for session management in a Next.js 15 App Router context, transparently handling token refreshes and ensuring that both server-side and client-side components operate with a consistent view of the user's authentication state.

### **3.2. User Sign-up (Email/Password)**

Implementing user registration typically involves a client-side form that submits data to a Next.js Server Action. This pattern leverages Next.js 15's capabilities for streamlined form handling and server-side mutations.12

1. **Sign-up Form (Client Component \- e.g., app/auth/signup/page.tsx):** This component renders the form fields and calls the Server Action on submission.  
   TypeScript  
   // app/auth/signup/page.tsx  
   'use client'; // This component interacts with form state and user feedback

   import { signUp } from './actions'; // Server Action  
   import { useState, useTransition } from 'react';  
   import { useRouter } from 'next/navigation';

   export default function SignUpPage() {  
     const router \= useRouter();  
     const \[message, setMessage\] \= useState('');  
     const \= useTransition();

     const handleSubmit \= async (event: React.FormEvent\<HTMLFormElement\>) \=\> {  
       event.preventDefault();  
       const formData \= new FormData(event.currentTarget);  
       startTransition(async () \=\> {  
         const result \= await signUp(formData);  
         if (result?.error) {  
           setMessage(result.error);  
         } else if (result?.message) {  
           setMessage(result.message);  
           // Optionally redirect or clear form on success message  
           // For email confirmation, usually stay on page with message  
         }  
       });  
     };

     return (  
       \<form onSubmit={handleSubmit}\>  
         \<div\>  
           \<label htmlFor="email"\>Email:\</label\>  
           \<input id="email" name="email" type="email" required disabled={isPending} /\>  
         \</div\>  
         \<div\>  
           \<label htmlFor="password"\>Password:\</label\>  
           \<input id="password" name="password" type="password" required disabled={isPending} /\>  
         \</div\>  
         \<div\>  
           \<label htmlFor="fullName"\>Full Name:\</label\>  
           \<input id="fullName" name="fullName" type="text" disabled={isPending} /\>  
         \</div\>  
         {/\* Add other fields for public.profiles if needed, e.g., username \*/}  
         \<button type="submit" disabled={isPending}\>  
           {isPending? 'Signing Up...' : 'Sign Up'}  
         \</button\>  
         {message && \<p\>{message}\</p\>}  
       \</form\>  
     );  
   }

2. **Server Action (app/auth/signup/actions.ts):** This server-side function handles the actual sign-up logic using the Supabase server client.  
   TypeScript  
   // app/auth/signup/actions.ts  
   'use server';

   import { createClient } from '@/utils/supabase/server';  
   import { headers } Gfrom 'next/headers';  
   // import { redirect } from 'next/navigation'; // Not redirecting on signup if email confirmation is on

   export async function signUp(formData: FormData) {  
     const origin \= headers().get('origin'); // Get origin for emailRedirectTo  
     const email \= formData.get('email') as string;  
     const password \= formData.get('password') as string;  
     const fullName \= formData.get('fullName') as string | null;

     // Basic validation (more robust validation should be added for production)  
     if (\!email ||\!password) {  
       return { error: 'Email and password are required.' };  
     }  
     if (password.length \< 6) { // Example: Supabase default min password length  
       return { error: 'Password must be at least 6 characters.'};  
     }

     const supabase \= createClient();

     const { error, data } \= await supabase.auth.signUp({  
       email,  
       password,  
       options: {  
         emailRedirectTo: \`${origin}/auth/confirm\`, // Crucial for email confirmation \[4\]  
         data: { // This data is stored in auth.users.raw\_user\_meta\_data  
                 // and can be used by a trigger to populate public.profiles \[13\]  
           full\_name: fullName,  
           // Add other metadata like 'username' if collected  
         }  
       },  
     });

     if (error) {  
       console.error('Sign up error:', error.message);  
       return { error: \`Could not authenticate user: ${error.message}\` };  
     }

     // On successful sign-up with email confirmation enabled,  
     // the user is created but not yet authenticated.  
     // They need to click the confirmation link in their email.  
     return { message: 'Check your email to complete the sign-up process.' };  
   }

   * **Explanation:** The Server Action signUp receives FormData. It initializes the Supabase server client. supabase.auth.signUp attempts to register the user.4  
     * emailRedirectTo: This option is critical. It tells Supabase where to send the user after they click the confirmation link in their email. Using headers().get('origin') dynamically constructs the correct base URL for the current environment.4  
     * options.data: This object allows passing metadata during sign-up. Supabase stores this in the auth.users.raw\_user\_meta\_data column as a JSON object.13 This metadata can then be used by a database trigger to automatically populate a corresponding row in your public.profiles table (see section 3.9).  
   * **Error Handling:** The action returns an error message if sign-up fails, which can be displayed on the client-side form. More sophisticated error handling (e.g., specific messages for "User already registered") can be implemented by inspecting error.message or error.status.  
   * **Security:** Supabase automatically hashes passwords. Ensure your application uses HTTPS to protect data in transit. Input validation is also essential.

### **3.3. Auth Confirmation (Route Handler)**

When a user clicks the confirmation link in their sign-up email, they are directed to a URL handled by a Next.js Route Handler. This handler verifies the token and completes the authentication process.

TypeScript

// app/auth/confirm/route.ts  
import { type EmailOtpType } from '@supabase/supabase-js';  
import { type NextRequest, NextResponse } from 'next/server';  
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {  
  const { searchParams } \= new URL(request.url);  
  const token\_hash \= searchParams.get('token\_hash');  
  const type \= searchParams.get('type') as EmailOtpType | null;  
  // 'next' can be used to redirect to a specific page after confirmation, e.g., a welcome page or dashboard.  
  const next \= searchParams.get('next')?? '/dashboard'; // Default redirect to dashboard

  // Ensure the 'next' path is relative and safe.  
  const redirectTo \= new URL(next.startsWith('/')? next : \`/${next}\`, request.url);

  if (token\_hash && type) {  
    const supabase \= createClient(); // Server client using cookies  
    const { error } \= await supabase.auth.verifyOtp({  
      type,  
      token\_hash,  
      // Note: For some OTP types like 'email\_change', 'phone\_change', this also updates the user's email/phone.  
    });

    if (\!error) {  
      // OTP verified successfully. The user is now authenticated, and the session is set in cookies  
      // by the server client.  
      return NextResponse.redirect(redirectTo);  
    }  
    console.error('Error verifying OTP:', error.message);  
    // It's good practice to inform the user about the error.  
    // You might redirect to an error page with a more user-friendly message.  
    const errorPageUrl \= new URL('/auth/error', request.url);  
    errorPageUrl.searchParams.set('message', 'Link expired or invalid. Please try again.');  
    return NextResponse.redirect(errorPageUrl);  
  }

  // If token\_hash or type is missing, redirect to an error page.  
  const errorPageUrl \= new URL('/auth/error', request.url);  
  errorPageUrl.searchParams.set('message', 'Invalid confirmation link.');  
  return NextResponse.redirect(errorPageUrl);  
}

* **Explanation:** This Route Handler extracts token\_hash and type from the query parameters of the confirmation URL.4 supabase.auth.verifyOtp is called to validate the token with Supabase. If successful, Supabase confirms the user's email, and the @supabase/ssr server client automatically establishes a session by setting the necessary cookies in the NextResponse. The user is then redirected to the next path (e.g., their dashboard).  
* **Error Handling:** If verification fails (e.g., token expired or invalid), the user is redirected to an error page.  
* **Security:** Using NextResponse.redirect is standard for App Router Route Handlers. Ensuring next is a relative path or properly sanitized prevents open redirect vulnerabilities.

### **3.4. User Login (Email/Password)**

Similar to sign-up, login is typically handled by a client-side form submitting to a Server Action.

1. **Login Form (Client Component \- e.g., app/auth/login/page.tsx):**  
   TypeScript  
   // app/auth/login/page.tsx  
   'use client';

   import { login } from './actions'; // Server Action  
   import { useState, useTransition } from 'react';  
   import { useRouter } from 'next/navigation'; // For potential client-side navigation if needed

   export default function LoginPage() {  
     const router \= useRouter();  
     const \[message, setMessage\] \= useState('');  
     const \= useTransition();

     const handleSubmit \= async (event: React.FormEvent\<HTMLFormElement\>) \=\> {  
       event.preventDefault();  
       const formData \= new FormData(event.currentTarget);  
       startTransition(async () \=\> {  
         const result \= await login(formData); // Server action handles redirect on success  
         if (result?.error) {  
           setMessage(result.error);  
         }  
         // Successful login is handled by redirect in the server action  
       });  
     };

     return (  
       \<form onSubmit={handleSubmit}\>  
         \<div\>  
           \<label htmlFor="email"\>Email:\</label\>  
           \<input id="email" name="email" type="email" required disabled={isPending} /\>  
         \</div\>  
         \<div\>  
           \<label htmlFor="password"\>Password:\</label\>  
           \<input id="password" name="password" type="password" required disabled={isPending} /\>  
         \</div\>  
         \<button type="submit" disabled={isPending}\>  
           {isPending? 'Logging In...' : 'Log In'}  
         \</button\>  
         {message && \<p\>{message}\</p\>}  
         {/\* Link to Sign Up page \*/}  
         \<p\>Don't have an account? \<a href="/auth/signup"\>Sign Up\</a\>\</p\>  
       \</form\>  
     );  
   }

2. **Server Action (app/auth/login/actions.ts):**  
   TypeScript  
   // app/auth/login/actions.ts  
   'use server';

   import { createClient } from '@/utils/supabase/server';  
   import { redirect } from 'next/navigation';  
   import { revalidatePath } from 'next/cache';

   export async function login(formData: FormData) {  
     const email \= formData.get('email') as string;  
     const password \= formData.get('password') as string;

     if (\!email ||\!password) {  
       return { error: 'Email and password are required.' };  
     }

     const supabase \= createClient(); // Server client

     const { error, data } \= await supabase.auth.signInWithPassword({  
       email,  
       password,  
     });

     if (error) {  
       console.error('Login error:', error.message);  
       // Return an error message to be displayed on the form  
       return { error: \`Login failed: ${error.message}\` };  
     }

     // On successful login, the session is automatically set in cookies by the server client.  
     // Revalidate paths that might show different content based on auth state.  
     // Revalidating the layout '/' ensures that any shared components (like a navbar showing user status)  
     // are updated.  
     revalidatePath('/', 'layout');  
     redirect('/dashboard'); // Redirect to the user's dashboard or a protected area  
   }

   * **Explanation:** The login Server Action calls supabase.auth.signInWithPassword.4 If authentication is successful, the @supabase/ssr server client handles setting the session cookies.  
   * revalidatePath('/', 'layout'): This is an important step in Next.js 15 with the App Router. After a successful login, data on various pages (especially those rendered by Server Components) might need to be refreshed to reflect the authenticated state. revalidatePath clears the cache for the specified path(s), ensuring fresh data is fetched.4 Revalidating the root layout ('/', 'layout') is a common strategy to update shared UI elements like navigation bars that might display user status.  
   * redirect('/dashboard'): Navigates the user to their dashboard or another appropriate authenticated route.  
   * **Error Handling:** If login fails, an error message is returned to the client-side form.

The combined use of Server Actions and revalidatePath offers a robust and efficient way to handle mutations like login, ensuring data consistency and a smooth user experience within the Next.js 15 App Router paradigm.

### **3.5. Social Login (e.g., Google)**

Integrating social login providers like Google offers users a convenient way to sign up and log in. This process involves client-side initiation and server-side callback handling.

1. **Supabase and Google Cloud Configuration:**  
   * **Google Cloud Console:**  
     1. Create or select a Google Cloud Project.9  
     2. Navigate to "APIs & Services" \-\> "OAuth consent screen." Configure it, ensuring your application's domain (e.g., your-app.com) and Supabase project domain (\<PROJECT\_ID\>.supabase.co) are listed under "Authorized domains".9  
     3. Add required scopes: .../auth/userinfo.email, .../auth/userinfo.profile, openid.9  
     4. Go to "APIs & Services" \-\> "Credentials." Click "Create credentials" \-\> "OAuth client ID."  
     5. Select "Web application" as the application type.  
     6. Under "Authorized JavaScript origins," add your site URL (e.g., http://localhost:3000 for dev, https://your-app.com for prod).  
     7. Under "Authorized redirect URIs," add the callback URL from your Supabase dashboard: https://\<YOUR\_SUPABASE\_PROJECT\_REF\>.supabase.co/auth/v1/callback.9 Also add your application's callback handler URL, e.g., http://localhost:3000/auth/callback or https://your-app.com/auth/callback.  
     8. Save and copy the "Client ID" and "Client secret."  
   * **Supabase Dashboard:**  
     1. Navigate to "Authentication" \-\> "Providers."  
     2. Enable "Google."  
     3. Enter the "Client ID" and "Client Secret" obtained from Google Cloud Console.9  
     4. Ensure "Skip Nonce check" is disabled for production (default).  
     5. Verify the "Redirect URL" shown in Supabase matches one you've added in Google Cloud Console.  
     6. (Optional) Add custom scopes if needed beyond the defaults.  
2. Client-Side Initiation (Client Component \- e.g., app/components/AuthButtons.tsx):  
   This component will contain a button to trigger the Google sign-in flow.  
   TypeScript  
   // app/components/AuthButtons.tsx  
   'use client';

   import { createClient } from '@/utils/supabase/client'; // Client-side Supabase client

   export function GoogleSignInButton() {  
     const supabase \= createClient();

     const handleGoogleSignIn \= async () \=\> {  
       const { error } \= await supabase.auth.signInWithOAuth({  
         provider: 'google',  
         options: {  
           // This redirectTo is where Supabase redirects the user \*after\* it has processed  
           // the callback from Google and created a session.  
           // This URL must be in your Supabase project's "Redirect URLs" allow list.  
           redirectTo: \`${window.location.origin}/auth/callback\`,  
           // Optional: Add scopes if you need more than default (email, profile)  
           // scopes: 'https://www.googleapis.com/auth/calendar.readonly',  
         },  
       });

       if (error) {  
         console.error('Google Sign In Error:', error.message);  
         // TODO: Display error to the user (e.g., using a toast notification)  
       }  
       // On success, the user is redirected by Supabase to Google, then back to  
       // the Supabase auth callback (/auth/v1/callback), which then redirects  
       // to the \`redirectTo\` specified above (your app's /auth/callback handler).  
     };

     return (  
       \<button onClick={handleGoogleSignIn} type="button"\>  
         Sign in with Google  
       \</button\>  
     );  
   }

   * **Explanation:** supabase.auth.signInWithOAuth initiates the OAuth flow.9  
     * provider: 'google' specifies Google.  
     * options.redirectTo: This is crucial. It tells Supabase where to redirect the user *within your application* after Supabase's own internal OAuth callback (/auth/v1/callback) has successfully processed the authentication with Google and exchanged the code for a Supabase session token. This URL (${window.location.origin}/auth/callback) must be whitelisted in your Supabase project's authentication settings under "Redirect URLs."  
3. Server-Side Callback Handling (Route Handler \- app/auth/callback/route.ts):  
   The same Route Handler created for email confirmation (Section 3.3) can typically handle OAuth callbacks as well, as it looks for a code parameter which is standard in OAuth 2.0 authorization code flow.  
   TypeScript  
   // app/auth/callback/route.ts  
   // (Ensure this is the same file as in section 3.3, or adapt if separate)  
   import { createClient } from '@/utils/supabase/server';  
   import { NextResponse, type NextRequest } from 'next/server';  
   import { type EmailOtpType } from '@supabase/supabase-js';

   export async function GET(request: NextRequest) {  
     const { searchParams, origin } \= new URL(request.url);  
     const code \= searchParams.get('code'); // For OAuth flow  
     const token\_hash \= searchParams.get('token\_hash'); // For email OTP flow  
     const type \= searchParams.get('type') as EmailOtpType | null; // For email OTP flow  
     const next \= searchParams.get('next')?? '/dashboard'; // Default redirect path

     const supabase \= createClient(); // Server client using cookies

     if (code) { // Handling OAuth callback  
       const { error } \= await supabase.auth.exchangeCodeForSession(code);  
       if (\!error) {  
         // Session is set by server client, redirect to the desired page  
         return NextResponse.redirect(\`\<span class="math-inline"\>\\{origin\\}\</span\>{next}\`);  
       }  
       console.error('OAuth Code Exchange Error:', error.message);  
       // Redirect to an error page or show an error message  
       return NextResponse.redirect(\`${origin}/auth/error?message=OAuth\_failed\`);  
     } else if (token\_hash && type) { // Handling Email OTP callback (from Section 3.3)  
       const { error } \= await supabase.auth.verifyOtp({ type, token\_hash });  
       if (\!error) {  
         return NextResponse.redirect(\`\<span class="math-inline"\>\\{origin\\}\</span\>{next}\`);  
       }  
       console.error('Email OTP Verification Error:', error.message);  
       return NextResponse.redirect(\`${origin}/auth/error?message=Email\_OTP\_verification\_failed\`);  
     }

     // If neither 'code' nor 'token\_hash' is present, or if 'type' is missing for OTP  
     console.warn('Callback received without code or valid OTP parameters.');  
     return NextResponse.redirect(\`${origin}/auth/error?message=Invalid\_callback\_parameters\`);  
   }

   * **Explanation:** This Route Handler now checks if a code parameter (from OAuth) is present in the URL. If so, supabase.auth.exchangeCodeForSession(code) is called.9 This exchanges the authorization code (obtained from Google via Supabase's initial callback) for a Supabase session. The @supabase/ssr server client automatically handles setting the session cookies. The user is then redirected to their dashboard or the next path.  
   * This unified callback handler simplifies the /auth/callback route, making it capable of processing different types of authentication completions.

This setup provides a streamlined social login experience. The key is the correct configuration of redirect URIs across Google Cloud, Supabase dashboard, and your application code.

### **3.6. User Logout**

Logging out a user involves clearing their session on both the client and server sides. A Server Action is the recommended approach in Next.js 15\.

1. **Logout Button (Client Component \- e.g., in a UserProfileDropdown.tsx or Navbar.tsx):**  
   TypeScript  
   // app/components/LogoutButton.tsx  
   'use client';

   import { signOut } from '@/app/auth/actions'; // Server Action  
   import { useTransition } from 'react';

   export default function LogoutButton() {  
     const \= useTransition();

     const handleSignOut \= async () \=\> {  
       startTransition(async () \=\> {  
         await signOut();  
         // Redirect is handled by the server action  
       });  
     };

     return (  
       \<form action={handleSignOut}\> {/\* Can also directly use \<form action={signOut}\> \*/}  
         \<button type="submit" disabled={isPending}\>  
           {isPending? 'Logging Out...' : 'Logout'}  
         \</button\>  
       \</form\>  
     );  
   }

2. **Server Action (app/auth/actions.ts \- add a new action or ensure it exists):**  
   TypeScript  
   // app/auth/actions.ts  
   //... (other actions like login, signUp)  
   'use server'; // Ensures this code runs on the server

   import { createClient } from '@/utils/supabase/server';  
   import { redirect } from 'next/navigation';  
   import { revalidatePath } from 'next/cache';

   export async function signOut() {  
     const supabase \= createClient(); // Server client  
     const { error } \= await supabase.auth.signOut();

     if (error) {  
       console.error('Error signing out:', error.message);  
       // Optionally return an error object to be handled client-side if not redirecting  
       return { error: \`Sign out failed: ${error.message}\` };  
     }

     // Revalidate all paths to ensure UI reflects logged-out state  
     revalidatePath('/', 'layout');  
     redirect('/auth/login?message=You have been logged out.'); // Redirect to login page or home page  
   }

   * **Explanation:** The signOut Server Action calls supabase.auth.signOut().1 The @supabase/ssr server client takes care of clearing the session cookies.  
   * revalidatePath('/', 'layout') is important to ensure that any cached pages or layouts are updated to reflect the logged-out state.  
   * redirect('/auth/login') navigates the user to the login page.

### **3.7. Session Management (Cookies, @supabase/ssr helpers, Middleware)**

Effective session management is automatically handled by the @supabase/ssr library in conjunction with the middleware and client utilities previously set up (Section 3.1).

* **Cookie-Based Sessions:** @supabase/ssr is specifically designed for cookie-based authentication, which is the standard and most secure method for applications using Next.js with server-side rendering and Server Components.4  
* **Automatic Token Refresh:** The middleware (defined in middleware.ts) plays a pivotal role.4 By calling await supabase.auth.getUser() on incoming requests, it ensures that the user's JWT (JSON Web Token) is refreshed if it's expired. This refreshed token is then:  
  1. Passed to Server Components and Route Handlers via request.cookies.set() (conceptually, the middleware updates the cookie store for the current request lifecycle).  
  2. Sent back to the browser via response.cookies.set(), updating the client's stored session cookie.  
* **Client Access:**  
  * Client Components can get the current session using const supabase \= createClient(); const { data: { session } } \= await supabase.auth.getSession();.  
  * They can also listen to authentication state changes using supabase.auth.onAuthStateChange((event, session) \=\> {... }); to reactively update the UI.1  
* **Server Access:**  
  * Server Components, Server Actions, and Route Handlers should always use const supabase \= createClient(); const { data: { user } } \= await supabase.auth.getUser(); to get the authenticated user.4 getUser() is preferred over getSession() in server-side code because getUser() always validates the token with the Supabase auth server, providing a definitive authentication status, whereas getSession() might return a session from cookies that hasn't been revalidated yet.4  
* **Security of Cookies:** The @supabase/ssr library and Supabase Auth generally configure cookies with appropriate security attributes like HttpOnly, Secure (in production), and SameSite=Lax.

The combination of @supabase/ssr and the middleware strategy provides a seamless and secure session management system that integrates well with Next.js 15's App Router architecture.

### **3.8. Protecting Routes**

Protecting routes ensures that only authenticated users can access certain pages or API endpoints. This can be implemented at different levels.

1. **Server-Side Protection (Server Component):** This is the primary way to protect pages rendered by Server Components.  
   TypeScript  
   // app/dashboard/page.tsx (Example of a protected Server Component page)  
   import { createClient } from '@/utils/supabase/server';  
   import { redirect } from 'next/navigation';  
   import Link from 'next/link';

   export default async function DashboardPage() {  
     const supabase \= createClient();  
     const { data: { user }, error } \= await supabase.auth.getUser();

     if (error ||\!user) {  
       // If there's an error or no user, redirect to the login page.  
       // Pass a message for better UX.  
       redirect('/auth/login?message=Please log in to access your dashboard.');  
     }

     // If user exists, render the page content.  
     return (  
       \<div\>  
         \<h1\>Welcome to your Dashboard, {user.email}\!\</h1\>  
         \<p\>Your User ID is: {user.id}\</p\>  
         \<p\>\<Link href="/dashboard/settings"\>Account Settings\</Link\>\</p\>  
         {/\* Display user-specific data fetched from Supabase, respecting RLS \*/}  
       \</div\>  
     );  
   }

   * **Explanation:** At the beginning of the Server Component, supabase.auth.getUser() is called.4 If no authenticated user is found (or an error occurs), the redirect function from next/navigation immediately sends the user to the login page. This is a robust server-side check.  
2. **Server-Side Protection (Route Handler / API Route):** Protect API endpoints that should only be accessible by authenticated users.  
   TypeScript  
   // app/api/user-data/route.ts  
   import { createClient } from '@/utils/supabase/server';  
   import { NextResponse } from 'next/server';

   export async function GET(request: Request) {  
     const supabase \= createClient();  
     const { data: { user }, error: authError } \= await supabase.auth.getUser();

     if (authError ||\!user) {  
       return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });  
     }

     // User is authenticated, proceed to fetch/return secure data for this user  
     // Example: Fetch data from 'user\_specific\_table' where RLS applies  
     const { data: userSpecificData, error: dbError } \= await supabase  
      .from('user\_specific\_table')  
      .select('\*')  
      .eq('user\_id', user.id); // RLS should also enforce this, but explicit is fine

     if (dbError) {  
       return NextResponse.json({ error: \`Database error: ${dbError.message}\` }, { status: 500 });  
     }

     return NextResponse.json({  
       message: \`Secure data for ${user.email}\`,  
       userId: user.id,  
       retrievedData: userSpecificData,  
     });  
   }

   * **Explanation:** Similar to Server Components, supabase.auth.getUser() validates the session. If authentication fails, a 401 Unauthorized response is returned.2 Otherwise, the handler proceeds with its logic.  
3. **Server-Side Protection (Server Action):** Server Actions performing sensitive operations must verify authentication.  
   TypeScript  
   // app/dashboard/actions.ts (Example of a protected Server Action)  
   'use server';

   import { createClient } from '@/utils/supabase/server';  
   import { revalidatePath } from 'next/cache';

   export async function updateUserProfile(formData: FormData) {  
     const supabase \= createClient();  
     const { data: { user }, error: authError } \= await supabase.auth.getUser();

     if (authError ||\!user) {  
       return { error: 'Authentication required to update profile.' };  
     }

     const fullName \= formData.get('fullName') as string;  
     //... get other profile fields

     // Update the user's profile in the 'profiles' table  
     const { error: updateError } \= await supabase  
      .from('profiles')  
      .update({ full\_name: fullName /\*, other\_fields \*/ })  
      .eq('id', user.id); // Ensure updating the correct user's profile

     if (updateError) {  
       console.error('Profile update error:', updateError);  
       return { error: \`Failed to update profile: ${updateError.message}\` };  
     }

     revalidatePath('/dashboard'); // Revalidate dashboard to show updated info  
     revalidatePath('/dashboard/settings'); // Revalidate settings page  
     return { success: 'Profile updated successfully by ' \+ user.email };  
   }

   * **Explanation:** The Server Action first checks for an authenticated user. If none, it returns an error. Otherwise, it proceeds with the mutation, associating the data with user.id.  
4. **Client-Side Protection / UI Indication (Client Component):** While server-side checks are authoritative, client-side logic can improve UX by redirecting or showing appropriate UI before a server check might occur, or for dynamically updating UI based on auth state.  
   TypeScript  
   // app/components/ProtectedClientWrapper.tsx  
   'use client';

   import { createClient } from '@/utils/supabase/client';  
   import { useEffect, useState, ReactNode } from 'react';  
   import { User } from '@supabase/supabase-js';  
   import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

   interface ProtectedClientWrapperProps {  
     children: ReactNode;  
     loadingFallback?: ReactNode; // Optional fallback UI for loading state  
     unauthenticatedFallback?: ReactNode; // Optional fallback UI if unauthenticated (before redirect)  
   }

   export default function ProtectedClientWrapper({  
     children,  
     loadingFallback \= \<p\>Loading user session...\</p\>,  
     unauthenticatedFallback \= \<p\>Access denied. Redirecting to login...\</p\>  
   }: ProtectedClientWrapperProps) {  
     const supabase \= createClient();  
     const router \= useRouter();  
     const \[user, setUser\] \= useState\<User | null\>(null);  
     const \[isLoading, setIsLoading\] \= useState(true);

     useEffect(() \=\> {  
       let isMounted \= true;

       async function checkUserSession() {  
         const { data: { session } } \= await supabase.auth.getSession();  
         if (isMounted) {  
           setUser(session?.user?? null);  
           setIsLoading(false);  
           if (\!session?.user) {  
             router.push('/auth/login?message=Client-side session check failed.');  
           }  
         }  
       }

       checkUserSession();

       const { data: authListener } \= supabase.auth.onAuthStateChange((event, session) \=\> {  
         if (isMounted) {  
           setUser(session?.user?? null);  
           setIsLoading(false); // Update loading state on any auth change  
           if (event \=== 'SIGNED\_OUT' |

| (\!session?.user && event\!== 'INITIAL\_SESSION')) {  
router.push('/auth/login?message=You have been signed out.');  
}  
}  
});

    return () \=\> {  
      isMounted \= false;  
      authListener?.subscription?.unsubscribe();  
    };  
  }, \[supabase, router\]);

  if (isLoading) {  
    return loadingFallback;  
  }

  if (\!user) {  
    // This state should ideally be brief as the redirect is triggered.  
    // Can show a message or a spinner.  
    return unauthenticatedFallback;  
  }

  // User is authenticated client-side, render children  
  return \<\>{children}\</\>;  
}  
\`\`\`  
\*   \*\*Explanation:\*\* This Client Component wrapper uses \`supabase.auth.getSession()\` for an initial check and \`supabase.auth.onAuthStateChange()\` to listen for real-time auth events (like sign-in or sign-out from another tab).\[1\] If the user is found to be unauthenticated, it redirects them. This is useful for protecting client-rendered portions of a page or entire client-rendered routes. It complements server-side protection by providing a more immediate UX response.

The primary line of defense for route protection should always be server-side checks (supabase.auth.getUser() in Server Components, Route Handlers, and Server Actions). Client-side checks enhance the user experience but should not be the sole mechanism for security.

### **3.9. Managing User Data in Supabase Tables Post-Authentication**

Supabase Auth manages the auth.users table, which contains essential authentication information but is generally not directly modified for application-specific profile data.15 For storing additional user information (like full name, username, role, telemedicine-specific fields), a separate table in the public schema, linked to auth.users, is the recommended practice.13

1. **Create public.profiles Table (SQL):** This SQL script creates a profiles table and sets up basic RLS policies. It should be run in the Supabase SQL Editor.

| Column Name | Data Type | Constraints & Notes |
| :---- | :---- | :---- |
| id | uuid | Primary Key, Not Null, Foreign Key to auth.users.id (on delete cascade) |
| updated\_at | timestamp with time zone | Optional, can be auto-updated by a trigger or application logic |
| username | text | Unique, optional. Consider length constraints (e.g., char\_length(username) \>= 3). |
| full\_name | text | Optional. |
| avatar\_url | text | Optional, URL to user's avatar image. |
| role | text | For telemedicine: e.g., 'psychologist', 'patient'. Use CHECK constraint. |
| psychologist\_license\_id | text | Specific to 'psychologist' role, nullable. |
| timezone | text | User's preferred timezone, nullable. |

\`\`\`sql  
\-- Create the public.profiles table  
CREATE TABLE public.profiles (  
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,  
  updated\_at TIMESTAMPTZ,  
  username TEXT UNIQUE,  
  full\_name TEXT,  
  avatar\_url TEXT,  
  \-- Telemedicine platform specific fields:  
  role TEXT CHECK (role IN ('psychologist', 'patient')),  
  psychologist\_license\_id TEXT,  
  timezone TEXT,

  PRIMARY KEY (id),  
  CONSTRAINT username\_length CHECK (char\_length(username) \>= 3 AND char\_length(username) \<= 50\) \-- Example constraint  
);

\-- Enable Row Level Security on the profiles table  
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

\-- Allow individuals to read their own profile.  
CREATE POLICY "Users can view their own profile."  
  ON public.profiles FOR SELECT  
  USING (auth.uid() \= id);

\-- Allow individuals to insert their own profile.  
\-- This is typically handled by the trigger, but can be a fallback or for initial setup.  
CREATE POLICY "Users can insert their own profile."  
  ON public.profiles FOR INSERT  
  WITH CHECK (auth.uid() \= id);

\-- Allow individuals to update their own profile.  
CREATE POLICY "Users can update their own profile."  
  ON public.profiles FOR UPDATE  
  USING (auth.uid() \= id)  
  WITH CHECK (auth.uid() \= id);

\-- Optional: Allow authenticated users to view limited public information from other profiles  
\-- CREATE POLICY "Authenticated users can view public profile info."  
\--   ON public.profiles FOR SELECT TO authenticated  
\--   USING (true); \-- Or more specific conditions like (is\_public \= true) if you add such a column

\-- Add indexes for frequently queried columns  
CREATE INDEX idx\_profiles\_username ON public.profiles (username);  
CREATE INDEX idx\_profiles\_role ON public.profiles (role);

\-- Function to automatically update 'updated\_at' timestamp  
CREATE OR REPLACE FUNCTION public.handle\_profile\_update\_timestamp()  
RETURNS TRIGGER AS $$  
BEGIN  
  NEW.updated\_at \= NOW();  
  RETURN NEW;  
END;  
$$ LANGUAGE plpgsql SECURITY DEFINER;

\-- Trigger to update 'updated\_at' before any update on profiles table  
CREATE TRIGGER on\_profile\_update  
  BEFORE UPDATE ON public.profiles  
  FOR EACH ROW  
  EXECUTE PROCEDURE public.handle\_profile\_update\_timestamp();  
\`\`\`  
(\[13\], with telemedicine-specific fields and RLS)

2. **SQL Trigger to Populate profiles on New User Sign-up:** This trigger automatically creates an entry in public.profiles when a new user signs up in auth.users, using metadata provided during sign-up.  
   SQL  
   \-- Function to handle new user creation and populate public.profiles  
   CREATE OR REPLACE FUNCTION public.handle\_new\_user\_profile()  
   RETURNS TRIGGER  
   LANGUAGE plpgsql  
   SECURITY DEFINER SET search\_path \= public \-- Ensures function can access public.profiles  
   AS $$  
   BEGIN  
     INSERT INTO public.profiles (id, full\_name, avatar\_url, role) \-- Add other fields as needed from raw\_user\_meta\_data  
     VALUES (  
       NEW.id,  
       NEW.raw\_user\_meta\_data\-\>\>'full\_name', \-- Expect 'full\_name' in signUp options.data  
       NEW.raw\_user\_meta\_data\-\>\>'avatar\_url', \-- Expect 'avatar\_url' in signUp options.data  
       NEW.raw\_user\_meta\_data\-\>\>'role'        \-- Expect 'role' in signUp options.data  
     );  
     RETURN NEW;  
   END;  
   $$;

   \-- Trigger to call the function after a new user is inserted into auth.users  
   \-- Drop existing trigger if it exists from previous examples  
   DROP TRIGGER IF EXISTS on\_auth\_user\_created ON auth.users;  
   CREATE TRIGGER on\_auth\_user\_created\_populate\_profile  
     AFTER INSERT ON auth.users  
     FOR EACH ROW  
     EXECUTE PROCEDURE public.handle\_new\_user\_profile();  
   (13)  
   * **Explanation:** The handle\_new\_user\_profile function is triggered AFTER INSERT ON auth.users. It takes the new user's id and data from NEW.raw\_user\_meta\_data (which is populated from the options: { data: {... } } object in the supabase.auth.signUp call) and inserts it into public.profiles.  
   * The SECURITY DEFINER clause allows the function to run with the permissions of the user who defined it (typically an admin), enabling it to insert into public.profiles even if the new user doesn't yet have direct insert rights. SET search\_path \= public ensures the function correctly resolves table names within the public schema.  
   * This automated profile creation simplifies the onboarding flow, as the profiles record is created server-side immediately upon user registration.

### **3.10. Interacting with Existing Seeded Data & RLS**

The telemedicine platform has pre-populated seed data. Authenticated users must interact with this data securely, governed by Row Level Security (RLS) policies. RLS is the cornerstone of data security in Supabase, ensuring users can only access and modify data they are permitted to.3

* **RLS Philosophy:** RLS policies are SQL conditions (essentially WHERE clauses) that PostgreSQL automatically applies to every query against a table where RLS is enabled. These policies use session context, like auth.uid() (the ID of the currently authenticated user) and auth.role() (e.g., authenticated, anon), to determine access rights.3  
* Example RLS Policies (SQL):  
  Assume the telemedicine platform has tables like appointments, patient\_records (highly sensitive), and shared\_resources (e.g., articles, guides).  
  1. **appointments Table:** (Assuming patient\_id UUID REFERENCES auth.users(id) and psychologist\_id UUID REFERENCES auth.users(id))  
     SQL  
     ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

     \-- Patients can view, create, and update (e.g., cancel) their own appointments.  
     CREATE POLICY "Patients manage their own appointments"  
       ON public.appointments  
       FOR ALL \-- Covers SELECT, INSERT, UPDATE, DELETE  
       TO authenticated  
       USING (auth.uid() \= patient\_id)  
       WITH CHECK (auth.uid() \= patient\_id);

     \-- Psychologists can view and update appointments they are assigned to.  
     \-- (Assuming psychologists don't create appointments directly this way, or a separate policy exists)  
     CREATE POLICY "Psychologists view and update their assigned appointments"  
       ON public.appointments  
       FOR SELECT, UPDATE  
       TO authenticated  
       USING (auth.uid() \= psychologist\_id AND (SELECT role FROM public.profiles WHERE id \= auth.uid()) \= 'psychologist')  
       WITH CHECK (auth.uid() \= psychologist\_id AND (SELECT role FROM public.profiles WHERE id \= auth.uid()) \= 'psychologist');

     * **Note on Role Check:** The policy for psychologists checks their role from the public.profiles table. This is a common pattern but requires the profiles table to be accurate and the query to profiles to be efficient. Alternatively, custom claims in JWTs (set via database hooks or Edge Functions) can store roles, accessible via auth.jwt()-\>\>'app\_metadata\_role'.3  
  2. patient\_records Table: (Assuming patient\_id UUID REFERENCES auth.users(id))  
     This table would have very strict RLS.  
     SQL  
     ALTER TABLE public.patient\_records ENABLE ROW LEVEL SECURITY;

     \-- Patients can only view their own records. No insert/update/delete directly.  
     CREATE POLICY "Patients can view their own records"  
       ON public.patient\_records  
       FOR SELECT  
       TO authenticated  
       USING (auth.uid() \= patient\_id);

     \-- Psychologists can view records of patients they have an active association with.  
     \-- This requires a linking table, e.g., \`psychologist\_patient\_assignments\`.  
     \-- Example (simplified, assuming 'psychologist\_id' is on patient\_records for their primary psychologist):  
     \-- CREATE POLICY "Assigned psychologists can view patient records"  
     \--   ON public.patient\_records  
     \--   FOR SELECT  
     \--   TO authenticated  
     \--   USING (  
     \--     (SELECT role FROM public.profiles WHERE id \= auth.uid()) \= 'psychologist' AND  
     \--     EXISTS (  
     \--       SELECT 1 FROM psychologist\_patient\_assignments ppa  
     \--       WHERE ppa.psychologist\_id \= auth.uid() AND ppa.patient\_id \= patient\_records.patient\_id AND ppa.is\_active \= true  
     \--     )  
     \--   );

     \-- Mutations to patient\_records should ideally go through trusted server-side logic  
     \-- (e.g., Edge Functions or Server Actions run by psychologists) that perform additional validation.  
     \-- Direct INSERT/UPDATE/DELETE by patients or even psychologists via client might be too permissive.  
     \-- For example, a psychologist might only be allowed to INSERT new records, not modify historical ones.

  3. **shared\_resources Table (e.g., public articles):**  
     SQL  
     ALTER TABLE public.shared\_resources ENABLE ROW LEVEL SECURITY;

     \-- Anyone (anonymous or authenticated) can view shared resources.  
     CREATE POLICY "Public resources are viewable by everyone"  
       ON public.shared\_resources  
       FOR SELECT  
       USING (true); \-- Or specify 'TO anon, authenticated'

* Querying Data with RLS (Server Component Example):  
  When using the Supabase JS client (@supabase/ssr), RLS is automatically applied based on the authenticated user's session.  
  TypeScript  
  // app/dashboard/my-records/page.tsx  
  import { createClient } from '@/utils/supabase/server';  
  import { redirect } from 'next/navigation';

  export default async function MyPatientRecordsPage() {  
    const supabase \= createClient();  
    const { data: { user } } \= await supabase.auth.getUser();

    if (\!user) {  
      redirect('/auth/login?message=Please log in to view records.');  
    }

    // Fetch data from 'patient\_records'. RLS automatically filters records  
    // ensuring the user (patient) can only see their own.  
    const { data: records, error } \= await supabase  
     .from('patient\_records')  
     .select(\`  
        id,  
        record\_date,  
        summary,  
        details  
        \-- other fields  
      \`);  
      // No explicit.eq('patient\_id', user.id) is strictly needed here if RLS is correctly defined  
      // for SELECT on patient\_id \= auth.uid(). However, adding it can sometimes help with query planning  
      // or act as a defense-in-depth, but RLS is the primary enforcer.

    if (error) {  
      console.error('Error fetching patient records:', error.message);  
      return \<p\>Error loading your records. Please try again later.\</p\>;  
    }

    if (\!records |

| records.length \=== 0\) {  
return \<p\>No records found.\</p\>;  
}

  return (  
    \<div\>  
      \<h2\>My Health Records\</h2\>  
      \<ul\>  
        {records.map((record) \=\> (  
          \<li key={record.id}\>  
            \<strong\>Date:\</strong\> {new Date(record.record\_date).toLocaleDateString()} \<br /\>  
            \<strong\>Summary:\</strong\> {record.summary}  
            {/\* Display other record details carefully \*/}  
          \</li\>  
        ))}  
      \</ul\>  
    \</div\>  
  );  
}  
\`\`\`  
\*   \*\*Explanation:\*\* The query to \`patient\_records\` does not need an explicit \`WHERE patient\_id \= '${user.id}'\` clause in the JavaScript code if the RLS policy \`USING (auth.uid() \= patient\_id)\` is active for the \`SELECT\` operation and the \`authenticated\` role. Supabase's PostgREST layer, which the JS client communicates with, sets the \`auth.uid()\` context for the database session, and PostgreSQL enforces the RLS.

* **Best Practices for RLS** 3**:**  
  * **Enable RLS on all tables containing sensitive or user-specific data.**  
  * Use auth.uid() as the primary mechanism for user-specific data access.  
  * For role-based access, prefer using app\_metadata (which users cannot modify) over user\_metadata in JWTs, or use a separate roles table linked to profiles.  
  * Test RLS policies rigorously using different user roles and scenarios. Supabase provides a "RLS policy editor" in the dashboard which can help simulate queries.  
  * Keep policies as simple as possible for performance; complex joins within policies can be slow.  
  * Add database indexes to columns frequently used in RLS policy conditions (e.g., user\_id, role).

The synergy between Supabase Auth and RLS is fundamental to building secure applications. RLS acts as the ultimate gatekeeper at the database level, ensuring that even if application-level checks are bypassed, unauthorized data access is prevented. For a telemedicine platform, this layer of security is non-negotiable.

## **4\. Prisma Integration: Harmonizing Schema Definition with Supabase**

Integrating Prisma into a project with an existing Supabase database (including seed data and Supabase-managed schemas like auth) requires a careful workflow. Prisma will be used for defining and migrating *application-specific* schemas, while respecting Supabase's control over its internal schemas.

### **4.1. Workflow: Prisma with an Existing Supabase Database**

1. **Install Prisma:**  
   Bash  
   pnpm install prisma \--save-dev  
   pnpm install @prisma/client

2. **Connect Prisma to Supabase:**  
   * Obtain the PostgreSQL connection string from your Supabase Dashboard (Settings \> Database \> Connection string \> URI). Use the direct PostgreSQL connection string, not the connection pooler string, for migration tasks to avoid potential issues.17  
   * Add this string to your .env file as DATABASE\_URL.  
   * **Security Best Practice (Dedicated Prisma User):** Instead of using the postgres superuser, create a dedicated PostgreSQL role for Prisma with specific, limited permissions on the public schema (and any other application-specific schemas you create). This enhances security.18  
     SQL  
     \-- Run in Supabase SQL Editor  
     CREATE ROLE prisma\_migrator WITH LOGIN PASSWORD 'your\_strong\_password\_here';  
     GRANT CREATE ON SCHEMA public TO prisma\_migrator; \-- Allow creating tables in public schema  
     GRANT USAGE ON SCHEMA public TO prisma\_migrator;

     \-- For Prisma Client (runtime user, potentially different with fewer privileges)  
     CREATE ROLE prisma\_app\_user WITH LOGIN PASSWORD 'another\_strong\_password';  
     GRANT USAGE ON SCHEMA public TO prisma\_app\_user;  
     GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO prisma\_app\_user;  
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO prisma\_app\_user;  
     GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO prisma\_app\_user;  
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO prisma\_app\_user;

     \-- Update DATABASE\_URL to use prisma\_migrator for migrations  
     \-- and potentially prisma\_app\_user for runtime Prisma Client if separating concerns.  
     \-- For simplicity in alpha, prisma\_migrator might be used for both, but ensure it doesn't have superuser rights.  
     Your DATABASE\_URL in .env should use the credentials for prisma\_migrator when running migrations.  
3. **Initialize Prisma (if not already done):**  
   Bash  
   npx prisma init  
   This creates a prisma directory with a schema.prisma file. Configure the datasource block:  
   Fragmento de código  
   // prisma/schema.prisma  
   datasource db {  
     provider \= "postgresql"  
     url      \= env("DATABASE\_URL")  
     // For Supabase, you might need to list schemas Prisma should be aware of,  
     // especially if you have relations spanning them or want to introspect them.  
     // However, Prisma should NOT attempt to migrate Supabase-managed schemas like 'auth'.  
     // schemas \= \["public", "auth"\] // Use with caution, see introspection section.  
   }

   generator client {  
     provider \= "prisma-client-js"  
     // output   \= "../node\_modules/.prisma/client" // Default output  
   }

### **4.2. Introspecting the Existing Database (prisma db pull)**

To align Prisma's schema with your existing Supabase database structure (including auth.users, your public.profiles, and seeded tables):

1. **Run Introspection:**  
   Bash  
   npx prisma db pull

   This command connects to your Supabase database using DATABASE\_URL and updates schema.prisma with models reflecting the current database structure.19 It will include tables from all accessible schemas, including public, auth, storage, etc.  
2. **Handling Supabase-Managed Schemas (auth, storage):**  
   * Prisma should **not** be used to generate migrations for schemas managed by Supabase (e.g., auth, storage, realtime).17 Attempting to do so can break Supabase functionality.  
   * After prisma db pull, your schema.prisma will contain models for these tables.  
     * **Option 1 (Safest for Supabase-managed schemas):** If Prisma Client doesn't need to query or relate to these tables directly (e.g., you use Supabase JS client for auth interactions), you can comment out or delete the models for auth.users, storage.objects, etc., from schema.prisma.  
     * **Option 2 (If relations are needed, e.g., public.profiles to auth.users):** Keep the necessary models (like for auth.users) but ensure Prisma does not attempt to migrate them. This is where careful baselining (Section 4.4) becomes critical. You can use the @@schema("auth") directive on the model to specify its schema.

### **4.3. Defining/Refining schema.prisma**

After introspection, review and refine schema.prisma. Ensure your application-specific tables, like public.profiles, are correctly defined and relations are established.

Fragmento de código

// prisma/schema.prisma

datasource db {  
  provider \= "postgresql"  
  url      \= env("DATABASE\_URL")  
  // If you need to explicitly manage multiple schemas for your application tables,  
  // or reference tables in 'auth' for relations.  
  // schemas \= \["public", "auth"\] // Add 'auth' if you intend to define relations to auth.users  
}

generator client {  
  provider \= "prisma-client-js"  
}

// Model for your application's profiles table  
model Profile { // Prisma convention is PascalCase for model names  
  id                      String    @id @db.Uuid // Corresponds to auth.users.id  
  updated\_at              DateTime? @updatedAt @db.Timestamptz  
  username                String?   @unique  
  full\_name               String?  
  avatar\_url              String?  
  role                    String?   // e.g., 'psychologist', 'patient'  
  psychologist\_license\_id String?  
  timezone                String?

  // Explicit relation to the User model (representing auth.users)  
  user User @relation(fields: \[id\], references: \[id\], onDelete: Cascade)

  @@map("profiles") // Maps to the 'profiles' table in the 'public' schema  
}

// Model representing auth.users (introspected)  
// IMPORTANT: Prisma should NOT generate migrations for this table.  
// It is managed by Supabase Auth. This definition is for Prisma Client's  
// type safety and for establishing relations.  
model User {  
  id                       String    @id @db.Uuid  
  email                    String?   @unique  
  encrypted\_password       String?  
  email\_confirmed\_at       DateTime? @db.Timestamptz  
  phone                    String?   @unique  
  phone\_confirmed\_at       DateTime? @db.Timestamptz  
  created\_at               DateTime? @default(now()) @db.Timestamptz  
  updated\_at               DateTime? @updatedAt @db.Timestamptz  
  raw\_user\_meta\_data       Json?     @db.JsonB // Stores data passed during signUp  
  raw\_app\_meta\_data        Json?     @db.JsonB // For non-user-editable metadata

  // One-to-one relation from User (auth.users) to Profile (public.profiles)  
  profile Profile?

  //... other fields from auth.users as introspected...

  @@map("users")  
  @@schema("auth") // Specifies that this model maps to the 'users' table in the 'auth' schema  
}

// Example application-specific table for appointments  
model Appointment {  
  id              String     @id @default(cuid()) @db.Uuid // Or use autoincrement Int  
  created\_at      DateTime   @default(now())  
  updated\_at      DateTime   @updatedAt  
  appointment\_time DateTime  
  status          String     // e.g., 'scheduled', 'completed', 'cancelled'  
  notes           String?

  patient\_id      String     @db.Uuid  
  psychologist\_id String     @db.Uuid

  patient         User       @relation("PatientAppointments", fields: \[patient\_id\], references: \[id\])  
  psychologist    User       @relation("PsychologistAppointments", fields: \[psychologist\_id\], references: \[id\])

  @@map("appointments") // Maps to 'appointments' table in 'public' schema  
  @@index(\[patient\_id\])  
  @@index(\[psychologist\_id\])  
}

* **Explanation:**  
  * The Profile model maps to your public.profiles table. The @relation to User establishes the foreign key link. onDelete: Cascade mirrors the SQL constraint.  
  * The User model maps to auth.users. The @@schema("auth") directive is vital if you've enabled multi-schema support in your datasource and want Prisma to correctly identify this table.18  
  * The Appointment model is an example of a new, application-specific table that Prisma *will* manage and migrate.

### **4.4. Establishing a Migration Baseline**

This is a critical step to inform Prisma that your existing database schema (including seeded data and Supabase-managed tables) is the starting point, preventing Prisma from trying to recreate or alter them.17

**Recommended Baselining Workflow (as of May 2025):**

1. **Ensure DATABASE\_URL is correctly set in .env.**  
2. **Run npx prisma db pull** to ensure schema.prisma accurately reflects the current state of your Supabase database.  
3. **Refine schema.prisma:**  
   * Verify relations, types, and constraints.  
   * Crucially, ensure models for Supabase-managed tables (like User mapping to auth.users) are correctly defined with @@schema("auth") if applicable, but understand these will not be migrated by Prisma.  
4. **Create and apply a baseline migration:** The most straightforward way to baseline with modern Prisma versions is:  
   Bash  
   npx prisma migrate dev \--name "initial\_baseline\_from\_existing\_db"

   * When Prisma detects that your database is not empty and there's no prior Prisma migration history, it will prompt you: "We need to reset the database... Do you want to continue?" **If your database has existing data you want to keep (like your seed data), you typically DO NOT want to reset.**  
   * If prisma migrate dev detects schema drift (differences between schema.prisma and the actual DB), it will list them. If these "drifts" are actually your existing tables that you want to keep, you need to ensure Prisma acknowledges them without trying to drop them.  
   * Alternative if migrate dev is problematic 20:  
     This method offers more granular control if migrate dev attempts unwanted changes.  
     a. Create the migrations directory if it doesn't exist: mkdir \-p prisma/migrations/0\_init\_baseline  
     b. Generate a diff script that represents the SQL to create your current schema from an empty state. This script is for reference, not direct application.  
     bash npx prisma migrate diff \--from-empty \--to-schema-datamodel prisma/schema.prisma \--script \> prisma/migrations/0\_init\_baseline/migration.sql  
     c. Tell Prisma to mark this conceptual "0\_init\_baseline" migration as already applied:  
     bash npx prisma migrate resolve \--applied "0\_init\_baseline"  
     This updates Prisma's internal migration tracking table (\_prisma\_migrations) to consider this baseline as complete.  
   * **Supabase Official Recommendation** 18**:** Use prisma migrate baseline.  
     Bash  
     npx prisma migrate baseline \--name "initial\_baseline\_from\_existing\_db"

     This command is specifically designed for baselining an existing database. It should introspect the database and create a migration that effectively marks the current schema state as the first migration.

After baselining, Prisma should understand the current state of your database and will only generate migrations for subsequent changes you make in schema.prisma to your *application-specific* tables.

**Prisma Baselining Workflow for Existing Supabase DB**

| Step | Command / Action | Purpose & Explanation | Key Considerations |
| :---- | :---- | :---- | :---- |
| 1 | Set DATABASE\_URL | Configure Prisma to connect to your Supabase DB. | Use direct PostgreSQL URI; consider dedicated prisma\_migrator role. |
| 2 | npx prisma db pull | Introspect DB; update schema.prisma to match current DB state. | Review introspected schema, especially for Supabase-managed tables. |
| 3 | Refine schema.prisma | Adjust models, define relations (e.g., Profile to User for auth.users). Add @@map and @@schema directives as needed. | Do not plan to migrate Supabase-internal schemas (auth, storage). |
| 4 | npx prisma migrate baseline \--name "initial\_baseline" (Recommended) \<br/\> OR \<br/\> Manual migrate diff \+ migrate resolve (Advanced) | Establish the current DB state as Prisma's starting point. Prevents Prisma from trying to drop/recreate existing tables/data. | This is crucial for existing databases with data. Avoid resetting the DB if data needs to be preserved. |
| 5 | Verify | Check \_prisma\_migrations table in Supabase. It should now have an entry for your baseline migration. | Subsequent prisma migrate dev should only detect changes made *after* this baseline. |

### **4.5. Managing Ongoing Migrations for Application-Specific Tables**

Once the baseline is established, use Prisma for schema changes to your application's tables (e.g., Profile, Appointment, or any new tables for the telemedicine platform).

1. **Modify schema.prisma:** Add new models, fields, or relations for your application logic.  
   Fragmento de código  
   // Example: Adding a 'notes' field to the Profile model  
   model Profile {  
     //... existing fields...  
     notes      String?   // New field for psychologist notes (ensure RLS protects this)  
     //...  
   }

2. **Generate and Apply Migration:**  
   Bash  
   npx prisma migrate dev \--name "add\_notes\_to\_profile"  
   Prisma will:  
   * Create a new SQL migration file in prisma/migrations/.  
   * Apply this migration to your Supabase database (and the shadow database if configured).  
   * Update the \_prisma\_migrations table.  
3. **Generate Prisma Client:** After any schema change and migration, regenerate Prisma Client for type safety:  
   Bash  
   npx prisma generate

**Important:** Always review the SQL generated by prisma migrate dev before applying it, especially in staging or production environments, to ensure it only affects intended tables and doesn't inadvertently try to modify Supabase-managed schemas.

### **4.6. Schema Consistency: Best Practices (April-May 2025\)**

* **schema.prisma as Source of Truth (for App Tables):** For tables your application directly owns and manages (e.g., profiles, appointments), schema.prisma should be the definitive source. Use prisma migrate dev to evolve these.  
* **Supabase Manages Its Own Schemas:** Reiterate that auth, storage, realtime, and other internal Supabase schemas are managed by Supabase. Do not attempt to use prisma migrate to alter them.17 If prisma db pull includes them, treat their models in schema.prisma as read-only references for Prisma Client if relations are needed, or exclude them if not.  
* **Periodic prisma db pull (Cautiously):** On a separate development branch, you can periodically run npx prisma db pull to see if Supabase has made underlying changes to its managed schemas (e.g., added a new column to auth.users). If so, update your Prisma Client by running npx prisma generate. Do *not* automatically create Prisma migrations from these changes for Supabase-managed schemas. If there's a significant structural change by Supabase that breaks your Prisma model's assumptions, you may need to adjust your Prisma schema's representation of that table.  
* **Database Triggers for Cross-Schema Sync:** For data consistency between Supabase-managed tables (like auth.users) and your application tables (like public.profiles), use PostgreSQL triggers defined directly in Supabase (as shown in Section 3.9).13 Prisma does not manage these triggers, but prisma db pull will see the tables and columns they affect.  
* **Shadow Database for Migrations:** Configure and use a shadow database for prisma migrate dev. This is a Prisma feature that creates a temporary database to detect potential issues with migrations before applying them to your main development database. Supabase's Prisma integration guides typically cover this setup.22  
* **Review Generated SQL:** Always inspect the SQL generated by prisma migrate dev (found in the migration files) before applying to critical environments.

### **4.7. Using Prisma Client with Supabase RLS**

How Prisma Client queries interact with Supabase's Row Level Security is a nuanced topic.

* **Prisma Client Executes Server-Side:** In a Next.js context, Prisma Client queries are made from Server Components, Server Actions, or API Route Handlers – all executing on the server.23  
* **RLS Context:** Supabase RLS policies (e.g., USING (auth.uid() \= user\_id)) rely on the JWT of the end-user being available to the PostgreSQL session, typically via session variables like request.jwt.claims which are set when a request goes through Supabase's API gateway (PostgREST).  
* **Prisma's Direct Connection:** Prisma Client connects *directly* to your PostgreSQL database using the DATABASE\_URL. This connection bypasses the Supabase API gateway. Consequently, RLS policies that depend on auth.uid() or auth.role() (derived from the JWT processed by PostgREST) **will not automatically apply** to queries made by Prisma Client in its default connection mode. The database session initiated by Prisma doesn't inherently know about the end-user's JWT.

**Strategies for Prisma Client and RLS:**

1. **Use Supabase JS Client for RLS-Protected Reads:** For queries that must strictly adhere to the end-user's RLS (especially reads), the simplest and most reliable approach is to use the Supabase JS client (@supabase/ssr), as shown in Section 3.10. This client routes requests through the Supabase API gateway, which correctly applies RLS.  
2. **Prisma for Admin/Backend Tasks (Bypassing RLS):** If Prisma Client connects using a role with BYPASSRLS privileges (like the postgres user or a service\_role if you configure DATABASE\_URL with a service key, though not generally recommended for app logic), it will ignore RLS. This is suitable for administrative tasks or backend processes where RLS based on the end-user is not intended. **Use with extreme caution.**  
3. **Replicating RLS Logic in Prisma WHERE Clauses (Recommended for Prisma Mutations):** When performing mutations (create, update, delete) with Prisma Client that need to be user-specific:  
   * First, authenticate the user server-side using await supabase.auth.getUser() (from @supabase/ssr server client).  
   * Then, in your Prisma Client query, explicitly include WHERE conditions that mirror your RLS logic, using the validated user.id.

TypeScript  
// Example Server Action using Prisma Client with explicit WHERE for RLS-like behavior  
'use server';  
import { createClient as createSupabaseClient } from '@/utils/supabase/server';  
import prisma from '@/lib/prisma'; // Your Prisma client instance  
import { revalidatePath } from 'next/cache';

export async function updateAppointmentNote(appointmentId: string, newNote: string) {  
  const supabase \= createSupabaseClient();  
  const { data: { user } } \= await supabase.auth.getUser();

  if (\!user) {  
    return { error: 'Unauthorized' };  
  }

  try {  
    const updatedAppointment \= await prisma.appointment.update({  
      where: {  
        id: appointmentId,  
        // AND condition to ensure the user owns this appointment (mimicking RLS)  
        // This assumes 'patient\_id' or 'psychologist\_id' is on the Appointment model  
        // and you have logic to determine which one applies based on user.id or user.role  
        // For simplicity, let's assume patient owns it:  
        patient\_id: user.id,  
      },  
      data: {  
        notes: newNote,  
      },  
    });

    if (\!updatedAppointment) {  
      // This could happen if the appointmentId doesn't exist OR if the patient\_id doesn't match user.id  
      return { error: 'Appointment not found or access denied.' };  
    }  
    revalidatePath('/dashboard/appointments');  
    return { success: true, appointment: updatedAppointment };  
  } catch (error) {  
    console.error("Prisma update error:", error);  
    return { error: 'Failed to update appointment.' };  
  }  
}

4. **Setting JWT Claims for Prisma's Session (Advanced and Complex):** It is theoretically possible to make Prisma queries respect auth.uid() by setting the request.jwt.claims (and other relevant session variables like role) for the PostgreSQL session that Prisma uses, typically via raw SQL commands like SET LOCAL request.jwt.claims \= '...' before your Prisma query, within the same transaction. This is complex, error-prone, can have security implications if not done correctly, and may not be well-supported or documented for all Prisma use cases. This approach is generally **not recommended** for simplicity and robustness, especially for an alpha.

For the telemedicine platform, a hybrid approach is often best:

* Use **Supabase JS client (@supabase/ssr)** for most user-facing data fetching where RLS is critical and needs to be applied transparently based on the end-user's session.  
* Use **Prisma Client** server-side for:  
  * Mutations where you can explicitly enforce user ownership in WHERE clauses after server-side authentication (as shown above).  
  * Complex queries or data manipulations that are easier to express with Prisma.  
  * Interacting with tables that don't have user-specific RLS or where RLS is based on simpler conditions not tied to auth.uid().  
  * Backend/admin operations (potentially with a more privileged role, carefully managed).

This pragmatic approach balances Prisma's strengths in schema management and type-safe querying with Supabase's robust, integrated RLS capabilities for end-user data security. The key is understanding that Prisma Client and Supabase's RLS (tied to its API gateway) operate in different contexts unless explicitly bridged, which is often more complex than beneficial for many use cases.

## **5\. Best Practices for Alpha Phase (Telemedicine Platform)**

Launching an alpha for a telemedicine platform requires a balance between rapid development and foundational robustness, especially concerning security and user experience.

### **5.1. Security: Paramount for Telemedicine**

Given the sensitive nature of health information, security cannot be an afterthought, even in an alpha phase.

* **Supabase Auth Configuration:**  
  * **Strong Password Policies:** Enforce strong password requirements. Supabase Auth settings allow configuring minimum password length and complexity, although advanced complexity rules might require custom logic.  
  * **Email Confirmation:** This should be enabled (as configured in Section 2.2) to verify user email addresses and prevent trivial fake account creation.1  
  * **Multi-Factor Authentication (MFA):** While potentially adding complexity for a rapid alpha, MFA is standard for healthcare applications. Supabase supports MFA (TOTP).4 If not implemented for the initial alpha, it should be a high-priority item for subsequent iterations.  
  * **Auth Logs:** Regularly review authentication logs in the Supabase dashboard for suspicious activity.  
* **Row Level Security (RLS):**  
  * **Default Deny:** Tables containing sensitive data should have RLS enabled, and policies should be crafted with a "default deny" stance – no access is permitted unless a policy explicitly grants it.3  
  * **Least Privilege:** Grant only the minimum necessary permissions. For example, if a user only needs to read their data, do not grant update or delete permissions unless required.  
  * **Thorough Testing:** Test RLS policies for all defined user roles (e.g., 'patient', 'psychologist', potential 'admin' roles) and various data access scenarios. Use Supabase's SQL Editor to test policies by impersonating roles (SET ROLE authenticated; SET request.jwt.claims \= '{"sub":"user-uuid", "role":"authenticated"}'; SELECT \* FROM your\_table;).  
  * **Metadata for Authorization:** Avoid using raw\_user\_meta\_data (which is user-editable) for critical RLS decisions. Instead, use raw\_app\_meta\_data (set server-side, e.g., via an Edge Function or trusted Server Action after verification) or linked role/permission tables for more secure role-based access control.3  
* **API and Server Action Security:**  
  * **Authentication Checks:** Every sensitive API Route Handler and Server Action must begin by verifying user authentication using await supabase.auth.getUser().4  
  * **Input Validation:** Rigorously validate all incoming data on the server-side before processing or saving it to the database. This prevents injection attacks and ensures data integrity.  
  * **Environment Variables:** All secrets (Supabase URL, anon key, service role key if used, database passwords for Prisma) must be stored securely in environment variables and never hardcoded or exposed client-side.2 The SUPABASE\_SERVICE\_ROLE\_KEY grants full database access, bypassing RLS, and must be guarded with extreme care, used only in trusted server environments for specific administrative tasks.  
* **Prisma Client Security:**  
  * Ensure Prisma Client is exclusively used in server-side code (Server Components, Server Actions, Route Handlers).23  
  * If a dedicated prisma\_user role is configured for Prisma (as recommended in Section 4.1), ensure its database permissions are strictly limited to what the application requires.  
* **Data Handling (Telemedicine Specifics):**  
  * Be acutely aware of data privacy regulations like HIPAA (in the US) or GDPR (in Europe), even during the alpha phase if real patient data (even anonymized or test data resembling real data) is involved. Supabase provides encryption at rest by default. For extreme sensitivity, consider application-level encryption for specific fields, though this adds complexity.  
  * Audit trails for sensitive data access or modifications can be considered for future iterations.

### **5.2. Performance for a Smooth Alpha User Experience**

A responsive application is crucial for retaining alpha testers and gathering useful feedback.

* **Database Query Optimization:**  
  * **Selective Fetching:** Use select() with both Supabase JS client and Prisma Client to fetch only the columns needed by the application. Avoid select \* on wide tables.  
  * **Database Indexes:** Create indexes on columns frequently used in WHERE clauses, JOIN conditions, ORDER BY clauses, and RLS policy conditions (e.g., foreign keys like user\_id, patient\_id, psychologist\_id, or status/role columns).3 Use the Supabase SQL Editor or Prisma migrations (for application-specific tables) to manage indexes.  
  * **Query Analysis:** Supabase offers query performance insights in its dashboard (under Database \> Query Performance or Reports). Use these tools to identify and optimize slow queries.  
* **Next.js 15 Caching and Data Fetching:**  
  * Next.js 15 has changed default caching behavior, making fetch requests, GET Route Handlers, and client navigations uncached by default.12 This is generally advantageous for dynamic, authenticated data as it reduces the risk of serving stale content.  
  * The use of cookies() in the server-side Supabase client setup (as shown in utils/supabase/server.ts and middleware.ts) typically opts these Supabase data fetches out of Next.js's full route caching, ensuring fresh data for authenticated users.4  
  * **Revalidation:** After data mutations (e.g., login, logout, profile updates, creating an appointment), use revalidatePath() or revalidateTag() within Server Actions or Route Handlers to invalidate relevant caches and trigger data refetching for Server Components.4  
* **Efficient Client Instantiation:**  
  * For Prisma Client, use a singleton pattern in development to avoid creating multiple instances, which can exhaust database connections.19 The @supabase/ssr utilities createBrowserClient and createServerClient are designed to be called as needed and manage their connections efficiently.  
* **Bundle Sizes:** While not directly auth-related, keep an eye on client-side JavaScript bundle sizes. Large bundles can slow down initial page loads. Use Next.js dynamic imports (next/dynamic) for components not needed immediately.

### **5.3. User Experience (UX) in Authentication Flows**

A clear, intuitive, and error-tolerant authentication process is vital for user adoption, especially in an alpha.

* **Clear Communication:**  
  * Provide explicit success messages (e.g., "Sign-up successful\! Please check your email to confirm your account.")  
  * Display user-friendly error messages (e.g., "Invalid email or password.", "An account with this email already exists.", "Confirmation link has expired."). Avoid exposing raw technical error details to the user.  
* **Loading States and Transitions:**  
  * Implement loading indicators (spinners, disabled buttons with text like "Logging in...") during asynchronous authentication operations (sign-up, login, social login redirects) to provide feedback that the system is working. React's useTransition hook can be helpful here.  
* **Sensible Redirects:**  
  * After login: Redirect to the user's dashboard or the page they were trying to access.  
  * After logout: Redirect to the login page or homepage.  
  * After email confirmation: Redirect to a welcome page or the dashboard.  
* **Session Management UX:**  
  * Gracefully handle session expiry. The middleware should refresh tokens, but if a session becomes truly invalid (e.g., user revoked access), the application should redirect the user to the login page with an appropriate message. Client-side wrappers (like ProtectedClientWrapper in Section 3.8) can assist with this.  
  * Ensure consistent auth state across multiple tabs if possible (Supabase's onAuthStateChange can help with this client-side).

### **5.4. Scalability: Initial Considerations for a Growing Alpha**

While the primary focus of an alpha is functionality and feedback, some thought towards scalability is prudent.

* **Supabase Platform:** Supabase is built on PostgreSQL and designed to scale. As usage grows, you can upgrade your Supabase project's compute resources (CPU, RAM, IOPS) via the dashboard to handle increased load.17 Monitor database performance and resource utilization regularly.  
* **Next.js Hosting:** Platforms like Vercel (where Next.js originates) provide highly scalable serverless infrastructure for deploying Next.js applications.  
* **Database Design and RLS:** A well-normalized database schema and efficient RLS policies are crucial for performance at scale. Poorly designed RLS or missing indexes can become bottlenecks.  
* **AI Functionality Integration:** The telemedicine platform's AI features will interact with user data. Ensure that authentication and authorization are tightly integrated:  
  * AI API endpoints must be protected, accessible only by authenticated users or trusted backend services. Supabase Auth can be used to issue tokens for these services or validate user tokens.5  
  * Data passed to AI models and results generated by AI must be associated with the correct user and protected by RLS.  
  * Consider rate limiting for AI features to prevent abuse and manage costs.  
* **Asynchronous Operations:** For potentially long-running AI tasks or other background processes, consider using asynchronous job queues and Supabase Edge Functions or other serverless functions to offload work from the main request-response cycle.

By addressing these best practices, the telemedicine platform can achieve a successful alpha launch that is not only functional but also secure, performant, and user-friendly, laying a strong foundation for future development and growth. The emphasis on robust security through Supabase Auth and RLS, combined with the streamlined development experience of Next.js 15 and Prisma, provides a powerful stack for this endeavor.

## **6\. Conclusion**

Migrating to Supabase for full-stack authentication and database management within a Next.js 15 (App Router) project offers a cohesive and efficient solution for developing a telemedicine platform, particularly for an alpha phase requiring rapid deployment. The tight integration of Supabase Auth with its PostgreSQL backend, managed via Row Level Security, provides a robust security model that is often simpler to implement and maintain compared to managing separate identity and database providers. The @supabase/ssr library is instrumental in this architecture, enabling seamless and secure session management across server and client components in Next.js.

The use of Prisma for development-phase schema definition requires a careful baselining process to work with an existing Supabase database, ensuring that Prisma manages application-specific tables while respecting Supabase's control over its internal schemas like auth. For data access, leveraging the Supabase JS client for RLS-sensitive queries and Prisma Client for server-side mutations (with explicit WHERE clauses mimicking RLS) or backend tasks presents a balanced approach.

For the telemedicine platform, prioritizing security through meticulous RLS policies, secure Supabase Auth configuration, and protected server-side logic is paramount. Performance, driven by optimized queries, appropriate indexing, and understanding Next.js 15's caching mechanisms, will be key to a positive alpha user experience. By adhering to the implementation strategies and best practices outlined, the development team can confidently replace Auth0, streamline their backend, and rapidly deploy a secure and functional alpha version of their application.

#### **Fuentes citadas**

1. Supabase Authentication and Authorization in Next.js ... \- Permit.io, acceso: mayo 14, 2025, [https://www.permit.io/blog/supabase-authentication-and-authorization-in-nextjs-implementation-guide](https://www.permit.io/blog/supabase-authentication-and-authorization-in-nextjs-implementation-guide)  
2. Implementing Authentication in Next.js with Supabase: A Complete Guide \- Techstaunch, acceso: mayo 14, 2025, [https://techstaunch.com/blogs/tech/implementing-authentication-in-next-js-with-supabase](https://techstaunch.com/blogs/tech/implementing-authentication-in-next-js-with-supabase)  
3. Row Level Security | Supabase Docs, acceso: mayo 14, 2025, [https://supabase.com/docs/guides/database/postgres/row-level-security](https://supabase.com/docs/guides/database/postgres/row-level-security)  
4. Setting up Server-Side Auth for Next.js | Supabase Docs, acceso: mayo 14, 2025, [https://supabase.com/docs/guides/auth/server-side/nextjs](https://supabase.com/docs/guides/auth/server-side/nextjs)  
5. How to Set Up Supabase Auth in Next.js (2025 Guide) \- Zestminds, acceso: mayo 14, 2025, [https://www.zestminds.com/blog/supabase-auth-nextjs-setup-guide](https://www.zestminds.com/blog/supabase-auth-nextjs-setup-guide)  
6. Migrate from Auth0 to Supabase Auth | Supabase Docs, acceso: mayo 14, 2025, [https://supabase.com/docs/guides/platform/migrating-to-supabase/auth0](https://supabase.com/docs/guides/platform/migrating-to-supabase/auth0)  
7. Build a User Management App with Next.js | Supabase Docs, acceso: mayo 14, 2025, [https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)  
8. Social Login | Supabase Docs, acceso: mayo 14, 2025, [https://supabase.com/docs/guides/auth/social-login](https://supabase.com/docs/guides/auth/social-login)  
9. Login with Google | Supabase Docs, acceso: mayo 14, 2025, [https://supabase.com/docs/guides/auth/social-login/auth-google](https://supabase.com/docs/guides/auth/social-login/auth-google)  
10. Changelog \- Supabase, acceso: mayo 14, 2025, [https://supabase.com/changelog?next=Y3Vyc29yOnYyOpK0MjAyNC0wOS0xOFQxOTowNTozN1rOAG3scg==\&restPage=2](https://supabase.com/changelog?next=Y3Vyc29yOnYyOpK0MjAyNC0wOS0xOFQxOTowNTozN1rOAG3scg%3D%3D&restPage=2)  
11. Changelog \- Supabase, acceso: mayo 14, 2025, [https://supabase.com/changelog?next=Y3Vyc29yOnYyOpK0MjAyNC0wOS0yMlQwNDo1OToyMFrOAG4bfA==\&restPage=2](https://supabase.com/changelog?next=Y3Vyc29yOnYyOpK0MjAyNC0wOS0yMlQwNDo1OToyMFrOAG4bfA%3D%3D&restPage=2)  
12. Next.js 15, acceso: mayo 14, 2025, [https://nextjs.org/blog/next-15](https://nextjs.org/blog/next-15)  
13. User Management | Supabase Docs, acceso: mayo 14, 2025, [https://supabase.com/docs/guides/auth/managing-user-data](https://supabase.com/docs/guides/auth/managing-user-data)  
14. How To Set Up Google OAuth Login (Supabase Tutorial) \- YouTube, acceso: mayo 14, 2025, [https://www.youtube.com/watch?v=sB6bPOvvlgw\&pp=0gcJCdgAo7VqN5tD](https://www.youtube.com/watch?v=sB6bPOvvlgw&pp=0gcJCdgAo7VqN5tD)  
15. What auth should I use? : r/nextjs \- Reddit, acceso: mayo 14, 2025, [https://www.reddit.com/r/nextjs/comments/1i1rrf4/what\_auth\_should\_i\_use/](https://www.reddit.com/r/nextjs/comments/1i1rrf4/what_auth_should_i_use/)  
16. getting auth.users table data in supabase \- Stack Overflow, acceso: mayo 14, 2025, [https://stackoverflow.com/questions/77751173/getting-auth-users-table-data-in-supabase](https://stackoverflow.com/questions/77751173/getting-auth-users-table-data-in-supabase)  
17. Troubleshooting prisma errors | Supabase Docs, acceso: mayo 14, 2025, [https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting](https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting)  
18. Prisma | Supabase Docs, acceso: mayo 14, 2025, [https://supabase.com/docs/guides/database/prisma](https://supabase.com/docs/guides/database/prisma)  
19. How to use Prisma ORM with Next.js, acceso: mayo 14, 2025, [https://www.prisma.io/docs/guides/nextjs](https://www.prisma.io/docs/guides/nextjs)  
20. Prisma integration with Supabase & Auth \#22091 \- GitHub, acceso: mayo 14, 2025, [https://github.com/prisma/prisma/discussions/22091](https://github.com/prisma/prisma/discussions/22091)  
21. Restricting Access on Auth, Storage, and Realtime Schemas on April 21, 2025 · supabase · Discussion \#34270 \- GitHub, acceso: mayo 14, 2025, [https://github.com/orgs/supabase/discussions/34270](https://github.com/orgs/supabase/discussions/34270)  
22. Running \`prisma migrate dev\` against Supabase with \`multiSchema\` throws error: \`db error: ERROR: cannot drop table auth.users because other objects depend on it\` · Issue \#17734 \- GitHub, acceso: mayo 14, 2025, [https://github.com/prisma/prisma/issues/17734](https://github.com/prisma/prisma/issues/17734)  
23. Security concerns with NextJs, Supabase \+ Prisma \- Reddit, acceso: mayo 14, 2025, [https://www.reddit.com/r/nextjs/comments/1g5cv4j/security\_concerns\_with\_nextjs\_supabase\_prisma/](https://www.reddit.com/r/nextjs/comments/1g5cv4j/security_concerns_with_nextjs_supabase_prisma/)