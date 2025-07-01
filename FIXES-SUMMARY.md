# ClinicalTrials.gov MCP Server - API Fixes Summary

## Overview
This document summarizes the fixes applied to resolve "Invalid request parameters" errors when querying the ClinicalTrials.gov API v2.

## Key Issues Identified and Fixed

### 1. Phase Filtering
**Problem**: The API was rejecting `filter.phase` as an unknown parameter.

**Root Cause**: Phase filtering in the ClinicalTrials.gov API v2 uses ESSIE expression syntax with the `query.term` parameter, not a filter parameter.

**Fix**: Updated `clinicaltrials-api.service.ts` to use ESSIE expression syntax:
```typescript
// Phase filtering is done through query.term with AREA[Phase] syntax
if (params.phase && params.phase.length > 0) {
  const phaseQuery = params.phase
    .map(phase => `AREA[Phase]${phase}`)
    .join(' OR ');
  
  if (queryParams['query.term']) {
    queryParams['query.term'] = `(${queryParams['query.term']}) AND (${phaseQuery})`;
  } else {
    queryParams['query.term'] = phaseQuery;
  }
}
```

### 2. Location Search Format
**Problem**: Raw coordinates were being sent instead of properly formatted location strings.

**Fix**: Updated `query-builder.service.ts` to properly format locations:
- City/State format: `"New York, NY"`
- Distance function: `"distance(40.7128,-74.0060,50mi)"`

### 3. Filter.geo Support
**Enhancement**: Added support for `filter.geo` parameter as an alternative to `query.locn` for distance-based searches.

**Implementation**: The API service now intelligently chooses between:
- `filter.geo` for distance function format
- `query.locn` for city/state/country text format

### 4. Phase Normalization
**Enhancement**: Expanded phase mapping to include:
- Phase 0 → EARLY_PHASE1
- N/A → NA
- Better handling of various phase formats

## Valid API Parameters

### Query Parameters (use ESSIE expression syntax)
- `query.term` - General search including phases
- `query.cond` - Conditions/diseases
- `query.locn` - Location (city, state, country)
- `query.intr` - Interventions
- `query.outc` - Outcomes
- `query.spons` - Sponsors
- `query.lead` - Lead sponsor
- `query.id` - Study IDs

### Filter Parameters (direct filtering)
- `filter.overallStatus` - Study status
- `filter.geo` - Geographic distance function
- `filter.ids` - NCT IDs
- `filter.advanced` - Advanced ESSIE expressions

### Other Parameters
- `pageSize` - Results per page (string)
- `pageToken` - Pagination cursor
- `fields` - Fields to return
- `sort` - Sort order
- `format` - Response format (json/csv)

## Test Results
All API tests are now passing:
- ✓ City/State location searches
- ✓ Distance-based searches with filter.geo
- ✓ Phase filtering with ESSIE expressions
- ✓ Status filtering
- ✓ Pagination with pageToken

## Deployment Notes
1. Ensure all numeric parameters are converted to strings
2. Use ESSIE expression syntax for phase filtering
3. Support both query.locn and filter.geo for location searches
4. Remove any references to unsupported parameters (e.g., query.dist, filter.phase)