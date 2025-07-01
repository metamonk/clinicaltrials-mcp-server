// ClinicalTrials.gov API Types

export interface ClinicalTrialsSearchParams {
  query?: string;
  condition?: string;
  term?: string;
  location?: string;
  distance?: string;
  status?: string[];
  phase?: string[];
  studyType?: string[];
  interventionType?: string[];
  sponsor?: string;
  nctId?: string;
  pageSize?: number;
  pageNumber?: number;
  pageToken?: string;
  fields?: string[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClinicalTrialsSearchResponse {
  studies: Study[];
  totalCount: number;
  nextPageToken?: string;
}

export interface Study {
  protocolSection: ProtocolSection;
  derivedSection?: DerivedSection;
  hasResults?: boolean;
}

export interface ProtocolSection {
  identificationModule: IdentificationModule;
  statusModule: StatusModule;
  sponsorCollaboratorsModule: SponsorCollaboratorsModule;
  descriptionModule?: DescriptionModule;
  conditionsModule?: ConditionsModule;
  designModule?: DesignModule;
  armsInterventionsModule?: ArmsInterventionsModule;
  eligibilityModule?: EligibilityModule;
  contactsLocationsModule?: ContactsLocationsModule;
  outcomesModule?: OutcomesModule;
}

export interface IdentificationModule {
  nctId: string;
  orgStudyIdInfo?: {
    orgStudyId: string;
  };
  organization?: {
    fullName: string;
    class: string;
  };
  briefTitle: string;
  officialTitle?: string;
  acronym?: string;
}

export interface StatusModule {
  statusVerifiedDate?: string;
  overallStatus: string;
  expandedAccessInfo?: {
    hasExpandedAccess: boolean;
  };
  startDateStruct?: {
    date: string;
    type?: string;
  };
  primaryCompletionDateStruct?: {
    date: string;
    type?: string;
  };
  completionDateStruct?: {
    date: string;
    type?: string;
  };
  studyFirstSubmitDate?: string;
  studyFirstSubmitQcDate?: string;
  studyFirstPostDateStruct?: {
    date: string;
    type?: string;
  };
  lastUpdateSubmitDate?: string;
  lastUpdatePostDateStruct?: {
    date: string;
    type?: string;
  };
}

export interface SponsorCollaboratorsModule {
  responsibleParty?: {
    type: string;
    investigatorFullName?: string;
    investigatorTitle?: string;
    investigatorAffiliation?: string;
  };
  leadSponsor: {
    name: string;
    class: string;
  };
  collaborators?: Array<{
    name: string;
    class: string;
  }>;
}

export interface DescriptionModule {
  briefSummary?: string;
  detailedDescription?: string;
}

export interface ConditionsModule {
  conditions?: string[];
  keywords?: string[];
}

export interface DesignModule {
  studyType?: string;
  phases?: string[];
  designInfo?: {
    allocation?: string;
    interventionModel?: string;
    primaryPurpose?: string;
    maskingInfo?: {
      masking?: string;
      whoMasked?: string[];
    };
  };
  enrollmentInfo?: {
    count?: number;
    type?: string;
  };
}

export interface ArmsInterventionsModule {
  armGroups?: Array<{
    label: string;
    type?: string;
    description?: string;
    interventionNames?: string[];
  }>;
  interventions?: Array<{
    type: string;
    name: string;
    description?: string;
    armGroupLabels?: string[];
    otherNames?: string[];
  }>;
}

export interface EligibilityModule {
  eligibilityCriteria?: string;
  healthyVolunteers?: boolean;
  sex?: string;
  minimumAge?: string;
  maximumAge?: string;
  stdAges?: string[];
}

export interface ContactsLocationsModule {
  centralContacts?: Array<{
    name?: string;
    role?: string;
    phone?: string;
    phoneExt?: string;
    email?: string;
  }>;
  overallOfficials?: Array<{
    name?: string;
    affiliation?: string;
    role?: string;
  }>;
  locations?: Array<{
    facility?: string;
    status?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    geoPoint?: {
      lat: number;
      lon: number;
    };
    contacts?: Array<{
      name?: string;
      role?: string;
      phone?: string;
      phoneExt?: string;
      email?: string;
    }>;
  }>;
}

export interface OutcomesModule {
  primaryOutcomes?: Array<{
    measure: string;
    description?: string;
    timeFrame?: string;
  }>;
  secondaryOutcomes?: Array<{
    measure: string;
    description?: string;
    timeFrame?: string;
  }>;
}

export interface DerivedSection {
  miscInfoModule?: {
    versionHolder: string;
  };
  conditionBrowseModule?: {
    meshes?: Array<{
      id: string;
      term: string;
    }>;
    ancestors?: Array<{
      id: string;
      term: string;
    }>;
    browseLeaves?: Array<{
      id: string;
      name: string;
      relevance: string;
    }>;
    browseBranches?: Array<{
      abbrev: string;
      name: string;
    }>;
  };
  interventionBrowseModule?: {
    meshes?: Array<{
      id: string;
      term: string;
    }>;
  };
}

// Error types
export class ClinicalTrialsError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ClinicalTrialsError';
  }
}