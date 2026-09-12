import React, { useState } from 'react';
import {
  Wrench,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Phone,
  Smartphone,
  Laptop,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TechnicianLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
}

const REGISTERED_TECHNICIANS = [
  {
    id: 'tech-01',
    name: 'Karthik Ramanathan',
    role: 'Lead Master Tech',
    specialty: 'Smartphones & Displays',
    pin: '1234',
    phone: '+91 98450 11223'
  },
  {
    id: 'tech-02',
    name: 'Syed Imran',
    role: 'Senior Chip Engineer',
    specialty: 'MacBook & Laptops',
    pin: '1234',
    phone: '+91 97420 33445'
  },
  {
    id: 'tech-03',
    name: 'Praveen Kumar B',
    role: 'Hardware Specialist',
    specialty: 'Gaming Consoles & Tablets',
    pin: '1234',
    phone: '+91 99010 55667'
  },
  {
    id: 'tech-04',
    name: 'Deepak V',
    role: 'Diagnostic Master',
    specialty: 'Gaming PCs & Workstations',
    pin: '1234',
    phone: '+91 96320 77889'
  }
];

export const TechnicianLoginPage: React.FC<TechnicianLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
  onNavigateAdmin
}) => {
  const { loginTechnician } = useAuth();
  const [selectedTechId, setSelectedTechId] = useState('tech-01');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pin.trim()) {
      setError('Please enter your 4-digit security PIN.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginTechnician(selectedTechId, pin.trim());
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.error || 'Invalid Technician ID or PIN.');
      }
    } catch (err: any) {
      setError(err?.message || 'Cryptographic PIN verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (techId: string) => {
    setSelectedTechId(techId);
    setPin('1234');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#07080c] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top back navigation */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 mb-6 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Customer Website</span>
        </button>

        <button
          onClick={onNavigateAdmin}
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Central Admin Login</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-[#12141f] border border-[#23283b] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400 shadow-lg shadow-sky-500/10 mb-4">
              <Wrench className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="text-xl font-black text-white font-['Space_Grotesk'] tracking-tight">
                SS CARE
              </span>
              <span className="text-xl font-black text-[#FF5A1F]">DISPATCH</span>
            </div>

            <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Field Technician Portal
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Doorstep work orders, customer arrival OTPs, digital signatures & invoice completion
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-[11px] text-sky-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>PBKDF2 / SHA-256 PIN Security Active</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Profile Selector */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Select Field Engineer Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {REGISTERED_TECHNICIANS.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => handleQuickSelect(tech.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedTechId === tech.id
                      ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg shadow-sky-500/10'
                      : 'bg-[#171926] border-[#252a3d] text-gray-400 hover:border-gray-600 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate">{tech.name}</span>
                    <span className="text-[10px] font-mono font-semibold text-sky-400">{tech.id}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">{tech.specialty}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Technician Security PIN
                </label>
                <span className="text-[11px] text-gray-500">Default Demo PIN: 1234</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-[#171a27] border border-[#2b3147] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white font-mono tracking-widest focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-50 mt-3"
            >
              <span>{isLoading ? 'Connecting to Dispatch...' : 'Access Assigned Work Orders'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-800 text-center">
            <p className="text-[11px] text-gray-500">
              Only authorized SS Care engineers dispatched to Bangalore zones have access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
