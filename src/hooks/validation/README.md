
# Validation Hooks

This directory contains hooks related to the validation functionality of the application. The code has been split into smaller, more focused files to improve maintainability.

## Structure

- `index.ts`: Main validation hook that combines functionality from other hooks
- `types.ts`: TypeScript interfaces and types used throughout the validation hooks
- `useFetchValidations.ts`: Hook for fetching all validations
- `useFetchRequirement.ts`: Hook for fetching a specific requirement by ID
- `useFetchAnalysisData.ts`: Hook for fetching requirement analysis and validation data
- `useValidationProcess.ts`: Hook for handling the validation process

## Usage

Import the main hook from this directory:

```typescript
import { useValidation } from "@/hooks/validation";
```

This provides the same API as the previous monolithic hook but with a more maintainable code structure.
