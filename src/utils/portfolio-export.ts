/**
 * Portfolio Export Utility
 * Export portfolio as PDF or shareable formats
 */

import jsPDF from 'jspdf';

interface ProjectData {
  title: string;
  description: string;
  role?: string;
  timeline?: string;
  skills?: string[];
  links?: string[];
  imageUrl?: string;
}

interface ProfileData {
  name: string;
  title: string;
  bio?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export class PortfolioExporter {
  /**
   * Export portfolio as PDF
   */
  static async exportAsPDF(
    profile: ProfileData,
    projects: ProjectData[]
  ): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Helper to add new page if needed
    const checkNewPage = (requiredSpace: number = 20) => {
      if (yPosition + requiredSpace > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(profile.name, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(profile.title, margin, yPosition);
    yPosition += 15;

    // Bio
    if (profile.bio) {
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      const bioLines = pdf.splitTextToSize(profile.bio, pageWidth - 2 * margin);
      pdf.text(bioLines, margin, yPosition);
      yPosition += bioLines.length * 5 + 10;
    }

    // Contact Info
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    const contactInfo = [];
    if (profile.email) contactInfo.push(`Email: ${profile.email}`);
    if (profile.phone) contactInfo.push(`Phone: ${profile.phone}`);
    if (profile.website) contactInfo.push(`Website: ${profile.website}`);
    
    if (contactInfo.length > 0) {
      pdf.text(contactInfo.join(' | '), margin, yPosition);
      yPosition += 10;
    }

    // Divider
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Projects Section
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Portfolio Projects', margin, yPosition);
    yPosition += 10;

    // Iterate through projects
    projects.forEach((project, index) => {
      checkNewPage(40);

      // Project Title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${index + 1}. ${project.title}`, margin, yPosition);
      yPosition += 7;

      // Role & Timeline
      if (project.role || project.timeline) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100);
        const roleInfo = [];
        if (project.role) roleInfo.push(project.role);
        if (project.timeline) roleInfo.push(project.timeline);
        pdf.text(roleInfo.join(' | '), margin, yPosition);
        yPosition += 6;
      }

      // Description
      if (project.description) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        const descLines = pdf.splitTextToSize(
          project.description,
          pageWidth - 2 * margin
        );
        pdf.text(descLines, margin, yPosition);
        yPosition += descLines.length * 5 + 5;
      }

      // Skills/Tags
      if (project.skills && project.skills.length > 0) {
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Skills: ${project.skills.join(', ')}`, margin, yPosition);
        yPosition += 6;
      }

      // Links
      if (project.links && project.links.length > 0) {
        pdf.setFontSize(9);
        pdf.setTextColor(0, 100, 200);
        project.links.forEach((link) => {
          pdf.textWithLink(link, margin, yPosition, { url: link });
          yPosition += 5;
        });
      }

      yPosition += 8;
    });

    // Footer
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const filename = `${profile.name.replace(/\s+/g, '_')}_Portfolio.pdf`;
    pdf.save(filename);
  }

  /**
   * Export portfolio as JSON
   */
  static exportAsJSON(
    profile: ProfileData,
    projects: ProjectData[]
  ): void {
    const data = {
      profile,
      projects,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name.replace(/\s+/g, '_')}_Portfolio.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Generate shareable link
   */
  static generateShareableLink(userId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/portfolio/${userId}`;
  }

  /**
   * Copy to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}
