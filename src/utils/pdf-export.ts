/**
 * PDF Export Utility
 * Generate PDF from professional profile
 */

import { supabase } from './supabase/client';

interface ProfileData {
  name: string;
  role: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  workExperience?: any[];
  education?: any[];
  certifications?: any[];
}

/**
 * Generate PDF Resume
 */
export async function generatePDFResume(userId: string): Promise<Blob> {
  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: workExperiences } = await supabase
    .from('work_experiences')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  // Create HTML template
  const html = generateResumeHTML({
    name: profile?.full_name || profile?.name || 'Professional',
    role: profile?.role || profile?.job_title || '',
    email: profile?.email || '',
    location: profile?.city || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    workExperience: workExperiences || [],
  });

  // Convert HTML to PDF using print media query
  const blob = await htmlToPDF(html);
  return blob;
}

/**
 * Generate Resume HTML Template
 */
function generateResumeHTML(data: ProfileData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.name} - Resume</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
    }
    
    .header {
      border-bottom: 3px solid #3B82F6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .name {
      font-size: 32pt;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 5px;
    }
    
    .role {
      font-size: 16pt;
      color: #3B82F6;
      margin-bottom: 15px;
    }
    
    .contact {
      font-size: 10pt;
      color: #666;
    }
    
    .contact span {
      margin-right: 15px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 16pt;
      font-weight: bold;
      color: #1a1a1a;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    
    .bio {
      text-align: justify;
      margin-bottom: 20px;
    }
    
    .experience-item {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .job-title {
      font-size: 13pt;
      font-weight: bold;
      color: #1a1a1a;
    }
    
    .company {
      font-size: 12pt;
      color: #3B82F6;
    }
    
    .date-location {
      font-size: 10pt;
      color: #666;
      margin-bottom: 8px;
    }
    
    .description {
      font-size: 10pt;
      text-align: justify;
    }
    
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill-tag {
      display: inline-block;
      padding: 5px 12px;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      font-size: 10pt;
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="name">${data.name}</div>
    <div class="role">${data.role}</div>
    <div class="contact">
      ${data.email ? `<span>📧 ${data.email}</span>` : ''}
      ${data.location ? `<span>📍 ${data.location}</span>` : ''}
    </div>
  </div>

  <!-- Bio -->
  ${data.bio ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="bio">${data.bio}</div>
  </div>
  ` : ''}

  <!-- Work Experience -->
  ${data.workExperience && data.workExperience.length > 0 ? `
  <div class="section">
    <div class="section-title">Work Experience</div>
    ${data.workExperience.map(exp => `
      <div class="experience-item">
        <div class="job-title">${exp.job_title}</div>
        <div class="company">${exp.company_name}</div>
        <div class="date-location">
          ${formatDate(exp.start_date)} - ${exp.is_current ? 'Present' : formatDate(exp.end_date)}
          ${exp.location ? ` • ${exp.location}` : ''}
        </div>
        ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Skills -->
  ${data.skills && data.skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills">
      ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Footer -->
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 9pt; color: #999;">
    Generated via GidiPIN - Professional Identity Network
  </div>
</body>
</html>
  `;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Convert HTML to PDF using browser print
 */
async function htmlToPDF(html: string): Promise<Blob> {
  // Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  document.body.appendChild(iframe);

  // Write HTML to iframe
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Trigger print (user will see print dialog)
    iframe.contentWindow?.print();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }

  // Return empty blob (actual PDF is generated by browser)
  return new Blob([''], { type: 'application/pdf' });
}

/**
 * Download PDF Resume
 */
export async function downloadPDFResume(userId: string, fileName?: string): Promise<void> {
  try {
    // Generate and trigger print dialog
    await generatePDFResume(userId);
    
    // Note: Browser's print-to-PDF will handle the actual download
    console.log('PDF generation initiated. Use browser Print > Save as PDF');
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}
