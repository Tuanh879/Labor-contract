import React, { useState, useEffect } from 'react';
import { User, Contract } from '../types';
import StatusBadge from './StatusBadge';
import ContractDetailModal from './ContractDetailModal';
import { Search, Download, FileText, CheckCircle2, Eye, TrendingUp, Users } from 'lucide-react';

interface BODDashboardProps {
  currentUser: User;
}

export default function BODDashboard({ currentUser }: BODDashboardProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContracts = () => {
    fetch('/api/contracts')
      .then(res => res.json())
      .then(data => {
        // BOD only sees approved contracts
        setContracts(data.filter((c: Contract) => c.final_status === 'approved'));
      });
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const filteredContracts = contracts.filter(c => {
    if (searchQuery && !c.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalSalary = contracts.reduce((sum, c) => sum + c.salary, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search approved contracts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all"
          />
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20 w-full sm:w-auto">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{contracts.length}</div>
            <div className="text-sm font-medium text-slate-500">Approved Contracts</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">${totalSalary.toLocaleString()}</div>
            <div className="text-sm font-medium text-slate-500">Total Monthly Salary</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{new Set(contracts.map(c => c.department)).size}</div>
            <div className="text-sm font-medium text-slate-500">Departments</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Date</th>
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
                    <div className="text-xs text-slate-500">{contract.contract_type}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {contract.department}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    ${contract.salary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {contract.lm_updated_at ? new Date(contract.lm_updated_at).toLocaleDateString() : '-'}
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
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No approved contracts found.
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
