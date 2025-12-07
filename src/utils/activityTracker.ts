import { supabase } from './supabase/client';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_title: string;
  activity_description?: string;
  metadata?: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface CreateActivityParams {
  type: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

class ActivityTracker {
  private async createActivity(params: CreateActivityParams): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await (supabase
        .from('user_activities') as any)
        .insert({
          user_id: user.id,
          activity_type: params.type,
          activity_title: params.title,
          activity_description: params.description,
          metadata: params.metadata || {}
        });

      if (error) {
        console.error('Failed to create activity:', error);
      }
    } catch (error) {
      console.error('Activity tracking error:', error);
    }
  }

  // Profile Activities
  async profileUpdated(changes: string[]) {
    await this.createActivity({
      type: 'profile_update',
      title: 'Profile Updated',
      description: `Updated: ${changes.join(', ')}`,
      metadata: { changes }
    });
  }

  async profilePictureUploaded() {
    await this.createActivity({
      type: 'profile_update',
      title: 'Profile Picture Updated',
      description: 'You uploaded a new profile picture'
    });
  }

  // PIN Activities
  async pinGenerated(pinNumber: string) {
    await this.createActivity({
      type: 'pin_generation',
      title: 'PIN Generated',
      description: `Your professional PIN ${pinNumber} has been generated`,
      metadata: { pinNumber }
    });
  }

  async pinRegenerated(oldPin: string, newPin: string) {
    await this.createActivity({
      type: 'pin_generation',
      title: 'PIN Regenerated',
      description: `Your PIN has been updated from ${oldPin} to ${newPin}`,
      metadata: { oldPin, newPin }
    });
  }

  // Project Activities
  async projectCreated(projectTitle: string, projectId?: string) {
    await this.createActivity({
      type: 'project_action',
      title: 'Project Created',
      description: `Created project: ${projectTitle}`,
      metadata: { projectTitle, projectId }
    });
  }

  async projectUpdated(projectTitle: string, projectId?: string) {
    await this.createActivity({
      type: 'project_action',
      title: 'Project Updated',
      description: `Updated project: ${projectTitle}`,
      metadata: { projectTitle, projectId }
    });
  }

  async projectDeleted(projectTitle: string) {
    await this.createActivity({
      type: 'project_action',
      title: 'Project Deleted',
      description: `Deleted project: ${projectTitle}`,
      metadata: { projectTitle }
    });
  }

  // Endorsement Activities
  async endorsementRequested(receiverName: string) {
    await this.createActivity({
      type: 'endorsement_action',
      title: 'Endorsement Requested',
      description: `You requested an endorsement from ${receiverName}`,
      metadata: { receiverName }
    });
  }

  async endorsementReceived(senderName: string) {
    await this.createActivity({
      type: 'endorsement_action',
      title: 'Endorsement Received',
      description: `${senderName} endorsed you`,
      metadata: { senderName }
    });
  }

  async endorsementApproved(senderName: string) {
    await this.createActivity({
      type: 'endorsement_action',
      title: 'Endorsement Approved',
      description: `You approved an endorsement from ${senderName}`,
      metadata: { senderName }
    });
  }

  async endorsementRejected(senderName: string) {
    await this.createActivity({
      type: 'endorsement_action',
      title: 'Endorsement Rejected',
      description: `You rejected an endorsement from ${senderName}`,
      metadata: { senderName }
    });
  }

  // Work Identity Activities
  async workExperienceAdded(company: string, role: string) {
    await this.createActivity({
      type: 'work_identity',
      title: 'Work Experience Added',
      description: `Added ${role} at ${company}`,
      metadata: { company, role }
    });
  }

  async skillsUpdated(addedSkills: string[], removedSkills: string[]) {
    const description = [];
    if (addedSkills.length > 0) description.push(`Added: ${addedSkills.join(', ')}`);
    if (removedSkills.length > 0) description.push(`Removed: ${removedSkills.join(', ')}`);
    
    await this.createActivity({
      type: 'work_identity',
      title: 'Skills Updated',
      description: description.join(' | '),
      metadata: { addedSkills, removedSkills }
    });
  }

  async certificationAdded(name: string, issuer: string) {
    await this.createActivity({
      type: 'work_identity',
      title: 'Certification Added',
      description: `Added ${name} from ${issuer}`,
      metadata: { name, issuer }
    });
  }

  // Security Activities
  async passwordChanged() {
    await this.createActivity({
      type: 'security',
      title: 'Password Changed',
      description: 'Your password has been updated'
    });
  }

  async twoFactorEnabled() {
    await this.createActivity({
      type: 'security',
      title: '2FA Enabled',
      description: 'Two-factor authentication has been enabled'
    });
  }

  // Identity Card Activities
  async identityCardDownloaded() {
    await this.createActivity({
      type: 'identity_card',
      title: 'Identity Card Downloaded',
      description: 'You downloaded your professional identity card'
    });
  }

  async identityCardShared() {
    await this.createActivity({
      type: 'identity_card',
      title: 'Identity Card Shared',
      description: 'You shared your professional identity card'
    });
  }

  // Profile View Activities
  async profileViewed(viewerName?: string) {
    await this.createActivity({
      type: 'profile_view',
      title: 'Profile Viewed',
      description: viewerName 
        ? `${viewerName} viewed your profile`
        : 'Someone viewed your profile',
      metadata: { viewerName }
    });
  }
}

export const activityTracker = new ActivityTracker();
