import React, { useState, useEffect } from 'react';
import { User, Contract } from '../types';
import StatusBadge from './StatusBadge';
import ContractDetailModal from './ContractDetailModal';
import { Search, Upload, Download, Filter, FileText, Eye, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface HRDashboardProps {
  currentUser: User;
}

export default function HRDashboard({ currentUser }: HRDashboardProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContracts = () => {
    fetch('/api/contracts')
      .then(res => res.json())
      .then(data => setContracts(data));
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleUpload = () => {
    // Simulate uploading a new batch of contracts
    const newContracts = [
      {
        id: `c${Date.now()}`,
        month: '2023-11',
        employee_name: 'David Lee',
        employee_id: 'EMP004',
        position: 'Product Manager',
        department: 'Product',
        salary: 7000,
        contract_type: 'Full-time',
        start_date: '2023-11-01',
        end_date: '2024-10-31',
        dlm_id: 'dlm1',
        lm_id: 'lm1',
        hr_owner_id: currentUser.id
      }
    ];

    fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contracts: newContracts })
    }).then(() => fetchContracts());
  };

  const filteredContracts = contracts.filter(c => {
    if (filterStatus !== 'all' && c.final_status !== filterStatus) return false;
    if (searchQuery && !c.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: contracts.length,
    pending: contracts.filter(c => c.final_status === 'pending').length,
    approved: contracts.filter(c => c.final_status === 'approved').length,
    rejected: contracts.filter(c => c.final_status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Done</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleUpload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20"
          >
            <Upload className="w-4 h-4" />
            Upload Sheet
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Contracts', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Approved (Done)', value: stats.approved, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">DLM Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">LM Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Final Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map(contract => (
                <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{contract.employee_name}</div>
                    <div className="text-xs text-slate-500">{contract.employee_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{contract.position}</div>
                    <div className="text-xs text-slate-500">{contract.department}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    ${contract.salary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={contract.dlm_status} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={contract.lm_status} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={contract.final_status === 'approved' ? 'done' : contract.final_status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedContract(contract)}
                      className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No contracts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedContract && (
        <ContractDetailModal 
          contract={selectedContract} 
          onClose={() => setSelectedContract(null)} 
        />
      )}
    </div>
  );
}
