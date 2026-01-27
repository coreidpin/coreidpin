import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { colors, spacing, typography } from '../styles/designSystem';

const faqs = [
  {
    question: "What exactly is a Verified Global PIN?",
    answer: "A Verified Global PIN is a portable, blockchain-backed professional identity. It aggregates your work history, skills, and education into a single, cryptographically signed record that you own. You can use it to apply for jobs, prove your identity, and access services without repetitive form-filling."
  },
  {
    question: "Is it really free for professionals?",
    answer: "Yes. The Starter plan is completely free and always will be. It allows you to create your PIN, verify your phone number, and share your profile. We charge optional fees for premium visibility, deeper analytics, and business verification features."
  },
  {
    question: "How do you verify my work history?",
    answer: "We use a multi-source verification protocol. We connect with HRIS systems (like Workday, BambooHR), verified work emails, and open-source contributions (GitHub, etc.). Our AI cross-references these data points to assign a 'Trust Score' to each claim."
  },
  {
    question: "Is my personal data secure?",
    answer: "Security is our core product. Your data is encrypted using enterprise-grade standards. Crucially, verification proofs are stored on a decentralized ledger, meaning they are tamper-proof. You verify once, and the proof lasts forever."
  },
  {
    question: "Can companies use this for hiring?",
    answer: "Absolutely. Our Business plan allows companies to integrate PIN Auth for one-click candidate onboarding, automate KYC/AML checks, and instantly verify candidate claims, slashing time-to-hire by up to 70%."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24 px-4 bg-slate-50 relative overflow-hidden">
      {/* Background decoration - subtle gradients for light mode */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

      <div className="container mx-auto max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-2 bg-white text-slate-900 border-slate-200 shadow-sm">
            <HelpCircle className="h-4 w-4 mr-2 text-slate-500" />
            Common Questions
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-6 text-slate-900 font-bold tracking-tight">
            Everything you need to know
          </h2>
          <p className="text-xl text-slate-500 max-w-lg mx-auto">
            Can't find the answer you're looking for? Reach out to our support team.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "border rounded-xl overflow-hidden transition-all duration-300",
                openIndex === index 
                  ? "bg-white border-brand-secondary-500 shadow-lg shadow-brand-secondary-500/10" 
                  : "bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-md"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left group"
              >
                <span className={cn("text-lg font-bold transition-colors pr-8", openIndex === index ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900")}>
                  {faq.question}
                </span>
                <span className={cn(
                  "flex-shrink-0 p-2 rounded-full transition-all duration-300", 
                  openIndex === index ? "bg-brand-secondary-500 text-black rotate-180" : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200"
                )}>
                  <ChevronDown className="h-5 w-5 transition-transform duration-300" />
                </span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                      <div className="pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
