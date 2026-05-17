import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const Login = ({ setUser }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('passenger');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    username: '', 
    phone: '', 
    emp_id: '',
    vehicle_number: '' // Added this to initial state
  });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'https://rydo-backend-4yr6.onrender.com').replace(/\/login\/?$/, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, { ...formData, role });
      localStorage.setItem('rydo_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Connection to System Failed";
      alert(`SYSTEM_ERROR: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-base overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-400 rounded-lg flex items-center justify-center">
              <span className="text-surface-base font-black text-lg leading-none">R</span>
            </div>
            <span className="text-white font-black text-2xl tracking-[-0.05em]">RYDO</span>
          </div>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-2xl p-8 shadow-card text-white">
          <div className="mb-8">
            <h1 className="text-[22px] font-bold tracking-tight">
              {isSignup ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-surface-muted text-sm mt-1">
              {isSignup ? 'Join Rydo to start your journey.' : 'Sign in to access your dashboard.'}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-surface-base border border-surface-border p-1 rounded-xl mb-6">
            {['passenger', 'driver'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all ${
                  role === r ? 'bg-amber-400 text-surface-base' : 'text-surface-muted hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode='wait'>
              {isSignup && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden pb-1"
                >
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-surface-muted uppercase tracking-widest">Username</label>
                    <input type="text" className="w-full bg-surface-base border border-surface-border px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400" placeholder="e.g. Daemon" required onChange={e => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-surface-muted uppercase tracking-widest">Phone Number</label>
                    <input type="text" className="w-full bg-surface-base border border-surface-border px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400" placeholder="+92 300 0000000" required onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  
                  {/* Conditional Driver Fields */}
                  {role === 'driver' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest italic">Employee Verification ID</label>
                        <input type="text" className="w-full bg-surface-base border border-amber-400/30 px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400" placeholder="Enter employee id" required onChange={e => setFormData({ ...formData, emp_id: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-surface-muted uppercase tracking-widest">Vehicle Plate Number</label>
                        <input type="text" className="w-full bg-surface-base border border-surface-border px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400" placeholder="e.g. ABC-1234" required onChange={e => setFormData({ ...formData, vehicle_number: e.target.value })} />
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-surface-muted uppercase tracking-widest">Email</label>
              <input type="email" className="w-full bg-surface-base border border-surface-border px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400" placeholder="AegonT6@example.com" required onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-semibold text-surface-muted uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-surface-base border border-surface-border px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400 pr-12"
                  placeholder="••••••••"
                  required
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-muted hover:text-amber-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-amber-400 text-surface-base font-bold rounded-xl hover:bg-amber-300 transition-all text-sm disabled:opacity-50 mt-2">
              {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Continue'}
            </button>
          </form>

          <p className="text-center mt-6 text-surface-muted text-xs">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <span onClick={() => setIsSignup(!isSignup)} className="text-amber-400 font-semibold ml-1.5 cursor-pointer hover:text-amber-300">
              {isSignup ? 'Log in' : 'Sign up'}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;