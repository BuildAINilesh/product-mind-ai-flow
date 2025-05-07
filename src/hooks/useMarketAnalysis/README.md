
# Market Analysis Hook

This folder contains the refactored useMarketAnalysis hook broken into smaller, more maintainable files.

## File Structure

- `index.ts` - Main export that composes the hook from its parts
- `types.ts` - Type definitions and constants
- `useFetchAllMarketAnalyses.ts` - Fetches all market analyses for overview listing
- `useFetchRequirementData.ts` - Fetches requirement, analysis, and market data for a specific requirement
- `useAnalysisProgress.ts` - Manages analysis progress state and transitions
- `useGenerateAnalysis.ts` - Handles the market analysis generation process

## Usage

Import the hook the same way as before:

```typescript
import { useMarketAnalysis } from '@/hooks/useMarketAnalysis';
```

The API remains unchanged to maintain compatibility with existing components.
