import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Printer, Share2, Shield, CheckCircle2, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface ResumeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export function ResumeGenerator({ isOpen, onClose, profile }: ResumeGeneratorProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!profile) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;
    setDownloading(true);
    try {
      const element = resumeRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${profile.name.replace(/\s+/g, '_')}_CoreID_Resume.pdf`);
      toast.success('Resume downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const profileUrl = `${window.location.origin}/u/${profile.user_id}`; // Conceptual public URL

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 bg-slate-50">
        <DialogHeader className="px-6 py-4 bg-white border-b border-slate-200 flex flex-row items-center justify-between space-y-0">
          <DialogTitle>Verified Resume Preview</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF} disabled={downloading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100">
          <div 
            ref={resumeRef}
            className="w-[210mm] min-h-[297mm] bg-white shadow-lg p-[15mm] text-slate-900 box-border relative"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Header section with Flexbox to prevent overlap */}
            <div className="flex justify-between items-start mb-8">
                {/* Left: Name & Info */}
                <div className="flex-1 pr-8">
                    <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight mb-2">{profile.name}</h1>
                    <p className="text-xl text-blue-600 font-medium">{profile.role}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                        {profile.email && (
                            <div className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5" />
                                {profile.email}
                            </div>
                        )}
                        {profile.phone && (
                            <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5" />
                                {profile.phone}
                            </div>
                        )}
                        {(profile.city || profile.nationality) && (
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {[profile.city, profile.nationality].filter(Boolean).join(', ')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Verified Badge & QR */}
                <div className="flex flex-col items-end flex-shrink-0">
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 mb-2">
                        <Shield className="h-4 w-4 fill-emerald-100 text-emerald-600" />
                        <span className="text-xs font-bold tracking-wide uppercase">CoreID Verified</span>
                    </div>
                    <div className="bg-white p-1 rounded border border-slate-100">
                        <QRCodeSVG value={profileUrl} size={64} level="M" />
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 font-mono">SCAN TO VERIFY</span>
                </div>
            </div>

            {/* Summary */}
            {profile.bio && (
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Professional Summary</h3>
                    <p className="text-sm leading-relaxed text-slate-700">{profile.bio}</p>
                </div>
            )}

            {/* Experience */}
            {profile.work_experiences && profile.work_experiences.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Work Experience</h3>
                    <div className="space-y-6">
                        {profile.work_experiences.map((work: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-slate-900">{work.job_title}</h4>
                                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                        {work.start_date} — {work.is_current ? 'Present' : work.end_date}
                                    </span>
                                </div>
                                <p className="text-sm text-blue-600 font-medium mb-2">{work.company_name}</p>
                                {work.description && (
                                    <p className="text-sm text-slate-600 leading-snug">{work.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Education</h3>
                    <div className="space-y-4">
                        {profile.education.map((edu: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-slate-900">{edu.school}</h4>
                                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                        {edu.start_year} — {edu.end_year || 'Present'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-700">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-8">
                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications */}
                {profile.certifications && profile.certifications.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Certifications</h3>
                        <div className="space-y-2">
                            {profile.certifications.map((cert: any, i: number) => (
                                <div key={i} className="text-sm">
                                    <p className="font-semibold text-slate-900">{cert.name}</p>
                                    <p className="text-slate-500 text-xs">{cert.issuer} • {cert.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="absolute bottom-[15mm] left-[15mm] right-[15mm] border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] text-slate-400">
                <span>Generated by CoreID</span>
                <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
