import { ClinicalTrialsSearchParams } from '../types/clinicaltrials.types';

export interface QueryBuilderOptions {
  // Basic search
  conditions?: string[];
  keywords?: string[];
  
  // Location
  location?: {
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    distance?: number;
  };
  
  // Demographics
  age?: number;
  sex?: 'male' | 'female' | 'all';
  
  // Medical criteria
  biomarkers?: Array<{
    name: string;
    status?: string;
  }>;
  interventions?: string[];
  phases?: string[];
  
  // Status
  recruitingOnly?: boolean;
  expandedAccessOnly?: boolean;
  
  // Sponsor
  sponsorTypes?: Array<'industry' | 'nih' | 'academic' | 'other'>;
  specificSponsors?: string[];
}

export class QueryBuilderService {
  /**
   * Build a comprehensive search query from structured options
   */
  static buildSearchParams(options: QueryBuilderOptions): ClinicalTrialsSearchParams {
    const params: ClinicalTrialsSearchParams = {
      pageSize: 100,
      pageNumber: 1
    };

    // Build condition query
    if (options.conditions && options.conditions.length > 0) {
      params.condition = this.buildConditionQuery(options.conditions);
    }

    // Build general query terms
    const queryTerms: string[] = [];
    
    if (options.keywords && options.keywords.length > 0) {
      queryTerms.push(...options.keywords);
    }

    if (options.biomarkers && options.biomarkers.length > 0) {
      const biomarkerTerms = options.biomarkers.map(b => 
        b.status ? `${b.name} ${b.status}` : b.name
      );
      queryTerms.push(...biomarkerTerms);
    }

    if (queryTerms.length > 0) {
      params.query = queryTerms.join(' OR ');
    }

    // Handle location
    if (options.location) {
      params.location = this.buildLocationString(options.location);
      if (options.location.distance) {
        params.distance = `${options.location.distance}mi`;
      }
    }

    // Handle status filters
    if (options.recruitingOnly) {
      params.status = ['RECRUITING', 'NOT_YET_RECRUITING'];
    }

    // Handle phases
    if (options.phases && options.phases.length > 0) {
      params.phase = this.normalizePhases(options.phases);
    }

    // Handle interventions
    if (options.interventions && options.interventions.length > 0) {
      params.interventionType = this.categorizeInterventions(options.interventions);
    }

    // Handle sponsors
    if (options.sponsorTypes || options.specificSponsors) {
      params.sponsor = this.buildSponsorQuery(
        options.sponsorTypes,
        options.specificSponsors
      );
    }

    return params;
  }

  /**
   * Build condition query with synonyms and variations
   */
  private static buildConditionQuery(conditions: string[]): string {
    const expandedConditions: string[] = [];

    conditions.forEach(condition => {
      expandedConditions.push(condition);
      
      // Add common variations
      const variations = this.getConditionVariations(condition);
      expandedConditions.push(...variations);
    });

    return expandedConditions.join(' OR ');
  }

  /**
   * Get common variations of condition names
   */
  private static getConditionVariations(condition: string): string[] {
    const variations: string[] = [];
    const conditionLower = condition.toLowerCase();

    // Common cancer variations
    if (conditionLower.includes('cancer') || conditionLower.includes('carcinoma')) {
      if (conditionLower.includes('lung')) {
        variations.push('NSCLC', 'SCLC', 'non-small cell lung', 'small cell lung');
      } else if (conditionLower.includes('breast')) {
        variations.push('mammary', 'TNBC', 'triple negative breast');
      } else if (conditionLower.includes('colorectal')) {
        variations.push('colon', 'rectal', 'CRC');
      }
    }

    // Common abbreviations
    const abbreviations: Record<string, string[]> = {
      'acute myeloid leukemia': ['AML'],
      'chronic myeloid leukemia': ['CML'],
      'acute lymphoblastic leukemia': ['ALL'],
      'chronic lymphocytic leukemia': ['CLL'],
      'non-hodgkin lymphoma': ['NHL'],
      'multiple myeloma': ['MM'],
      'glioblastoma multiforme': ['GBM'],
      'hepatocellular carcinoma': ['HCC'],
      'renal cell carcinoma': ['RCC']
    };

    const abbrev = abbreviations[conditionLower];
    if (abbrev) {
      variations.push(...abbrev);
    }

    return variations;
  }

  /**
   * Build location string from components
   */
  private static buildLocationString(location: QueryBuilderOptions['location']): string {
    if (!location) return '';

    // If we have coordinates AND distance, use distance function
    // Format: distance(latitude,longitude,distance)
    if (location.latitude && location.longitude && location.distance) {
      return `distance(${location.latitude},${location.longitude},${location.distance}mi)`;
    }

    // Otherwise use city/state/country search (more reliable than raw coordinates)
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);

