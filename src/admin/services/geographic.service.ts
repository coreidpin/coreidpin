import { supabase } from '../../utils/supabase/client';

export interface CountryData {
  country: string;
  user_count: number;
  percentage: number;
  verified_count: number;
  business_count: number;
}

export interface RegionData {
  country: string;
  region: string;
  user_count: number;
  percentage: number;
}

export interface DemographicData {
  metric_name: string;
  metric_value: string;
  user_count: number;
  percentage: number;
}

export interface GeographicGrowth {
  country: string;
  new_users: number;
  growth_rate: number;
  total_users: number;
}

export interface CityData {
  city: string;
  country: string;
  user_count: number;
  percentage: number;
}

export interface GeographicSummary {
  total_countries: number;
  total_regions: number;
  total_cities: number;
  top_country: string;
  top_country_users: number;
  top_country_percentage: number;
}

export type TimePeriod = '7d' | '30d' | '90d';

class GeographicService {
  /**
   * Get user distribution by country
   */
  async getUsersByCountry(): Promise<CountryData[]> {
    const { data, error } = await supabase
      .rpc('get_users_by_country');

    if (error) {
      console.error('Error fetching users by country:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get user distribution by region/state
   */
  async getUsersByRegion(countryFilter?: string): Promise<RegionData[]> {
    const { data, error } = await supabase
      .rpc('get_users_by_region', { 
        country_filter: countryFilter || null 
      });

    if (error) {
      console.error('Error fetching users by region:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get demographic breakdown
   */
  async getDemographicBreakdown(): Promise<DemographicData[]> {
    const { data, error } = await supabase
      .rpc('get_demographic_breakdown');

    if (error) {
      console.error('Error fetching demographic breakdown:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get geographic growth data
   */
  async getGeographicGrowth(timePeriod: TimePeriod = '30d'): Promise<GeographicGrowth[]> {
    const { data, error } = await supabase
      .rpc('get_geographic_growth', { time_period: timePeriod });

    if (error) {
      console.error('Error fetching geographic growth:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get top cities
   */
  async getUsersByCity(limit: number = 20): Promise<CityData[]> {
    const { data, error } = await supabase
      .rpc('get_users_by_city', { limit_count: limit });

    if (error) {
      console.error('Error fetching users by city:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get geographic summary
   */
  async getGeographicSummary(): Promise<GeographicSummary | null> {
    const { data, error } = await supabase
      .rpc('get_geographic_summary');

    if (error) {
      console.error('Error fetching geographic summary:', error);
      return null;
    }

    return data?.[0] || null;
  }

  /**
   * Get formatted country data for map visualization
   */
  async getCountryMapData(): Promise<{ [key: string]: number }> {
    const countries = await this.getUsersByCountry();
    const mapData: { [key: string]: number } = {};
    
    countries.forEach(country => {
      // Convert country names to ISO codes if needed
      // For now, use country name as key
      mapData[country.country] = country.user_count;
    });

    return mapData;
  }

  /**
   * Get top N countries
   */
  async getTopCountries(limit: number = 10): Promise<CountryData[]> {
    const countries = await this.getUsersByCountry();
    return countries.slice(0, limit);
  }

  /**
   * Group demographics by metric type
   */
  groupDemographicsByMetric(demographics: DemographicData[]): {
    [key: string]: DemographicData[]
  } {
    const grouped: { [key: string]: DemographicData[] } = {};
    
    demographics.forEach(item => {
      if (!grouped[item.metric_name]) {
        grouped[item.metric_name] = [];
      }
      grouped[item.metric_name].push(item);
    });

    return grouped;
  }

  /**
   * Calculate diversity score (0-100)
   * Higher score = more geographically diverse user base
   */
  calculateDiversityScore(countries: CountryData[]): number {
    if (countries.length === 0) return 0;
    if (countries.length === 1) return 20;

    // Calculate Herfindahl-Hirschman Index (HHI)
    const hhi = countries.reduce((sum, country) => {
      const share = country.percentage / 100;
      return sum + (share * share);
    }, 0);

    // Convert HHI to diversity score (0-100)
    // HHI ranges from 1/n to 1, where n is number of countries
    // Lower HHI = more diverse
    const maxHHI = 1;
    const minHHI = 1 / countries.length;
    const normalizedHHI = (hhi - minHHI) / (maxHHI - minHHI);
    
    // Invert so higher score = more diverse
    return Math.round((1 - normalizedHHI) * 100);
  }

  /**
   * Get insights based on geographic data
   */
  getGeographicInsights(
    countries: CountryData[],
    growth: GeographicGrowth[]
  ): string[] {
    const insights: string[] = [];

    if (countries.length === 0) return ['No geographic data available yet'];

    // Top country insight
    if (countries[0]) {
      insights.push(
        `${countries[0].country} leads with ${countries[0].user_count.toLocaleString()} users (${countries[0].percentage}%)`
      );
    }

    // Diversity insight
    const diversityScore = this.calculateDiversityScore(countries);
    if (diversityScore >= 70) {
      insights.push(`Highly diverse user base across ${countries.length} countries`);
    } else if (diversityScore < 40) {
      insights.push(`User base concentrated in ${countries.slice(0, 3).map(c => c.country).join(', ')}`);
    }

    // Growth insight
    if (growth.length > 0 && growth[0].growth_rate > 10) {
      insights.push(
        `Strong growth in ${growth[0].country} (+${growth[0].growth_rate}% this period)`
      );
    }

    // Business user insight
    const totalBusiness = countries.reduce((sum, c) => sum + c.business_count, 0);
    const totalUsers = countries.reduce((sum, c) => sum + c.user_count, 0);
    const businessPercentage = (totalBusiness / totalUsers) * 100;
    
    if (businessPercentage > 30) {
      insights.push(`Strong business presence (${businessPercentage.toFixed(1)}% of users)`);
    }

    return insights;
  }
}

export const geographicService = new GeographicService();
