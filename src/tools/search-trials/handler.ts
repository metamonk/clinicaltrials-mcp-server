import { SearchTrialsOutput } from './schema';
import { clinicalTrialsAPI } from '../../services/clinicaltrials-api.service';
import { QueryBuilderService } from '../../services/query-builder.service';
import { ClinicalTrialsError } from '../../types/clinicaltrials.types';

/**
 * Calculate distance between two geographic points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Handler for the search_trials MCP tool
 */
export async function searchTrialsHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: any
): Promise<SearchTrialsOutput> {
  const startTime = Date.now();

  try {
    console.log('Search trials handler called with input:', {
      conditions: input.conditions,
      location: input.location,
      biomarkers: input.biomarkers,
      phases: input.phases
    });

    // Build search parameters using QueryBuilderService
    const searchParams = QueryBuilderService.buildSearchParams({
      conditions: input.conditions,
      keywords: input.keywords,
      location: input.location,
      age: input.age,
      sex: input.sex,
      biomarkers: input.biomarkers,
      interventions: input.interventions,
      phases: input.phases,
      recruitingOnly: input.recruitingOnly,
      expandedAccessOnly: input.expandedAccessOnly,
      sponsorTypes: input.sponsorTypes,
      specificSponsors: input.specificSponsors
    });

    // Override with direct parameters if provided
    if (input.query) {
      searchParams.query = input.query;
    }
    if (input.pageSize) {
      searchParams.pageSize = input.pageSize;
    }
    if (input.pageNumber) {
      searchParams.pageNumber = input.pageNumber;
    }
    if (input.fields) {
      searchParams.fields = input.fields;
    }
    if (input.sortField) {
      searchParams.sortField = input.sortField;
      searchParams.sortOrder = input.sortOrder;
    }

    // Execute search
    const searchResponse = await clinicalTrialsAPI.searchStudies(searchParams);

    // Transform results
    const trials = searchResponse.studies.map(study => {
      const protocol = study.protocolSection;
      const identification = protocol.identificationModule;
      const status = protocol.statusModule;
      const sponsor = protocol.sponsorCollaboratorsModule;
      const description = protocol.descriptionModule;
      const conditions = protocol.conditionsModule;
      const design = protocol.designModule;
      const arms = protocol.armsInterventionsModule;
      const eligibility = protocol.eligibilityModule;
      const contacts = protocol.contactsLocationsModule;

      // Process locations and calculate distances
      const locations = contacts?.locations?.map(location => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = {
          facility: location.facility,
          city: location.city,
          state: location.state,
          zip: location.zip,
          country: location.country,
          status: location.status
        };

        // Calculate distance if we have coordinates
        if (
          input.location?.latitude &&
          input.location?.longitude &&
          location.geoPoint
        ) {
          result.distance = calculateDistance(
            input.location.latitude,
            input.location.longitude,
            location.geoPoint.lat,
            location.geoPoint.lon
          );
        }

        // Add contact info if available
        if (location.contacts && location.contacts.length > 0) {
          const primaryContact = location.contacts[0];
          result.contact = {
            name: primaryContact.name,
            phone: primaryContact.phone,
            email: primaryContact.email
          };
        }

        return result;
      }) || [];

      // Sort locations by distance if applicable
      if (input.location?.latitude && input.location?.longitude) {
        locations.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
      }

      return {
        // Basic information
        nctId: identification.nctId,
        title: identification.briefTitle,
        officialTitle: identification.officialTitle,
        status: status.overallStatus,

        // Study details
        phase: design?.phases,
        studyType: design?.studyType,
        conditions: conditions?.conditions || [],

        // Interventions
        interventions: arms?.interventions?.map(intervention => ({
          type: intervention.type,
          name: intervention.name,
          description: intervention.description
        })),

        // Description
        briefSummary: description?.briefSummary,
        detailedDescription: description?.detailedDescription,

        // Eligibility
        eligibility: eligibility ? {
          criteria: eligibility.eligibilityCriteria,
          healthyVolunteers: eligibility.healthyVolunteers,
          sex: eligibility.sex,
          minimumAge: eligibility.minimumAge,
          maximumAge: eligibility.maximumAge,
          stdAges: eligibility.stdAges
        } : undefined,

        // Enrollment
        enrollment: design?.enrollmentInfo ? {
          count: design.enrollmentInfo.count,
          type: design.enrollmentInfo.type
        } : undefined,

        // Sponsor
        sponsor: {
          name: sponsor.leadSponsor.name,
          class: sponsor.leadSponsor.class
        },
        collaborators: sponsor.collaborators?.map(collab => ({
          name: collab.name,
          class: collab.class
        })),

        // Locations
        locations,

        // Dates
        startDate: status.startDateStruct?.date,
        primaryCompletionDate: status.primaryCompletionDateStruct?.date,
        completionDate: status.completionDateStruct?.date,
        lastUpdateDate: status.lastUpdatePostDateStruct?.date,

        // URLs
        urls: {
          clinicalTrialsGov: `https://clinicaltrials.gov/study/${identification.nctId}`
        }
      };
    });

    const executionTime = Date.now() - startTime;

    // Generate warnings
    const warnings: string[] = [];
    if (searchResponse.totalCount === 0) {
      warnings.push('No trials found matching your criteria. Consider broadening your search.');
    } else if (searchResponse.totalCount < 5) {
      warnings.push('Limited trials found. Consider removing some filters or expanding search radius.');
    }

    return {
      success: true,
      totalCount: searchResponse.totalCount,
      pageNumber: input.pageNumber || 1,
      pageSize: input.pageSize || 20,
      trials,
      searchMetadata: {
        executionTime,
        query: searchParams,
        warnings
      }
    };

  } catch (error) {
    console.error('Search trials handler error:', error);

    const executionTime = Date.now() - startTime;

    if (error instanceof ClinicalTrialsError) {
      return {
        success: false,
        totalCount: 0,
        pageNumber: input.pageNumber || 1,
        pageSize: input.pageSize || 20,
        trials: [],
        error: error.message,
        errorCode: error.code,
        searchMetadata: {
          executionTime,
          warnings: [`Search failed: ${error.message}`]
        }
      };
    }

    return {
      success: false,
      totalCount: 0,
      pageNumber: input.pageNumber || 1,
      pageSize: input.pageSize || 20,
      trials: [],
      error: 'An unexpected error occurred',
      errorCode: 'UNKNOWN_ERROR',
      searchMetadata: {
        executionTime,
        warnings: ['An unexpected error occurred during search']
      }
    };
  }
}