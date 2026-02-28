import React, { useState, useEffect } from 'react';
import { User, Contract } from './types';
import HRDashboard from './components/HRDashboard';
import ApproverDashboard from './components/ApproverDashboard';
import BODDashboard from './components/BODDashboard';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setError('');
    } else {
      setError('User not found. Try hr@company.com, dlm1@company.com, lm1@company.com, or bod@company.com');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-slate-100">
          <div className="text-center mb-8">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">HR Contract Approval</h1>
            <p className="text-slate-500 mt-2">Sign in to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-600/20"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-3 font-medium">Demo Accounts:</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span className="font-medium">HR Admin:</span> hr@company.com</div>
              <div className="flex justify-between"><span className="font-medium">DLM:</span> dlm1@company.com</div>
              <div className="flex justify-between"><span className="font-medium">Line Manager:</span> lm1@company.com</div>
              <div className="flex justify-between"><span className="font-medium">BOD:</span> bod@company.com</div>
            </div>
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
