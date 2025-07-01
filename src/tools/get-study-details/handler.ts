import { GetStudyDetailsOutput } from './schema';
import { clinicalTrialsAPI } from '../../services/clinicaltrials-api.service';
import { ClinicalTrialsError } from '../../types/clinicaltrials.types';

/**
 * Parse eligibility criteria into inclusion and exclusion lists
 * This is a simple implementation - could be enhanced with NLP
 */
function parseEligibilityCriteria(criteria: string): {
  inclusion: string[];
  exclusion: string[];
} {
  const lines = criteria.split('\n').map(line => line.trim()).filter(Boolean);
  const result = {
    inclusion: [] as string[],
    exclusion: [] as string[]
  };

  let currentSection: 'inclusion' | 'exclusion' | null = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Detect section headers
    if (lowerLine.includes('inclusion criteria') || lowerLine.includes('eligibility criteria')) {
      currentSection = 'inclusion';
      continue;
    } else if (lowerLine.includes('exclusion criteria')) {
      currentSection = 'exclusion';
      continue;
    }

    // Skip empty lines and headers
    if (line.length < 3 || line.endsWith(':')) {
      continue;
    }

    // Add to appropriate section
    if (currentSection === 'inclusion') {
      result.inclusion.push(line);
    } else if (currentSection === 'exclusion') {
      result.exclusion.push(line);
    } else {
      // Default to inclusion if no section identified
      result.inclusion.push(line);
    }
  }

  return result;
}

/**
 * Handler for the get_study_details MCP tool
 */
export async function getStudyDetailsHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: any
): Promise<GetStudyDetailsOutput> {
  try {
    console.log('Get study details handler called for:', input.nctId);

    // Fetch study details
    const study = await clinicalTrialsAPI.getStudyDetails(
      input.nctId.toUpperCase(),
      input.fields
    );

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
    const outcomes = protocol.outcomesModule;

    // Build eligibility object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eligibilityData: any = eligibility ? {
      criteria: eligibility.eligibilityCriteria,
      healthyVolunteers: eligibility.healthyVolunteers,
      sex: eligibility.sex,
      minimumAge: eligibility.minimumAge,
      maximumAge: eligibility.maximumAge,
      stdAges: eligibility.stdAges
    } : undefined;

    // Parse eligibility criteria if requested
    if (input.includeEligibilityParsed && eligibility?.eligibilityCriteria) {
      eligibilityData.parsedCriteria = parseEligibilityCriteria(
        eligibility.eligibilityCriteria
      );
    }

    // Process locations
    const locations = contacts?.locations?.map(location => ({
      facility: location.facility,
      status: location.status,
      city: location.city,
      state: location.state,
      zip: location.zip,
      country: location.country,
      coordinates: location.geoPoint ? {
        latitude: location.geoPoint.lat,
        longitude: location.geoPoint.lon
      } : undefined,
      contacts: location.contacts?.map(contact => ({
        name: contact.name,
        role: contact.role,
        phone: contact.phone,
        phoneExt: contact.phoneExt,
        email: contact.email
      }))
    }));

    return {
      success: true,
      study: {
        // Identification
        nctId: identification.nctId,
        title: identification.briefTitle,
        officialTitle: identification.officialTitle,
        acronym: identification.acronym,

        // Organization
        organization: identification.organization ? {
          fullName: identification.organization.fullName,
          class: identification.organization.class
        } : undefined,

        // Status
        status: {
          overallStatus: status.overallStatus,
          statusVerifiedDate: status.statusVerifiedDate,
          hasExpandedAccess: status.expandedAccessInfo?.hasExpandedAccess,
          startDate: status.startDateStruct?.date,
          primaryCompletionDate: status.primaryCompletionDateStruct?.date,
          completionDate: status.completionDateStruct?.date,
          studyFirstPostDate: status.studyFirstPostDateStruct?.date,
          lastUpdatePostDate: status.lastUpdatePostDateStruct?.date
        },

        // Sponsor
        sponsor: {
          leadSponsor: {
            name: sponsor.leadSponsor.name,
            class: sponsor.leadSponsor.class
          },
          collaborators: sponsor.collaborators?.map(collab => ({
            name: collab.name,
            class: collab.class
          })),
          responsibleParty: sponsor.responsibleParty ? {
            type: sponsor.responsibleParty.type,
            investigatorFullName: sponsor.responsibleParty.investigatorFullName,
            investigatorTitle: sponsor.responsibleParty.investigatorTitle,
            investigatorAffiliation: sponsor.responsibleParty.investigatorAffiliation
          } : undefined
        },

        // Description
        description: description ? {
          briefSummary: description.briefSummary,
          detailedDescription: description.detailedDescription
        } : undefined,

        // Conditions
        conditions: conditions?.conditions,
        keywords: conditions?.keywords,

        // Design
        design: design ? {
          studyType: design.studyType,
          phases: design.phases,
          allocation: design.designInfo?.allocation,
          interventionModel: design.designInfo?.interventionModel,
          primaryPurpose: design.designInfo?.primaryPurpose,
          masking: design.designInfo?.maskingInfo ? {
            masking: design.designInfo.maskingInfo.masking,
            whoMasked: design.designInfo.maskingInfo.whoMasked
          } : undefined,
          enrollment: design.enrollmentInfo ? {
            count: design.enrollmentInfo.count,
            type: design.enrollmentInfo.type
          } : undefined
        } : undefined,

        // Arms and interventions
        arms: arms?.armGroups?.map(arm => ({
          label: arm.label,
          type: arm.type,
          description: arm.description,
          interventionNames: arm.interventionNames
        })),

        interventions: arms?.interventions?.map(intervention => ({
          type: intervention.type,
          name: intervention.name,
          description: intervention.description,
          armGroupLabels: intervention.armGroupLabels,
          otherNames: intervention.otherNames
        })),

        // Eligibility
        eligibility: eligibilityData,

        // Outcomes
        outcomes: outcomes ? {
          primary: outcomes.primaryOutcomes?.map(outcome => ({
            measure: outcome.measure,
            description: outcome.description,
            timeFrame: outcome.timeFrame
          })),
          secondary: outcomes.secondaryOutcomes?.map(outcome => ({
            measure: outcome.measure,
            description: outcome.description,
            timeFrame: outcome.timeFrame
          }))
        } : undefined,

        // Locations
        locations,

        // Central contacts
        centralContacts: contacts?.centralContacts?.map(contact => ({
          name: contact.name,
          role: contact.role,
          phone: contact.phone,
          phoneExt: contact.phoneExt,
          email: contact.email
        })),

        // Overall officials
        overallOfficials: contacts?.overallOfficials?.map(official => ({
          name: official.name,
          affiliation: official.affiliation,
          role: official.role
        })),

        // URLs
        urls: {
          clinicalTrialsGov: `https://clinicaltrials.gov/study/${identification.nctId}`,
          resultsUrl: study.hasResults ? 
            `https://clinicaltrials.gov/study/${identification.nctId}?tab=results` : 
            undefined
        },

        // Additional metadata
        hasResults: study.hasResults,
        lastUpdateSubmitDate: status.lastUpdateSubmitDate
      }
    };

  } catch (error) {
    console.error('Get study details handler error:', error);

    if (error instanceof ClinicalTrialsError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
      errorCode: 'UNKNOWN_ERROR'
    };
  }
}