    // Return city/state/country string, or empty if no text location provided
    return parts.join(', ');
  }

  /**
   * Normalize phase names to API format
   * Valid values: NA, EARLY_PHASE1, PHASE1, PHASE2, PHASE3, PHASE4
   */
  private static normalizePhases(phases: string[]): string[] {
    const phaseMap: Record<string, string> = {
      '0': 'EARLY_PHASE1',
      '1': 'PHASE1',
      '2': 'PHASE2',
      '3': 'PHASE3',
      '4': 'PHASE4',
      'early': 'EARLY_PHASE1',
      'early phase 1': 'EARLY_PHASE1',
      'phase 0': 'EARLY_PHASE1',
      'phase 1': 'PHASE1',
      'phase 2': 'PHASE2',
      'phase 3': 'PHASE3',
      'phase 4': 'PHASE4',
      'phase i': 'PHASE1',
      'phase ii': 'PHASE2',
      'phase iii': 'PHASE3',
      'phase iv': 'PHASE4',
      'n/a': 'NA',
      'not applicable': 'NA'
    };

    return phases.map(phase => {
      const normalized = phase.toLowerCase().trim();
      return phaseMap[normalized] || phase.toUpperCase();
    });
  }

  /**
   * Categorize interventions into API types
   */
  private static categorizeInterventions(interventions: string[]): string[] {
    const types = new Set<string>();

    interventions.forEach(intervention => {
      const lower = intervention.toLowerCase();
      
      if (lower.includes('drug') || lower.includes('medication') || 
          lower.includes('chemotherapy') || lower.includes('antibody')) {
        types.add('DRUG');
      }
      if (lower.includes('surgery') || lower.includes('surgical')) {
        types.add('PROCEDURE');
      }
      if (lower.includes('radiation') || lower.includes('radiotherapy')) {
        types.add('RADIATION');
      }
      if (lower.includes('device')) {
        types.add('DEVICE');
      }
      if (lower.includes('behavioral') || lower.includes('counseling')) {
        types.add('BEHAVIORAL');
      }
      if (lower.includes('vaccine') || lower.includes('immunotherapy')) {
        types.add('BIOLOGICAL');
      }
    });

    return Array.from(types);
  }

  /**
   * Build sponsor query
   */
  private static buildSponsorQuery(
    types?: Array<'industry' | 'nih' | 'academic' | 'other'>,
    specific?: string[]
  ): string {
    const sponsors: string[] = [];

    if (specific) {
      sponsors.push(...specific);
    }

    if (types) {
      types.forEach(type => {
        switch (type) {
          case 'industry':
            // Add common pharmaceutical companies
            sponsors.push('Pfizer', 'Roche', 'Novartis', 'Merck', 'AstraZeneca');
            break;
          case 'nih':
            sponsors.push('National Cancer Institute', 'National Institutes of Health');
            break;
          case 'academic':
            sponsors.push('University', 'Medical Center', 'Hospital');
            break;
        }
      });
    }

    return sponsors.join(' OR ');
  }

  /**
   * Build biomarker-specific query
   */
  static buildBiomarkerQuery(biomarkers: Array<{name: string; status?: string}>): string {
    return biomarkers.map(biomarker => {
      const terms = [biomarker.name];
      
      // Add common variations
      const variations = this.getBiomarkerVariations(biomarker.name);
      terms.push(...variations);

      // Add status if specified
      if (biomarker.status) {
        return terms.map(term => `${term} ${biomarker.status}`).join(' OR ');
      }

      return terms.join(' OR ');
    }).join(' OR ');
  }

  /**
   * Get biomarker name variations
   */
  private static getBiomarkerVariations(biomarker: string): string[] {
    const variations: string[] = [];
    const biomarkerUpper = biomarker.toUpperCase();

    // Common biomarker aliases
    const aliases: Record<string, string[]> = {
      'HER2': ['ERBB2', 'HER-2', 'HER2/neu'],
      'PD-L1': ['PDL1', 'PD-L1', 'CD274'],
      'PD-1': ['PD1', 'PDCD1'],
      'EGFR': ['ERBB1', 'HER1'],
      'ALK': ['ALK1', 'CD246'],
      'ROS1': ['ROS-1'],
      'BRAF': ['B-RAF'],
      'KRAS': ['K-RAS'],
      'NRAS': ['N-RAS'],
      'MSI': ['MSI-H', 'microsatellite instability'],
      'TMB': ['tumor mutational burden'],
      'BRCA1': ['BRCA-1'],
      'BRCA2': ['BRCA-2']
    };

    const aliasMatches = aliases[biomarkerUpper];
    if (aliasMatches) {
      variations.push(...aliasMatches);
    }

    return variations;
  }
}