import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, MessageSquare, HelpCircle, Send, CheckCircle2, 
  AlertCircle, Star, ChevronDown, ChevronUp, Shield, 
  Sparkles, Clock, Check, FileText, UserCheck, AlertTriangle, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { SupportRequest, FaqItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface CustomerSupportProps {
  setCurrentPage?: (page: string) => void;
}

export const CustomerSupport: React.FC<CustomerSupportProps> = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'contact' | 'faqs' | 'feedback'>('contact');

  // Support Request Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Franchise Data');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState('');
  const [supportError, setSupportError] = useState('');
  const [myRequests, setMyRequests] = useState<SupportRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Feedback Form State
  const [rating, setRating] = useState<number>(5);
  const [feedbackCategory, setFeedbackCategory] = useState('General Experience');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSuggestion, setFeedbackSuggestion] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // FAQs State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<string | null>('how-it-works');
  const [faqCategory, setFaqCategory] = useState<string>('ALL');

  useEffect(() => {
    // Load FAQs
    api.getFaqs().then(setFaqs).catch(console.error);

    // Load user's previous tickets if logged in
    if (user) {
      loadMyRequests();
    }
  }, [user]);

  const loadMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const data = await api.getMySupportRequests();
      setMyRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportError('');
    setSupportSuccess('');

    if (!subject.trim() || !message.trim()) {
      setSupportError('Please fill in both subject and message.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitSupportRequest({
        subject: subject.trim(),
        category,
        message: message.trim(),
        name: user?.name,
        email: user?.email
      });

      setSupportSuccess('Your support request has been submitted.');
      setSubject('');
      setMessage('');
      if (user) {
        loadMyRequests();
      }
      setTimeout(() => setSupportSuccess(''), 6000);
    } catch (err: any) {
      setSupportError(err.message || 'Failed to submit support request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSuccess('');

    if (!feedbackMsg.trim()) {
      setFeedbackError('Please enter your feedback message.');
      return;
    }

    setFeedbackSubmitting(true);
    try {
      await api.submitFeedback({
        rating,
        category: feedbackCategory,
        message: feedbackMsg.trim(),
        suggestion: feedbackSuggestion.trim() || undefined,
        name: user?.name,
        email: user?.email
      });

      setFeedbackSuccess('Thank you for your feedback.');
      setFeedbackMsg('');
      setFeedbackSuggestion('');
      setTimeout(() => setFeedbackSuccess(''), 6000);
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleQuickCategory = (cat: string, initialSubject = '') => {
    setCategory(cat);
    if (initialSubject) setSubject(initialSubject);
    setActiveTab('contact');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const filteredFaqs = faqs.filter(f => faqCategory === 'ALL' || f.category === faqCategory);
  const faqCategories = ['ALL', ...Array.from(new Set(faqs.map(f => f.category)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <LifeBuoy className="w-3.5 h-3.5" /> Investor Help & Customer Care
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Customer Service & Support</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Get technical assistance, report discrepancies in franchise claims, understand data provenance, or share feedback directly with our research team.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Logged in as <strong>{user.name}</strong></span>
          </div>
        )}
      </div>

      {/* Quick Assistance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => handleQuickCategory('Franchise Data', 'Inquiry on franchise data metrics')}
          className="bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">Ask About Franchise Data</h4>
          <p className="text-[11px] text-slate-400 mt-1">Verify revenue claims, royalty percentages, or space requirements.</p>
        </div>

        <div 
          onClick={() => handleQuickCategory('Technical Issue', 'Reporting a technical bug / issue')}
          className="bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">Report a Problem</h4>
          <p className="text-[11px] text-slate-400 mt-1">Flag layout issues, calculator errors, or navigation bugs.</p>
        </div>

        <div 
          onClick={() => handleQuickCategory('Technical Issue', 'Technical support assistance required')}
          className="bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <LifeBuoy className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Technical Support</h4>
          <p className="text-[11px] text-slate-400 mt-1">API integration, browser compatibility, and performance.</p>
        </div>

        <div 
          onClick={() => handleQuickCategory('Account', 'Account credential or access inquiry')}
          className="bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-amber-300">Account Support</h4>
          <p className="text-[11px] text-slate-400 mt-1">Password reset, investor profile, and watchlist sync.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        {[
          { id: 'contact', label: 'Contact Support', icon: LifeBuoy },
          { id: 'faqs', label: 'Frequently Asked Questions', icon: HelpCircle },
          { id: 'feedback', label: 'Customer Feedback', icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Contact Support */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Support Ticket Submission Form */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-emerald-400" />
                  Submit a Support Request
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Our analyst and technical team will review your inquiry and respond within 24 business hours.
                </p>
              </div>
            </div>

            {supportSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{supportSuccess}</span>
              </div>
            )}

            {supportError && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{supportError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSupport} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Franchise Data">Franchise Data</option>
                    <option value="Account">Account</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Payment/Subscription">Payment/Subscription</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Question regarding Chai Point investment range"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Message *</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question or issue in detail. Include any relevant brand names or metrics if applicable..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:border-emerald-500 outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Requests are logged with forensic timestamping and associated with your account.
                </span>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* User's Previous Requests / Status Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Your Support History
            </h3>

            {loadingRequests ? (
              <div className="text-xs text-slate-400 flex items-center gap-2 py-4">
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading your tickets...</span>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1 text-center">
                <FileText className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                <p className="font-semibold text-slate-300">No active support requests</p>
                <p className="text-[11px]">When you submit a request, its live status will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {myRequests.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate max-w-[170px]">{r.subject}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        r.status === 'OPEN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        r.status === 'IN_PROGRESS' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{r.category}</span>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-2">{r.message}</p>
                    {r.admin_notes && (
                      <div className="mt-1 p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[10px] text-emerald-300">
                        <strong>Admin Update:</strong> {r.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-white block">Official Contact Info</span>
              <span>Email: <a href="mailto:support@franchiseiq.com" className="text-emerald-400 hover:underline">support@franchiseiq.com</a></span>
              <span className="block text-[10px] text-slate-500">Hours: Mon-Fri, 9:00 AM - 6:00 PM IST</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Frequently Asked Questions */}
      {activeTab === 'faqs' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore comprehensive explanations of our financial analytics, data sourcing pipeline, and forensic scoring.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {faqCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFaqCategory(c)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all ${
                    faqCategory === c
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
                  >
                    <span className="font-bold text-white text-xs sm:text-sm">{faq.question}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-medium">
                        {faq.category}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Customer Feedback */}
      {activeTab === 'feedback' && (
        <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Help Us Improve FranchiseIQ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Your ratings and suggestions directly guide our data verification audits, feature additions, and analytics improvements.
            </p>
          </div>

          {feedbackSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackSuccess}</span>
            </div>
          )}

          {feedbackError && (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{feedbackError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-2">How would you rate your experience? *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700 hover:text-amber-400'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-amber-400 font-bold ml-2">
                  {rating === 5 ? '5 Stars - Exceptional' :
                   rating === 4 ? '4 Stars - Great' :
                   rating === 3 ? '3 Stars - Average' :
                   rating === 2 ? '2 Stars - Needs Work' : '1 Star - Unsatisfactory'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Feedback Category *</label>
              <select
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-emerald-500 outline-none"
              >
                <option value="Website/UI">Website/UI</option>
                <option value="Franchise Data">Franchise Data</option>
                <option value="Recommendations">Recommendations</option>
                <option value="Calculator">Calculator</option>
                <option value="Chatbot">Chatbot</option>
                <option value="General Experience">General Experience</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Message *</label>
              <textarea
                required
                rows={4}
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder="What was most helpful, or what can we improve regarding data accuracy and tools?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:border-emerald-500 outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Optional Suggestion for New Features</label>
              <input
                type="text"
                value={feedbackSuggestion}
                onChange={(e) => setFeedbackSuggestion(e.target.value)}
                placeholder="e.g. Export financial models to Excel or add tier-2 city pin codes"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:border-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={feedbackSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
            >
              {feedbackSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
