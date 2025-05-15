# Alpha Plan: Authentication Component Audit and Refinement

This document outlines the audit and refinement plan for authentication components within the `src/components` directory, focusing on Supabase integration and user experience (UX) enhancements for the Alpha phase.

## 1. Authentication Component Audit

This audit identifies UI components in `src/components` that directly participate in authentication actions or consume authentication state.

### `auth/LogoutButton.tsx`

-   **Function**: Renders a button triggering user logout via a server action.
-   **Current Auth Logic**: Relies on the `signOut` server action (defined in `src/app/auth/actions.ts`).
-   **Existing Supabase Logic**: Indirect. The `signOut` server action in `src/app/auth/actions.ts` uses `supabase.auth.signOut()`. The component is correctly set up to call this server action.

### `auth/ProtectedClientWrapper.tsx`

-   **Function**: Client-side wrapper for protecting content based on Supabase authentication state.
-   **Current Auth Logic**: Directly uses Supabase client SDK: `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange()`.
-   **Existing Supabase Logic**: Already well-integrated with Supabase for client-side auth checks. This is a prime example of correct Supabase usage.

### `ai/ai-assistance-card.tsx` (specifically `FloatingAIAssistantWithProvider` and `AIAssistanceCard`)

-   **Function**: Conditionally renders AI assistant features based on authentication status from an external `useAuth()` hook. Passes `userId` to `ClientStorageProvider`.
-   **Current Auth Logic**: Consumes `user` and `loading` from `useAuth()`.
-   **Existing Supabase Logic**: Dependent on the external `useAuth()` hook being Supabase-aware.

### `ai-assistant/ClientStorageProvider.tsx`

-   **Function**: Initializes a conversation session manager using a `userId` prop.
-   **Current Auth Logic**: Relies on receiving a valid `userId` (Supabase `user.id`) from its parent.
-   **Existing Supabase Logic**: None directly within this component; its Supabase-awareness is through the `userId` prop.

### `ai/conditional-ai-assistant.tsx`

-   **Function**: Conditionally renders `FloatingAIAssistantWithProvider` based on auth status from `useAuth()`.
-   **Current Auth Logic**: Consumes `user` and `loading` from `useAuth()`.
-   **Existing Supabase Logic**: Dependent on the external `useAuth()` hook.

### Other Components Consuming `useAuth()` (Indirect Auth Involvement)

-   `calendar/AppointmentModal.tsx`
-   `calendar/NotificationCenter.tsx`
-   `calendar/PatientSelector.tsx`
-   `layout/simplified-sidebar.tsx`
-   **Auth Logic**: These components use `user.id` or other user data from the external `useAuth()` hook primarily for data fetching or display personalization, not direct auth actions. Their Supabase integration depends on `useAuth()` providing correct Supabase user data.

## 2. Supabase Integration & Refinement Plan for Auth Components

### Prerequisite: A Robust Supabase-aware `useAuth` Hook (External to `src/components`)

All components consuming authentication state will rely on a central `useAuth` hook (assumed to be in `@/hooks/useAuth` or `@/contexts/auth-context`). This hook must be updated/created to:

-   Use `createClient()` from `@/utils/supabase/client` to get the Supabase client.
-   Fetch the initial session using `supabase.auth.getSession()`.
-   Subscribe to auth state changes using `supabase.auth.onAuthStateChange((_event, session) => { ... })`.
-   Expose:
    -   `user: User | null` (Supabase user object)
    -   `session: Session | null` (Supabase session object)
    -   `isLoading: boolean` (for initial session load)
    -   `signOut: () => Promise<void>` (wrapper around server action or direct `supabase.auth.signOut()`)
-   Optionally, wrappers for `signInWithPassword`, `signUp`, etc., if client-side calls are preferred over server actions for specific UI components. However, the `src/app/auth/actions.ts` pattern is already established for forms.

### Component: `auth/LogoutButton.tsx`

