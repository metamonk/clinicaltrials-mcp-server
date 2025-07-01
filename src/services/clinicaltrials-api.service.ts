import axios, { AxiosInstance } from 'axios';
import {
  ClinicalTrialsSearchParams,
  ClinicalTrialsSearchResponse,
  Study,
  ClinicalTrialsError
} from '../types/clinicaltrials.types';

export class ClinicalTrialsAPIService {
  private readonly apiClient: AxiosInstance;
  private readonly baseUrl = 'https://clinicaltrials.gov/api/v2';
  private readonly defaultFields = [
    'NCTId',
    'BriefTitle',
    'OfficialTitle',
    'OverallStatus',
    'Phase',
    'StudyType',
    'Condition',
    'InterventionType',
    'InterventionName',
    'BriefSummary',
    'DetailedDescription',
    'EligibilityCriteria',
    'HealthyVolunteers',
    'Sex',
    'MinimumAge',
    'MaximumAge',
    'StdAge',
    'EnrollmentCount',
    'EnrollmentType',
    'LeadSponsorName',
    'LeadSponsorClass',
    'LocationFacility',
    'LocationCity',
    'LocationState',
    'LocationZip',
    'LocationCountry',
    'LocationGeoPoint',
    'LocationStatus',
    'LocationContactName',
    'LocationContactRole',
    'LocationContactPhone',
    'LocationContactEMail',
    'StartDate',
    'PrimaryCompletionDate',
    'CompletionDate',
    'StudyFirstPostDate',
    'LastUpdatePostDate'
  ];

  constructor() {
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`ClinicalTrials API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('ClinicalTrials API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`ClinicalTrials API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('ClinicalTrials API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          params: error.config?.params
        });
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Search for clinical trials
   */
  async searchStudies(params: ClinicalTrialsSearchParams): Promise<ClinicalTrialsSearchResponse> {
    try {
      const queryParams = this.buildQueryParams(params);
      
      console.log('ClinicalTrials API Query:', {
        url: '/studies',
        params: queryParams
      });
      
      const response = await this.apiClient.get('/studies', {
        params: queryParams
      });

      return this.transformSearchResponse(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed information about a specific study
   */
  async getStudyDetails(nctId: string, fields?: string[]): Promise<Study> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {
        format: 'json'
      };

      if (fields && fields.length > 0) {
        params.fields = fields.join(',');
      } else {
        params.fields = this.defaultFields.join(',');
      }

      const response = await this.apiClient.get(`/studies/${nctId}`, {
        params
      });

      if (!response.data || !response.data.studies || response.data.studies.length === 0) {
        throw new ClinicalTrialsError(
          `Study ${nctId} not found`,
          'STUDY_NOT_FOUND',
          { nctId }
        );
      }

      return response.data.studies[0];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Build query parameters for the API request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildQueryParams(params: ClinicalTrialsSearchParams): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryParams: Record<string, any> = {
      format: 'json',
      // Convert numeric parameters to strings as required by the API
      pageSize: String(params.pageSize || 50)
      // Note: API v2 uses pageToken for pagination, not pageNumber
    };

    // Add query parameters
    if (params.query) {
      queryParams['query.term'] = params.query;
    }

    if (params.condition) {
      queryParams['query.cond'] = params.condition;
    }

    if (params.location) {
      queryParams['query.locn'] = params.location;
      // Note: API v2 doesn't support query.dist parameter
      // Distance filtering would need to be done client-side
    }

    // Add filter parameters
    if (params.status && params.status.length > 0) {
      queryParams['filter.overallStatus'] = params.status.join(',');
    }

    if (params.phase && params.phase.length > 0) {
      queryParams['filter.phase'] = params.phase.join(',');
    }

    if (params.studyType && params.studyType.length > 0) {
      queryParams['filter.studyType'] = params.studyType.join(',');
    }

    if (params.interventionType && params.interventionType.length > 0) {
      queryParams['filter.interventionType'] = params.interventionType.join(',');
    }

    if (params.sponsor) {
      queryParams['filter.lead'] = params.sponsor;
    }

    if (params.nctId) {
      queryParams['filter.ids'] = params.nctId;
    }

    // Add fields
    if (params.fields && params.fields.length > 0) {
      queryParams.fields = params.fields.join(',');
    } else {
      queryParams.fields = this.defaultFields.join(',');
    }

    // Add pagination token if provided (API v2 uses cursor-based pagination)
    if (params.pageToken) {
      queryParams.pageToken = params.pageToken;
    }

    // Add sorting
    if (params.sortField) {
      queryParams.sort = `${params.sortField}:${params.sortOrder || 'asc'}`;
    }

    return queryParams;
  }

  /**
   * Transform the API response to our internal format
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformSearchResponse(data: any): ClinicalTrialsSearchResponse {
    if (!data || !data.studies) {
      return {
        studies: [],
        totalCount: 0
      };
    }

    return {
      studies: data.studies,
      totalCount: data.totalCount || data.studies.length,
      nextPageToken: data.nextPageToken
    };
  }

  /**
   * Handle API errors
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError(error: any): ClinicalTrialsError {
    if (error instanceof ClinicalTrialsError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 400) {
        return new ClinicalTrialsError(
          'Invalid request parameters',
          'INVALID_PARAMETERS',
          { details: data }
        );
      } else if (status === 404) {
        return new ClinicalTrialsError(
          'Resource not found',
          'NOT_FOUND',
          { details: data }
        );
      } else if (status === 429) {
        return new ClinicalTrialsError(
          'Rate limit exceeded',
          'RATE_LIMIT_EXCEEDED',
          { retryAfter: error.response?.headers['retry-after'] }
        );
      } else if (status === 503) {
        return new ClinicalTrialsError(
          'ClinicalTrials.gov API is temporarily unavailable',
          'SERVICE_UNAVAILABLE'
        );
      }

      return new ClinicalTrialsError(
        error.message || 'API request failed',
        'API_ERROR',
        { status, data }
      );
    }

    return new ClinicalTrialsError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      { error: error.message }
    );
  }
}

// Export singleton instance
export const clinicalTrialsAPI = new ClinicalTrialsAPIService();