import { z } from 'zod';

// Input schema for the get_study_details tool
export const getStudyDetailsInputSchema = z.object({
  nctId: z.string()
    .regex(/^NCT\d{8}$/i, 'NCT ID must be in format NCT12345678')
    .describe('ClinicalTrials.gov identifier (e.g., NCT12345678)'),
  
  fields: z.array(z.string()).optional()
    .describe('Specific fields to include in the response. If not specified, all available fields will be returned.'),
  
  includeEligibilityParsed: z.boolean().optional().default(false)
    .describe('Whether to include parsed eligibility criteria (experimental feature)')
});

// Output schema for study details
export const getStudyDetailsOutputSchema = z.object({
  success: z.boolean(),
  
  study: z.object({
    // Identification
    nctId: z.string(),
    title: z.string(),
    officialTitle: z.string().optional(),
    acronym: z.string().optional(),
    
    // Organization
    organization: z.object({
      fullName: z.string().optional(),
      class: z.string().optional()
    }).optional(),
    
    // Status
    status: z.object({
      overallStatus: z.string(),
      statusVerifiedDate: z.string().optional(),
      hasExpandedAccess: z.boolean().optional(),
      startDate: z.string().optional(),
      primaryCompletionDate: z.string().optional(),
      completionDate: z.string().optional(),
      studyFirstPostDate: z.string().optional(),
      lastUpdatePostDate: z.string().optional()
    }),
    
    // Sponsor information
    sponsor: z.object({
      leadSponsor: z.object({
        name: z.string(),
        class: z.string()
      }),
      collaborators: z.array(z.object({
        name: z.string(),
        class: z.string()
      })).optional(),
      responsibleParty: z.object({
        type: z.string(),
        investigatorFullName: z.string().optional(),
        investigatorTitle: z.string().optional(),
        investigatorAffiliation: z.string().optional()
      }).optional()
    }),
    
    // Description
    description: z.object({
      briefSummary: z.string().optional(),
      detailedDescription: z.string().optional()
    }).optional(),
    
    // Conditions and keywords
    conditions: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    
    // Design
    design: z.object({
      studyType: z.string().optional(),
      phases: z.array(z.string()).optional(),
      allocation: z.string().optional(),
      interventionModel: z.string().optional(),
      primaryPurpose: z.string().optional(),
      masking: z.object({
        masking: z.string().optional(),
        whoMasked: z.array(z.string()).optional()
      }).optional(),
      enrollment: z.object({
        count: z.number().optional(),
        type: z.string().optional()
      }).optional()
    }).optional(),
    
    // Arms and interventions
    arms: z.array(z.object({
      label: z.string(),
      type: z.string().optional(),
      description: z.string().optional(),
      interventionNames: z.array(z.string()).optional()
    })).optional(),
    
    interventions: z.array(z.object({
      type: z.string(),
      name: z.string(),
      description: z.string().optional(),
      armGroupLabels: z.array(z.string()).optional(),
      otherNames: z.array(z.string()).optional()
    })).optional(),
    
    // Eligibility
    eligibility: z.object({
      criteria: z.string().optional(),
      healthyVolunteers: z.boolean().optional(),
      sex: z.string().optional(),
      minimumAge: z.string().optional(),
      maximumAge: z.string().optional(),
      stdAges: z.array(z.string()).optional(),
      
      // Parsed criteria (if requested)
      parsedCriteria: z.object({
        inclusion: z.array(z.string()).optional(),
        exclusion: z.array(z.string()).optional()
      }).optional()
    }).optional(),
    
    // Outcomes
    outcomes: z.object({
      primary: z.array(z.object({
        measure: z.string(),
        description: z.string().optional(),
        timeFrame: z.string().optional()
      })).optional(),
      secondary: z.array(z.object({
        measure: z.string(),
        description: z.string().optional(),
        timeFrame: z.string().optional()
      })).optional()
    }).optional(),
    
    // Locations
    locations: z.array(z.object({
      facility: z.string().optional(),
      status: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number()
      }).optional(),
      contacts: z.array(z.object({
        name: z.string().optional(),
        role: z.string().optional(),
        phone: z.string().optional(),
        phoneExt: z.string().optional(),
        email: z.string().optional()
      })).optional()
    })).optional(),
    
    // Central contacts
    centralContacts: z.array(z.object({
      name: z.string().optional(),
      role: z.string().optional(),
      phone: z.string().optional(),
      phoneExt: z.string().optional(),
      email: z.string().optional()
    })).optional(),
    
    // Overall officials
    overallOfficials: z.array(z.object({
      name: z.string().optional(),
      affiliation: z.string().optional(),
      role: z.string().optional()
    })).optional(),
    
    // URLs
    urls: z.object({
      clinicalTrialsGov: z.string(),
      protocolUrl: z.string().optional(),
      resultsUrl: z.string().optional()
    }),
    
    // Additional metadata
    hasResults: z.boolean().optional(),
    lastUpdateSubmitDate: z.string().optional()
  }).optional(),
  
  // Error information (if applicable)
  error: z.string().optional(),
  errorCode: z.string().optional()
});

// Type exports
export type GetStudyDetailsInput = z.infer<typeof getStudyDetailsInputSchema>;
export type GetStudyDetailsOutput = z.infer<typeof getStudyDetailsOutputSchema>;