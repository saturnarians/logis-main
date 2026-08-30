'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  PhoneCall, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  Send,
  ExternalLink
} from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Dispatch Exception');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;

    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketSubject('');
      setTicketDescription('');
    }, 3500);
  };

  const sops = [
    { title: 'Courier PoD Digital Sign-Off Protocol', code: 'SOP-OPS-101', category: 'Field Delivery' },
    { title: 'Cold-Chain Dry Ice Temperature Spike Handling', code: 'SOP-MED-204', category: 'Medical Freight' },
    { title: 'Dangerous Goods Cargo Inspection & Hazmat Labels', code: 'SOP-SEC-309', category: 'Hazmat Safety' },
    { title: 'Cash on Delivery (COD) Driver Daily Cash Drop Reconciliation', code: 'SOP-FIN-412', category: 'Finance' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              OPERATIONS DESK
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Support Center & Standard Operating Procedures (SOP)
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Emergency hotline escalation, compliance knowledge base, and operations ticketing portal.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-red-50 text-red-900 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5">
            <PhoneCall className="w-4 h-4 text-[#D40511]" />
            <span>Emergency Dispatch: +44 (0) 800 245 999</span>
          </div>
        </div>
      </div>

      {ticketSubmitted && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center space-x-2 text-emerald-900 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Incident ticket dispatched to Global Operations Control Center (Ref #TKT-89412).</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Knowledge Base & SOPs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-black text-gray-900 flex items-center border-b border-gray-100 pb-2">
            <BookOpen className="w-4 h-4 mr-2 text-[#D40511]" />
            Operational Manuals & Compliance SOPs
          </h2>

          <div className="space-y-2.5">
            {sops.map((sop, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-gray-200 hover:border-red-300 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <h3 className="font-bold text-xs text-gray-900 group-hover:text-red-700 transition-colors">
                    {sop.title}
                  </h3>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                    {sop.code} • {sop.category}
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Submit Operations Support Ticket */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-black text-gray-900 flex items-center border-b border-gray-100 pb-2">
            <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
            Dispatch & Incident Escalation Ticket
          </h2>

          <form onSubmit={handleSubmitTicket} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Issue Subject *</label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Temperature alarm on Medical Waybill DHL-8942-02"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#D40511]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Incident Category</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#D40511]"
              >
                <option value="Dispatch Exception">Dispatch Exception / Delay</option>
                <option value="Vehicle Breakdown">Vehicle Mechanical Failure</option>
                <option value="Cold Chain Alert">Cold-Chain Temperature Alert</option>
                <option value="Customer Dispute">Consignee Address Refusal</option>
                <option value="Billing Discrepancy">Billing & Rate Discrepancy</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Detailed Incident Notes *</label>
              <textarea
                rows={3}
                required
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Provide waybill number, current telemetry readings, and courier contact..."
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#D40511]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-[#D40511] hover:bg-red-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Escalation</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
