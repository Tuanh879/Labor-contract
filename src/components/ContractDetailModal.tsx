import React from 'react';
import { Contract } from '../types';
import { X, CheckCircle2, Clock, XCircle, FileText, User, Calendar, DollarSign, Briefcase } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface ContractDetailModalProps {
  contract: Contract;
  onClose: () => void;
}

export default function ContractDetailModal({ contract, onClose }: ContractDetailModalProps) {
  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'rejected') return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-orange-500" />;
  };

  const isDone = contract.final_status === 'approved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Contract Details
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Employee Information</h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{contract.employee_name}</div>
                      <div className="text-xs text-slate-500">{contract.employee_id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-700">{contract.position}</div>
                      <div className="text-xs text-slate-500">{contract.department}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Contract Details</h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">${contract.salary.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">Monthly Salary</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-700">{contract.start_date} to {contract.end_date}</div>
                      <div className="text-xs text-slate-500">{contract.contract_type}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Timeline */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Approval Timeline</h3>
              <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
                
                {/* HR Upload */}
                <div className="relative">
                  <div className="absolute -left-[33px] bg-white p-1 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">HR Uploaded Contract</div>
                    <div className="text-xs text-slate-500">{new Date(contract.created_at).toLocaleString()}</div>
                  </div>
                </div>

                {/* DLM Approval */}
                <div className="relative">
                  <div className="absolute -left-[33px] bg-white p-1 rounded-full">
                    {getStatusIcon(contract.dlm_status)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                      Delivery Line Manager
                      <StatusBadge status={contract.dlm_status} />
                    </div>
                    {contract.dlm_updated_at && (
                      <div className="text-xs text-slate-500 mt-1">{new Date(contract.dlm_updated_at).toLocaleString()}</div>
                    )}
                    {contract.dlm_comment && (
                      <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        "{contract.dlm_comment}"
                      </div>
                    )}
                  </div>
                </div>

                {/* LM Approval */}
                <div className="relative">
                  <div className="absolute -left-[33px] bg-white p-1 rounded-full">
                    {getStatusIcon(contract.lm_status)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                      Line Manager
                      <StatusBadge status={contract.lm_status} />
                    </div>
                    {contract.lm_updated_at && (
                      <div className="text-xs text-slate-500 mt-1">{new Date(contract.lm_updated_at).toLocaleString()}</div>
                    )}
                    {contract.lm_comment && (
                      <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        "{contract.lm_comment}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Status */}
                <div className="relative">
                  <div className="absolute -left-[33px] bg-white p-1 rounded-full">
                    {contract.final_status === 'approved' ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    ) : contract.final_status === 'rejected' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Final Status</div>
                    <div className="mt-1">
                      <StatusBadge status={contract.final_status === 'approved' ? 'done' : contract.final_status} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