-   **File Path**: `auth/LogoutButton.tsx`
-   **Refinement Plan**:
    -   **Server Action Confirmation**: The `signOut` server action in `src/app/auth/actions.ts` is critical. It's already correctly implemented using `supabase.auth.signOut()` and `redirect()`.
        ```typescript
        // From src/app/auth/actions.ts
        export async function signOut() {
          const supabase = await createClient(); // Server client
          const { error } = await supabase.auth.signOut();
          // ... error handling and redirect
          redirect('/auth/login?message=You have been logged out.');
        }
        ```
    -   **Client Component**: `LogoutButton.tsx` uses `<form action={handleSignOut}>` where `handleSignOut` calls `startTransition(async () => { await signOut(); })`. This is well-suited for the server action.
    -   No changes required within `LogoutButton.tsx` for Supabase integration, as it defers auth logic to the server action.
-   **UX Contribution**:
    -   The `useTransition` hook provides `isPending` for immediate UI feedback (e.g., "Logging out...").
    -   Server-side redirect ensures a clean transition to the login page.
-   **Alpha UX**: Ensure `disabled={isPending}` and text change (e.g., "Cerrando Sesión...") are visually clear.

### Component: `auth/ProtectedClientWrapper.tsx`

-   **File Path**: `auth/ProtectedClientWrapper.tsx`
-   **Refinement Plan**:
    -   **Leverage Existing Supabase Logic**: This component correctly uses `createClient()` (from `@/utils/supabase/client`), `supabase.auth.getSession()`, and `supabase.auth.onAuthStateChange()`. This is a solid, Supabase-native implementation.
    -   **Loading Fallback UX**: For Alpha, enhance `loadingFallback`. Instead of `<p>Loading user session...</p>`, use a more integrated UI element like a full-screen subtle spinner or a skeleton matching the app's shell. This can be achieved by rendering `<AppLayout hideNavbar={true}><YourSpinnerComponent /></AppLayout>` or similar.
    -   **Unauthenticated Fallback UX**: The current redirect logic is fine. Ensure the `message` query parameter on the `/auth/login` page is displayed prominently (as seen in `src/app/auth/login/page.tsx`).
    -   **Error Handling**: The current version redirects on sign-out. Consider if errors during `getSession` or `onAuthStateChange` subscription need specific UI handling within the wrapper. For Alpha, the current redirect-on-error/no-session is acceptable.
-   **UX Contribution**:
    -   Provides effective client-side protection, preventing flashes of unauthorized content.
    -   Polished loading states will improve perceived performance and professionalism.

### Components Consuming Auth State (via `useAuth` hook)

(e.g., `ai/ai-assistance-card.tsx`, `ai-assistant/ClientStorageProvider.tsx`, `ai/conditional-ai-assistant.tsx`, `calendar/AppointmentModal.tsx`, `layout/simplified-sidebar.tsx`)

-   **Refinement Plan**:
    -   **Adapt to Supabase User Object**: Ensure components correctly consume the Supabase `User` object provided by the (to-be-refactored) `useAuth` hook.
        -   `user.id` remains standard for user identification.
        -   User's full name: Access `user.user_metadata.full_name`. Fallback to `user.email` if `full_name` is not set.
            ```typescript
            // Example in ai/ai-assistance-card.tsx:
            // Change from:
            // const fullName = session?.user_metadata?.full_name || session?.email || '';
            // To (assuming useAuth provides Supabase user):
            const { user } = useAuth();
            const fullName = user?.user_metadata?.full_name || user?.email || '';
            ```
        -   User's email: `user.email`.
        -   User roles: Access `user.app_metadata.role` or `user.user_metadata.role`. This needs consistency with your Supabase setup. The `useAuth` hook should abstract the source.
    -   **Loading States**: Continue using `isLoading` from `useAuth` to show skeletons (`ui/skeleton.tsx`) or loading messages.
    -   **API Interactions**: Components like `calendar/PatientSelector.tsx` fetching data (e.g., `/api/patients?userId=\${user.id}`) will now naturally pass the Supabase `user.id`. API routes in `src/app/api/` already use `withAuth` or `getAuthenticatedUser`, correctly handling Supabase sessions on the backend.
-   **UX Contribution**:
    -   Correct and personalized display of user information.
    -   Smooth loading and transitions.
    -   Secure conditional rendering.

## 3. New Reusable Auth Components (For `src/components/auth/`)

