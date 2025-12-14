/**
 * Employment Type Utilities
 * Defines employment types and their display labels for work experience entries
 */

export type EmploymentType = 
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'freelance'
  | 'internship'
  | 'apprenticeship'
  | 'seasonal'
  | 'self_employed';

/**
 * Human-readable labels for employment types
 * Used for display in UI components
 */
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
  apprenticeship: 'Apprenticeship',
  seasonal: 'Seasonal',
  self_employed: 'Self-employed'
};

/**
 * Options array for dropdowns/selects
 * Format: [{ value: 'full_time', label: 'Full-time' }, ...]
 */
export const EMPLOYMENT_TYPE_OPTIONS = Object.entries(EMPLOYMENT_TYPE_LABELS).map(
  ([value, label]) => ({ 
    value: value as EmploymentType, 
    label 
  })
);

/**
 * Get display label for an employment type
 * @param type - The employment type enum value
 * @returns Human-readable label or empty string if undefined
 */
export function getEmploymentTypeLabel(type?: EmploymentType): string {
  return type ? EMPLOYMENT_TYPE_LABELS[type] : '';
}

/**
 * Validate if a string is a valid employment type
 * @param value - String to validate
 * @returns True if valid employment type
 */
export function isValidEmploymentType(value: string): value is EmploymentType {
  return Object.keys(EMPLOYMENT_TYPE_LABELS).includes(value);
}
