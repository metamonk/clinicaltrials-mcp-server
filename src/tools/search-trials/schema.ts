import { z } from 'zod';

// Input schema for the search_trials tool
export const searchTrialsInputSchema = z.object({
  // Basic search parameters
  query: z.string().optional().describe('General search query terms'),
  
  conditions: z.array(z.string()).optional()
    .describe('Medical conditions to search for (e.g., ["breast cancer", "lung cancer"])'),
  
  keywords: z.array(z.string()).optional()
    .describe('Additional keywords to include in search'),
  
  // Location parameters
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    distance: z.number().optional().describe('Search radius in miles')
  }).optional().describe('Location for proximity-based search'),
  
  // Demographics
  age: z.number().optional().describe('Patient age for eligibility filtering'),
  sex: z.enum(['male', 'female', 'all']).optional().describe('Biological sex requirement'),
  
  // Medical criteria
  biomarkers: z.array(z.object({
    name: z.string().describe('Biomarker name (e.g., HER2, EGFR, PD-L1)'),
    status: z.string().optional().describe('Biomarker status (e.g., positive, negative, mutated)')
  })).optional().describe('Genetic biomarkers for targeted therapy trials'),
  
  interventions: z.array(z.string()).optional()
    .describe('Specific interventions or treatments of interest'),
  
  phases: z.array(z.string()).optional()
    .describe('Clinical trial phases (e.g., ["1", "2", "3"])'),
  
  // Filter options
  recruitingOnly: z.boolean().optional().default(true)
    .describe('Only show trials currently recruiting participants'),
  
  expandedAccessOnly: z.boolean().optional().default(false)
    .describe('Only show expanded access trials'),
  
  // Sponsor filters
  sponsorTypes: z.array(z.enum(['industry', 'nih', 'academic', 'other'])).optional()
    .describe('Types of trial sponsors to include'),
  
  specificSponsors: z.array(z.string()).optional()
    .describe('Specific sponsor organizations to search for'),
  
  // Pagination
  pageSize: z.number().min(1).max(100).optional().default(20)
    .describe('Number of results per page'),
  
  pageNumber: z.number().optional().default(1)
    .describe('Page number for pagination'),
  
  // Field selection
  fields: z.array(z.string()).optional()
    .describe('Specific fields to include in results'),
  
  // Sorting
  sortField: z.string().optional()
    .describe('Field to sort results by'),
  
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
    .describe('Sort order')
});

// Output schema for search results
export const searchTrialsOutputSchema = z.object({
  success: z.boolean(),
  totalCount: z.number().describe('Total number of matching trials'),
  pageNumber: z.number(),
  pageSize: z.number(),
  trials: z.array(z.object({
    // Basic information
    nctId: z.string().describe('ClinicalTrials.gov identifier'),
    title: z.string().describe('Brief title of the trial'),
    officialTitle: z.string().optional(),
    status: z.string().describe('Current recruitment status'),
    
    // Study details
    phase: z.array(z.string()).optional().describe('Clinical trial phases'),
    studyType: z.string().optional(),
    conditions: z.array(z.string()).describe('Conditions being studied'),
    
    // Interventions
    interventions: z.array(z.object({
      type: z.string(),
      name: z.string(),
      description: z.string().optional()
    })).optional(),
    
    // Description
    briefSummary: z.string().optional(),
    detailedDescription: z.string().optional(),
    
    // Eligibility
    eligibility: z.object({
      criteria: z.string().optional(),
      healthyVolunteers: z.boolean().optional(),
      sex: z.string().optional(),
      minimumAge: z.string().optional(),
      maximumAge: z.string().optional(),
      stdAges: z.array(z.string()).optional()
    }).optional(),
    
    // Enrollment
    enrollment: z.object({
      count: z.number().optional(),
      type: z.string().optional()
    }).optional(),
    
    // Sponsor
    sponsor: z.object({
      name: z.string(),
      class: z.string()
    }),
    collaborators: z.array(z.object({
      name: z.string(),
      class: z.string()
    })).optional(),
    
    // Locations
    locations: z.array(z.object({
      facility: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
      status: z.string().optional(),
      distance: z.number().optional().describe('Distance from search location in miles'),
      contact: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional()
      }).optional()
    })).optional(),
    
    // Dates
    startDate: z.string().optional(),
    primaryCompletionDate: z.string().optional(),
    completionDate: z.string().optional(),
    lastUpdateDate: z.string().optional(),
    
    // URLs
    urls: z.object({
      clinicalTrialsGov: z.string(),
      contactUrl: z.string().optional()
    }).optional()
  })),
  
  // Metadata
  searchMetadata: z.object({
    executionTime: z.number().describe('Search execution time in milliseconds'),
    query: z.record(z.any()).optional(),
    warnings: z.array(z.string()).optional()
  }).optional(),
  
  // Pagination metadata
  pagination: z.object({
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
    totalPages: z.number(),
    nextPageNumber: z.number().optional(),
    previousPageNumber: z.number().optional()
  }).optional(),
  
  // Error information (if applicable)
  error: z.string().optional(),
  errorCode: z.string().optional()
});

// Type exports
export type SearchTrialsInput = z.infer<typeof searchTrialsInputSchema>;
export type SearchTrialsOutput = z.infer<typeof searchTrialsOutputSchema>;