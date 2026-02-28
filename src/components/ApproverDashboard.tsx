import React, { useState, useEffect } from 'react';
import { User, Contract } from '../types';
import StatusBadge from './StatusBadge';
import ContractDetailModal from './ContractDetailModal';
import { Search, Eye, Check, X, MessageSquare } from 'lucide-react';

interface ApproverDashboardProps {
  currentUser: User;
}

export default function ApproverDashboard({ currentUser }: ApproverDashboardProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject', contract: Contract } | null>(null);
  const [comment, setComment] = useState('');

  const fetchContracts = () => {
    fetch('/api/contracts')
      .then(res => res.json())
      .then(data => {
        // Filter contracts assigned to this user
        const assigned = data.filter((c: Contract) => 
          (currentUser.role === 'DLM' && c.dlm_id === currentUser.id) ||
          (currentUser.role === 'LM' && c.lm_id === currentUser.id)
        );
        setContracts(assigned);
      });
  };

  useEffect(() => {
    fetchContracts();
  }, [currentUser]);

  const handleAction = async () => {
    if (!actionModal) return;
    
    const { type, contract } = actionModal;
    
    if (type === 'reject' && !comment.trim()) {
      alert('Reject reason is required');
      return;
    }

    try {
      await fetch(`/api/contracts/${contract.id}/${type}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: currentUser.role, comment })
      });
      
      setActionModal(null);
      setComment('');
      fetchContracts();
    } catch (error) {
      console.error('Action failed', error);
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (searchQuery && !c.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getMyStatus = (c: Contract) => currentUser.role === 'DLM' ? c.dlm_status : c.lm_status;
  const getOtherStatus = (c: Contract) => currentUser.role === 'DLM' ? c.lm_status : c.dlm_status;
  const otherRoleName = currentUser.role === 'DLM' ? 'LM' : 'DLM';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search assigned contracts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            Pending: {contracts.filter(c => getMyStatus(c) === 'pending').length}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Reviewed: {contracts.filter(c => getMyStatus(c) !== 'pending').length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContracts.map(contract => {
          const myStatus = getMyStatus(contract);
          const otherStatus = getOtherStatus(contract);
          
          return (
            <div key={contract.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-5 border-b border-slate-100 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{contract.employee_name}</h3>
                    <p className="text-sm text-slate-500">{contract.position}</p>
                  </div>
                  <StatusBadge status={myStatus} />
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Salary</span>
                    <span className="font-medium text-slate-900">${contract.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Type</span>
                    <span className="font-medium text-slate-900">{contract.contract_type}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-500">{otherRoleName} Status</span>
                    <StatusBadge status={otherStatus} />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button 
                  onClick={() => setSelectedContract(contract)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>
                
                {myStatus === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActionModal({ type: 'reject', contract })}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    <button 
                      onClick={() => setActionModal({ type: 'approve', contract })}
                      className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredContracts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
            No contracts assigned to you.
          </div>
        )}
      </div>

      {selectedContract && (
        <ContractDetailModal 
          contract={selectedContract} 
          onClose={() => setSelectedContract(null)} 
        />
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className={`px-6 py-4 border-b ${actionModal.type === 'approve' ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${actionModal.type === 'approve' ? 'text-green-800' : 'text-red-800'}`}>
                {actionModal.type === 'approve' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                {actionModal.type === 'approve' ? 'Approve Contract' : 'Reject Contract'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm">
                You are about to {actionModal.type} the contract for <span className="font-semibold text-slate-900">{actionModal.contract.employee_name}</span>.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comment {actionModal.type === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={actionModal.type === 'reject' ? "Please provide a reason for rejection..." : "Optional comment..."}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24 transition-all"
                  required={actionModal.type === 'reject'}
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => { setActionModal(null); setComment(''); }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAction}
                disabled={actionModal.type === 'reject' && !comment.trim()}
                className={`px-4 py-2 rounded-lg font-medium text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionModal.type === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' 
                    : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}
              >
                Confirm {actionModal.type === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
