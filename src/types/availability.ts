// Profile Availability and Work Preferences Types

export type AvailabilityStatus = 
  | 'actively_working'
  | 'open_to_work_fulltime'
  | 'open_to_contract'
  | 'career_break';

export type WorkPreference = 'remote' | 'hybrid' | 'onsite';

export interface ProfileAvailability {
  availability_status?: AvailabilityStatus;
  work_preference?: WorkPreference;
  availability_updated_at?: string;
}

// Display labels for UI
export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  actively_working: 'Actively Working',
  open_to_work_fulltime: 'Open to Work (Full-Time)',
  open_to_contract: 'Open to Contract Roles',
  career_break: 'Career Break'
};

export const WORK_PREFERENCE_LABELS: Record<WorkPreference, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'Onsite'
};

// Status colors for UI
export const AVAILABILITY_COLORS = {
  actively_working: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', dot: 'bg-blue-500' },
  open_to_work_fulltime: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-900', dot: 'bg-green-500' },
  open_to_contract: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', dot: 'bg-purple-500' },
  career_break: { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700', dot: 'bg-gray-400' }
};
