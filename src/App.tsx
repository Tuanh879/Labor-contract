import React, { useState, useEffect } from 'react';
import { User, Contract } from './types';
import HRDashboard from './components/HRDashboard';
import ApproverDashboard from './components/ApproverDashboard';
import BODDashboard from './components/BODDashboard';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-slate-100">
          <div className="text-center mb-8">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">HR Contract Approval</h1>
            <p className="text-slate-500 mt-2">Select a role to continue</p>
          </div>
          
          <div className="space-y-3">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-medium text-slate-900 group-hover:text-blue-700">{user.name}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 group-hover:bg-blue-100 group-hover:text-blue-800">
                  {user.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Contract Approval</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{currentUser.name}</div>
              <div className="text-xs text-slate-500">{currentUser.role} • {currentUser.department}</div>
            </div>
            <button 
              onClick={() => setCurrentUser(null)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === 'HR' && <HRDashboard currentUser={currentUser} />}
        {(currentUser.role === 'DLM' || currentUser.role === 'LM') && <ApproverDashboard currentUser={currentUser} />}
        {currentUser.role === 'BOD' && <BODDashboard currentUser={currentUser} />}
      </main>
    </div>
  );
}
