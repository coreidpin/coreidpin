import { ActivityNotification } from '../types/dashboard';
import { ActivityType } from './activityTracker';

/**
 * Map database activity types to ActivityNotification types
 */
const typeMap: Record<ActivityType, ActivityNotification['type']> = {
  login: 'update',
  profile_update: 'update',
  profile_view: 'view',
  endorsement_received: 'endorsement',
  endorsement_given: 'endorsement',
  project_added: 'update',
  project_updated: 'update',
  verification_completed: 'verification',
  pin_generated: 'pin_scan',
  pin_verified: 'pin_scan',
  search_performed: 'update',
  settings_updated: 'update',
  export_data: 'update',
  share_profile: 'update',
};

/**
 * Transform activity title to user-friendly text
 */
function formatActivityText(activity: any): string {
  const metadata = activity.metadata || {};
  
  switch (activity.activity_type) {
    case 'profile_view':
      return metadata.profile_user_id
        ? `Someone viewed your profile`
        : 'Profile viewed';
    
    case 'endorsement_received':
      return metadata.endorser_name
        ? `Received endorsement from ${metadata.endorser_name}`
        : 'Received new endorsement';
    
    case 'pin_verified':
      return `PIN scanned in ${metadata.location || 'unknown location'}`;
    
    case 'verification_completed':
      return `${metadata.verification_type || 'Verification'} confirmed`;
    
    case 'profile_update':
      const fields = metadata.fields ? metadata.fields.join(', ') : '';
      return fields ? `Updated ${fields}` : activity.activity_title || 'Updated profile';
    
    case 'project_added':
      return metadata.project_title
        ? `Added "${metadata.project_title}" to projects`
        : 'Added new project';
    
    default:
      return activity.activity_title || 'Activity recorded';
  }
}

/**
 * Transform database activity to ActivityNotification
 */
export function transformActivity(dbActivity: any): ActivityNotification {
  const type = dbActivity.activity_type as ActivityType;
  
  return {
    id: dbActivity.id,
    type: typeMap[type] || 'update',
    text: formatActivityText(dbActivity),
    timestamp: dbActivity.created_at,
    meta: dbActivity.metadata
  };
}

/**
 * Transform multiple activities
 */
export function transformActivities(dbActivities: any[]): ActivityNotification[] {
  return dbActivities.map(transformActivity);
}