Pages in `src/app/auth` (e.g., `login/page.tsx`, `signup/page.tsx`) currently use basic HTML inputs or generic `ui/input.tsx`. To improve consistency, maintainability, and UX for Alpha, create the following reusable auth-specific UI components within `src/components/auth/`:

### Component: `src/components/auth/AuthForm.tsx`

-   **Purpose**: A wrapper for authentication forms (Login, Signup, Password Reset, etc.).
-   **Key Functionalities**:
    -   Accepts `children` (form fields and submit button).
    -   Handles form submission state (`isPending` from `useTransition`).
    -   Displays global form error messages and success messages passed as props.
    -   Provides consistent styling and layout.
    -   Takes an `onSubmit` prop (likely a server action).
-   **Example Usage (Conceptual in `login/page.tsx`)**:
    ```tsx
    // In src/app/auth/login/page.tsx
    import AuthForm from '@/components/auth/AuthForm'; // New component
    import { EmailField, PasswordField } from '@/components/auth/AuthFields'; // New components
    // ...
    <AuthForm
      title="Log In"
      description="Enter your credentials"
      onSubmitAction={login} // Server action
      submitButtonText="Log In"
      errorMessage={errorMessageFromServerAction}
      successMessage={messageFromServerAction}
      isPending={isPending}
    >
      <EmailField name="email" required disabled={isPending} />
      <PasswordField name="password" required disabled={isPending} />
    </AuthForm>
    ```
-   **UX Contribution**: Consistent look and feel, centralized error/success message display, clear loading states.

### Component: `src/components/auth/AuthFields.tsx`

-   **Purpose**: Specialized, reusable input field components for common auth fields.
-   **Key Components & Functionalities**:
    -   `EmailField.tsx`: Renders `<Label>` and `<Input type="email" name="email" ... />`. Could include an email icon.
    -   `PasswordField.tsx`: Renders `<Label>` and `<Input type="password" name="password" ... />`. Could include a password visibility toggle.
    -   `FullNameField.tsx` (for signup): Renders `<Label>` and `<Input type="text" name="fullName" ... />`.
-   **UX Contribution**: Consistent styling, reduces boilerplate, allows easy global addition of field-specific features.

### Component: `src/components/auth/AuthPageLayout.tsx`

-   **Purpose**: Consistent centered layout for all authentication pages.
-   **Key Functionalities**:
    -   Centers children vertically and horizontally.
    -   Applies consistent padding and max-width.
    -   Could include a slot for an application logo.
-   **Implementation**:
    ```tsx
    // src/components/auth/AuthPageLayout.tsx
    import React from 'react';

    interface AuthPageLayoutProps {
      children: React.ReactNode;
    }

    export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-gray-50">
          {/* Optional: Logo/Branding */}
          {/* <div className="mb-8"> <AppLogo /> </div> */}
          <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-6 shadow-md">
            {children}
          </div>
        </div>
      );
    }
    ```
-   **Usage Example (`src/app/auth/login/page.tsx`)**:
    ```tsx
    import AuthPageLayout from '@/components/auth/AuthPageLayout';
    // ...
    export default function LoginPage() {
      return (
        <AuthPageLayout>
          {/* Current content of LoginPage (title, form, links) */}
        </AuthPageLayout>
      );
    }
    ```
-   **UX Contribution**: Professional, consistent, and focused presentation for auth pages.

### Component: `src/components/auth/AuthMessage.tsx`

-   **Purpose**: Standardized component for success or error messages on auth pages.
-   **Key Functionalities**:
    -   Accepts `type ('success' | 'error' | 'info')` and `message` props.
    -   Renders with appropriate styling (colors, icons) based on type.
