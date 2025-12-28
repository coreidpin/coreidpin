import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, Briefcase, HelpCircle, User } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    inquiry_type: 'general'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const { data, error } = await supabase.rpc('submit_contact_form', {
        p_name: formData.name,
        p_email: formData.email,
        p_company: formData.company || null,
        p_phone: formData.phone || null,
        p_subject: formData.subject,
        p_message: formData.message,
        p_inquiry_type: formData.inquiry_type
      });

      if (error) throw error;

      toast.success('Message sent! We\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: '',
        inquiry_type: 'general'
      });
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'hello@gidipin.com',
      link: 'mailto:hello@gidipin.com',
      color: '#7bb8ff'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+234 (0) 800 GIDIPIN',
      link: 'tel:+2348004434746',
      color: '#bfa5ff'
    },
    {
      icon: MapPin,
      title: 'Office',
      value: 'Lagos, Nigeria',
      link: '#',
      color: '#32f08c'
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: MessageCircle },
    { value: 'sales', label: 'Sales', icon: Briefcase },
    { value: 'support', label: 'Support', icon: HelpCircle },
    { value: 'partnership', label: 'Partnership', icon: User },
    { value: 'press', label: 'Press', icon: Mail },
    { value: 'careers', label: 'Careers', icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-2" style={{ backgroundColor: '#7bb8ff', color: '#0a0b0d', border: 'none' }}>
              Contact Us
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
              Let's Talk
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactInfo.map((info, i) => (
              <motion.a
                key={info.title}
                href={info.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="block"
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all">
                  <CardContent className="p-6 text-center">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${info.color}20` }}
                    >
                      <info.icon className="w-6 h-6" style={{ color: info.color }} />
                    </div>
                    <div className="text-sm text-white/60 mb-1">{info.title}</div>
                    <div className="text-white font-medium">{info.value}</div>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Form */}
            <div className="md:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Company & Phone */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Your company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="+234..."
                      />
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type
                    </label>
                    <select
                      name="inquiry_type"
                      value={formData.inquiry_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {inquiryTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="How can we help?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full text-white"
                    style={{ backgroundColor: '#7bb8ff' }}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    We typically respond within 24 hours
                  </p>
                </form>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {/* FAQ Link */}
                <Card className="border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-3">Quick Answers</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Check our FAQ for instant answers to common questions
                    </p>
                    <a
                      href="/faq"
                      className="text-sm font-medium inline-flex items-center gap-1"
                      style={{ color: '#7bb8ff' }}
                    >
                      Visit FAQ
                      <span>→</span>
                    </a>
                  </CardContent>
                </Card>

                {/* Sales */}
                <Card className="border-gray-200 bg-gradient-to-br from-purple-50 to-blue-50">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-3">Sales Inquiries</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Interested in GidiPIN for your business?
                    </p>
                    <a
                      href="mailto:sales@gidipin.com"
                      className="text-sm font-medium"
                      style={{ color: '#7bb8ff' }}
                    >
                      sales@gidipin.com
                    </a>
                  </CardContent>
                </Card>

                {/* Support */}
                <Card className="border-gray-200 bg-gradient-to-br from-emerald-50 to-green-50">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-3">Technical Support</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Need help with integration or technical issues?
                    </p>
                    <a
                      href="mailto:support@gidipin.com"
                      className="text-sm font-medium"
                      style={{ color: '#32f08c' }}
                    >
                      support@gidipin.com
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
