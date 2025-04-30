# Data Validation with Zod

This directory contains Zod validation schemas for various data structures in the application. Zod provides runtime type checking and validation, ensuring data consistency and type safety throughout the application.

## Files

- `session.ts`: Validation schemas for Session data structures
- `session-form.ts`: Validation schemas for SessionForm data

## Usage

### Basic Validation

```typescript
import { sessionSchema } from '@/lib/validations/session';

// Validate data
try {
  const validatedData = sessionSchema.parse(data);
  // Data is valid, proceed with operations
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    console.error('Validation error:', error.format());
  }
}
```

### Form Validation

```typescript
import { validateSessionForm } from '@/lib/validations/session-form';

// Validate form data
const result = validateSessionForm(formData);
if (result.success) {
  // Form data is valid
  const validatedData = result.data;
} else {
  // Handle validation errors
  const errors = result.errors;
}
```

### Converting Between Types

```typescript
import { formDataToSessionInput } from '@/lib/validations/session-form';
import { prismaSessionToTypescript } from '@/lib/validations/session';

// Convert form data to session input
const sessionInput = formDataToSessionInput(formData);

// Convert Prisma session to TypeScript session
const typescriptSession = prismaSessionToTypescript(prismaSession);
```

## Benefits

1. **Type Safety**: Ensures data conforms to expected types at runtime
2. **Validation**: Provides detailed error messages for invalid data
3. **Conversion**: Facilitates conversion between different data representations
4. **Documentation**: Serves as self-documenting code for data structures

## Best Practices

1. Define schemas in a central location (this directory)
2. Use schema inference for TypeScript types (`z.infer<typeof schema>`)
3. Provide helpful error messages in schema definitions
4. Use utility functions for common validation patterns
5. Validate data as close to the source as possible (API endpoints, form submissions)
