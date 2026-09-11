import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Sparkles, ChevronDown, 
  HelpCircle, Star, CheckCircle2, AlertCircle, Building2,
  LifeBuoy, ExternalLink, ShieldCheck, CornerDownLeft
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage } from '../types';

interface HelpChatbotProps {
  setCurrentPage?: (page: string) => void;
  setSelectedFranchiseId?: (id: number) => void;
}

export const HelpChatbot: React.FC<HelpChatbotProps> = ({ setCurrentPage, setSelectedFranchiseId }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi! I'm the FranchiseIQ assistant. How can I help you evaluate franchise investments today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quick_actions: [
        "How does FranchiseIQ work?",
        "How are franchises compared?",
        "How is franchise data sourced?",
        "What does the investment mean?",
        "What is Claim Gap Analysis?",
        "How does the recommendation score work?",
        "How do I compare franchises?",
        "How do I use the calculator?",
        "Contact customer support",
        "Give feedback"
      ]
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // In-Chat Support Ticket State
  const [showSupportForm, setShowSupportForm] = useState<boolean>(false);
  const [supportSubject, setSupportSubject] = useState<string>('');
  const [supportCategory, setSupportCategory] = useState<string>('Franchise Data');
  const [supportMsg, setSupportMsg] = useState<string>('');
  const [supportSubmitting, setSupportSubmitting] = useState<boolean>(false);

  // In-Chat Feedback State
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackCategory, setFeedbackCategory] = useState<string>('General Experience');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, showSupportForm, showFeedbackForm]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Check for quick trigger words
      const lower = query.toLowerCase();
      let actionParam: string | undefined = undefined;
      if (lower.includes('contact support') || lower.includes('contact customer support')) {
        actionParam = 'contact_support';
      } else if (lower.includes('give feedback') || lower.includes('submit feedback')) {
        actionParam = 'give_feedback';
      }

      const res = await api.sendChatMessage(query, actionParam);

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quick_actions: res.quick_actions,
        action_type: res.action_type,
        franchise_data: res.franchise_data
      };

      setMessages(prev => [...prev, botMsg]);

      // Trigger inline mini-forms if requested
      if (res.action_type === 'SHOW_SUPPORT_FORM') {
        setShowSupportForm(true);
      } else if (res.action_type === 'SHOW_FEEDBACK_FORM') {
        setShowFeedbackForm(true);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: "I'm having trouble connecting to the FranchiseIQ knowledge service right now. You can also visit our Customer Support page or try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quick_actions: ["Contact customer support", "Give feedback"]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleInlineSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMsg.trim()) return;

    setSupportSubmitting(true);
    try {
      await api.submitSupportRequest({
        subject: supportSubject.trim(),
        category: supportCategory,
        message: supportMsg.trim()
      });

      setShowSupportForm(false);
      setSupportSubject('');
      setSupportMsg('');

      const confirmMsg: ChatMessage = {
        id: String(Date.now()),
        sender: 'assistant',
        text: "Your support request has been submitted. Our team will review your inquiry and follow up shortly. You can also track ticket progress on the Support page.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quick_actions: ["How does FranchiseIQ work?", "How are franchises compared?", "Give feedback"]
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch (err: any) {
      alert(err.message || 'Failed to submit support request');
    } finally {
      setSupportSubmitting(false);
    }
  };

  const handleInlineFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;

    setFeedbackSubmitting(true);
    try {
      await api.submitFeedback({
        rating: feedbackRating,
        category: feedbackCategory,
        message: feedbackMsg.trim()
      });

      setShowFeedbackForm(false);
      setFeedbackMsg('');

      const confirmMsg: ChatMessage = {
        id: String(Date.now()),
        sender: 'assistant',
        text: "Thank you for helping us improve FranchiseIQ! Your rating and feedback have been recorded.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quick_actions: ["How does FranchiseIQ work?", "How is franchise data sourced?", "Contact customer support"]
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
          aria-label="Open FranchiseIQ Help Chatbot"
        >
          <MessageSquare className="w-4 h-4 text-slate-950 group-hover:rotate-6 transition-transform" />
          <span>Help</span>
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
        </button>
      )}

      {/* Compact Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-3 md:bottom-6 md:right-6 z-40 w-[94vw] sm:w-[390px] h-[550px] max-h-[82vh] bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">FranchiseIQ Help</h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Verified Intelligence Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              {setCurrentPage && (
                <button
                  onClick={() => setCurrentPage('support')}
                  title="Open Full Support Page"
                  className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-semibold rounded-tr-xs'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-xs'
                  }`}
                >
                  {m.text}

                  {/* Franchise Data Card if matched */}
                  {m.franchise_data && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1.5 text-slate-300">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>{m.franchise_data.name}</span>
                        <span className="text-emerald-400">{m.franchise_data.roi}% ROI</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                        <span>Inv: ₹{(m.franchise_data.total_investment / 100000).toFixed(1)}L</span>
                        <span>Rev: ₹{(m.franchise_data.monthly_revenue / 100000).toFixed(1)}L/mo</span>
                        <span>Prof: ₹{(m.franchise_data.monthly_profit / 1000).toFixed(0)}k/mo</span>
                        <span>Space: {m.franchise_data.space_sqft} sq ft</span>
                      </div>
                      {setSelectedFranchiseId && setCurrentPage && (
                        <button
                          onClick={() => {
                            setSelectedFranchiseId(m.franchise_data!.id);
                            setCurrentPage('detail');
                            setIsOpen(false);
                          }}
                          className="w-full mt-1 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Open Franchise Details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>

                {/* Quick Actions / Follow-ups */}
                {m.quick_actions && m.quick_actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {m.quick_actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(act)}
                        className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-500/20 border border-slate-700/60 hover:border-emerald-500/40 text-[10px] text-slate-300 hover:text-emerald-300 font-medium transition-colors cursor-pointer text-left"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* In-Chat Support Ticket Form */}
            {showSupportForm && (
              <form
                onSubmit={handleInlineSupportSubmit}
                className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-white text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <LifeBuoy className="w-3.5 h-3.5" /> Direct Support Ticket
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSupportForm(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-0.5">Category</label>
                  <select
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px] outline-none"
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
                  <label className="text-slate-400 text-[10px] block mb-0.5">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief description of your issue"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-[11px] outline-none placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-0.5">Message</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide details so our team can assist you..."
                    value={supportMsg}
                    onChange={(e) => setSupportMsg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-[11px] outline-none placeholder-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={supportSubmitting}
                  className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  {supportSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            )}

            {/* In-Chat Feedback Form */}
            {showFeedbackForm && (
              <form
                onSubmit={handleInlineFeedbackSubmit}
                className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-white text-[11px]">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5" /> Rate & Review FranchiseIQ
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackForm(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="cursor-pointer p-0.5 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                        />
                      </button>
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">
                      {feedbackRating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-0.5">Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px] outline-none"
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
                  <label className="text-slate-400 text-[10px] block mb-0.5">Feedback Message</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Tell us what you like or how we can improve..."
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-[11px] outline-none placeholder-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Checking verified database records...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about ROI, Claim Gaps, or brands like Chai Point..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold transition-all cursor-pointer shrink-0"
              aria-label="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
