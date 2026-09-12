import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome
}) => {
  const { loginAdmin, signInGoogle } = useAuth();
  const [email, setEmail] = useState('admin@sscaretechnology.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoStatus, setCryptoStatus] = useState<string>('PBKDF2 SHA-256 (100,000 Rounds) Active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your administrator email.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your admin password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAdmin(email.trim(), password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.error || 'Invalid administrator credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Cryptographic authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAccess = async () => {
    setEmail('admin@sscaretechnology.com');
    setPassword('admin123');
    setIsLoading(true);
    try {
      const res = await loginAdmin('admin@sscaretechnology.com', 'admin123');
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.error || 'Demo authentication failed.');
      }
    } catch {
      setError('Failed to authenticate demo admin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInGoogle();
      onLoginSuccess();
    } catch {
      setError('Google Sign-in failed. Use email/password login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top back link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-6">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SS Care Customer Website</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Card */}
        <div className="bg-[#12141f] border border-[#262c40] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10 mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="text-xl font-black text-white font-['Space_Grotesk'] tracking-tight">
                SS CARE
              </span>
              <span className="text-xl font-black text-[#FF5A1F]">TECH</span>
            </div>

            <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Central Administration Portal
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Authorized operations, dispatch routing & pricing management
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{cryptoStatus}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sscaretechnology.com"
                  className="w-full bg-[#171a27] border border-[#2b3147] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Password
                </label>
                <span className="text-[11px] text-gray-500">Security PIN / Passkey</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#171a27] border border-[#2b3147] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#e04812] hover:brightness-110 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FF5A1F]/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Verifying Admin...' : 'Sign In to Admin Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="mt-6 pt-5 border-t border-gray-800 space-y-3">
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#191c2c] hover:bg-[#22263b] border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Demo Admin Login</span>
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#161824] hover:bg-[#1f2233] border border-gray-700 text-gray-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Sign in with Google Workspace</span>
            </button>
          </div>

          <p className="text-[10px] text-center text-gray-500 mt-6 leading-relaxed">
            Restricted access. All administrative actions and technician assignments are logged for compliance.
          </p>
        </div>
      </div>
    </div>
  );
};
