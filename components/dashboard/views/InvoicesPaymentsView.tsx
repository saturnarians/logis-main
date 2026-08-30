'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { InvoiceRecord } from '@/types/logistics';
import { 
  Receipt, 
  Plus, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileSpreadsheet,
  Download,
  CreditCard,
  Building
} from 'lucide-react';

export const InvoicesPaymentsView: React.FC = () => {
  const { invoices, createInvoice, updateInvoiceStatus } = useLogistics();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Invoice Form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [itemsSummary, setItemsSummary] = useState('');
  const [amountUsd, setAmountUsd] = useState(150.00);
  const [paymentType, setPaymentType] = useState<InvoiceRecord['paymentType']>('Contract 30D');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    const matchesSearch =
      !search ||
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.orderId.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalBilled = invoices.reduce((acc, inv) => acc + inv.amountUsd, 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid' || i.status === 'COD Collected').reduce((acc, inv) => acc + inv.amountUsd, 0);
  const totalPending = invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').reduce((acc, inv) => acc + inv.amountUsd, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !orderId) return;

    createInvoice({
      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId,
      customerName,
      customerEmail: customerEmail || 'billing@client-corp.com',
      amountUsd: Number(amountUsd),
      status: 'Pending',
      paymentType,
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: '2026-08-30',
      itemsSummary: itemsSummary || 'Express Courier Freight & Telematics Handling',
    });

    setShowAddModal(false);
    setCustomerName('');
    setCustomerEmail('');
    setOrderId('');
    setItemsSummary('');
  };

  const getStatusBadge = (status: InvoiceRecord['status']) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'COD Collected':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              BILLING & FINANCE
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Invoices, Waybill Billing & COD Collections
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reconcile enterprise corporate credit accounts, driver cash-on-delivery collections, and freight invoicing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#D40511] hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500">Total Billed Volume</span>
          <div className="text-2xl font-black text-gray-900 mt-1">${totalBilled.toLocaleString()}</div>
          <span className="text-[11px] text-gray-500">{invoices.length} invoices generated</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500">Settled & Collected</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">${totalPaid.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-700 font-bold">Paid + COD settlements</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500">Outstanding Receivable</span>
          <div className="text-2xl font-black text-amber-600 mt-1">${totalPending.toLocaleString()}</div>
          <span className="text-[11px] text-amber-700 font-bold">Pending 30-day net terms</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {['All', 'Paid', 'Pending', 'COD Collected', 'Overdue'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                statusFilter === st
                  ? 'bg-gray-900 text-[#FFCC00] shadow'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer, order ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-[#D40511]"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Linked Waybill</th>
                <th className="py-3 px-4">Amount ($USD)</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">
                    {inv.invoiceNo}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    <div>{inv.customerName}</div>
                    <span className="text-[10px] text-gray-400 font-normal">{inv.customerEmail}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#D40511] font-bold">
                    {inv.orderId}
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-sm text-gray-900">
                    ${inv.amountUsd.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-semibold">
                    {inv.paymentType}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500">
                    {inv.dueDate}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusBadge(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {inv.status !== 'Paid' ? (
                      <button
                        onClick={() => updateInvoiceStatus(inv.id, 'Paid')}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs"
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-mono">Paid {inv.paidAt || 'Recorded'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-black text-gray-900 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-[#D40511]" />
              Generate Freight Invoice
            </h2>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer / Account Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Acme Global Logistics"
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. accounts@acmeglobal.com"
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Linked Waybill / Order ID *</label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. DHL-8942-01"
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Amount ($USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amountUsd}
                    onChange={(e) => setAmountUsd(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Billing Channel</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Contract 30D">Contract 30D (Net 30)</option>
                    <option value="Credit Card">Credit Card Online</option>
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="Prepaid">Prepaid Account</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-[#D40511] text-white hover:bg-red-700 shadow"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