-   **Implementation**:
    ```tsx
    // src/components/auth/AuthMessage.tsx
    import React from 'react';
    import { AlertCircle, CheckCircle, InfoIcon } from 'lucide-react'; // Example icons

    interface AuthMessageProps {
      type: 'success' | 'error' | 'info';
      message: string;
    }

    export default function AuthMessage({ type, message }: AuthMessageProps) {
      const baseClasses = "rounded-md p-4 text-sm";
      let typeClasses = "";
      let IconComponent = InfoIcon; // Renamed to avoid conflict

      if (type === 'success') {
        typeClasses = "bg-green-50 text-green-700";
        IconComponent = CheckCircle;
      } else if (type === 'error') {
        typeClasses = "bg-red-50 text-red-700";
        IconComponent = AlertCircle;
      } else { // info
        typeClasses = "bg-blue-50 text-blue-700";
        // IconComponent remains InfoIcon
      }

      if (!message) return null;

      return (
        <div className={`\${baseClasses} \${typeClasses} flex items-start`}>
          <IconComponent className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{message}</p>
        </div>
      );
    }
    ```
-   **Usage Example (`src/app/auth/login/page.tsx`)**:
    ```tsx
    import AuthMessage from '@/components/auth/AuthMessage';
    // ...
    {message && <AuthMessage type="info" message={message} />}
    {errorMessage && <AuthMessage type="error" message={errorMessage} />}
    ```
-   **UX Contribution**: Standardized, accessible, and visually distinct feedback messages.

## 4. Component Data Synchronization with Supabase

-   **User Data Source**: Supabase `User` object, via the (refactored) central `useAuth` hook.
-   **Key User Fields to Utilize**:
    -   `user.id`: For `userId` props, API calls.
    -   `user.email`: For display, fallback for name.
    -   `user.user_metadata.full_name`: Preferred for displaying user names.
        -   The `signUp` action in `src/app/auth/actions.ts` already correctly sets `full_name` in `user_metadata`:
            ```typescript
            // From src/app/auth/actions.ts
            supabase.auth.signUp({
              // ...
              options: {
                // ...
                data: {
                  full_name: fullName, // This populates user_metadata.full_name
                }
              },
            });
            ```
    -   `user.app_metadata.role` or `user.user_metadata.role`: For role-based UI rendering. `useAuth` hook should abstract the source.
-   **Real-time Updates**: `supabase.auth.onAuthStateChange` in `useAuth` ensures components re-render with updated user information.

## 5. User Experience (UX) Enhancements for Alpha

### Loading States:

-   **`auth/LogoutButton.tsx`**: `isPending` from `useTransition` should clearly disable the button and show "Logging out..." text.
-   **`auth/ProtectedClientWrapper.tsx`**: Replace basic text loading fallback with a skeleton UI or themed spinner.
-   **`src/app/auth` pages**: `isPending` from `useTransition` (when calling server actions) is implemented. Ensure "Logging In..." / "Signing Up..." button text provides good feedback.

### Error and Success Messages:

-   The `AuthMessage` component will standardize feedback. Ensure messages from server actions are clear, user-friendly, and actionable.
-   `login/page.tsx` already sets `errorMessage`. Pass this to `<AuthMessage type="error" ... />`.

### Form Input UX (via new `AuthFields.tsx`):

-   Clear focus states (handled by `ui/input.tsx`).
-   Consider adding icons within input fields (email, lock).
-   For password fields, a visibility toggle is a helpful UX feature (part of `PasswordField`).

### Navigation Links:

-   Links like "Sign Up" on `login/page.tsx` and "Log In" on `signup/page.tsx` are clear and use `next/link`. Ensure they are visually distinct.

### Password Reset & Update Flow:

-   **`reset-password/page.tsx`**: Success message "Check your email..." is good.
-   **`update-password/page.tsx`**: Success message "Password updated successfully" followed by redirect to login is good. Ensure redirect delay isn't too long, or provide a "Go to Login" button.

### Email Confirmation:

-   **`confirm/route.ts`**: Redirects to `/dashboard` (success) or `/auth/error` (failure). Good server-side flow. `/auth/error` page should clearly explain the issue.

### Accessibility:

-   All new proposed components (`AuthForm`, `AuthFields`, `AuthPageLayout`, `AuthMessage`) must be designed with accessibility in mind (ARIA attributes, keyboard navigability, semantic HTML).
-   Existing `ui/` components generally have good accessibility foundations.

By implementing this plan, UI components in `src/components` will be well-integrated with the Supabase backend. Introducing new reusable auth UI components will make auth pages more maintainable and offer a more consistent, polished user experience for the Alpha phase.