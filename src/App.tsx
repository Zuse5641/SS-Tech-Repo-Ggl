import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { TopHookBanner } from './components/layout/TopHookBanner';
import { Footer } from './components/layout/Footer';
import { PublicPage } from './pages/PublicPage';
import { RepairStatusPage } from './pages/RepairStatusPage';
import { TechnicianPortal } from './pages/TechnicianPortal';
import { TechnicianLoginPage } from './pages/TechnicianLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { dataService } from './services/dataService';
import {
  BusinessSettings,
  ServiceArea,
  CustomerReview,
  FAQItem,
  RepairRequestLead
} from './types';
import { Search, X } from 'lucide-react';

function AppContent() {
  const { role, isAdminAuthenticated, isTechAuthenticated } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [settings, setSettings] = useState<BusinessSettings>(dataService.getSettings());
  const [areas, setAreas] = useState<ServiceArea[]>(dataService.getServiceAreas());
  const [reviews, setReviews] = useState<CustomerReview[]>(dataService.getReviews());
  const [faqs, setFaqs] = useState<FAQItem[]>(dataService.getFAQs());

  // Track Repair Quick Modal
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackInputId, setTrackInputId] = useState('');
  const [activeTrackingId, setActiveTrackingId] = useState<string>('');

  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setSettings(dataService.getSettings());
      setAreas(dataService.getServiceAreas());
      setReviews(dataService.getReviews());
      setFaqs(dataService.getFAQs());
    });
    return () => unsub();
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (route: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
  };

  const handleLeadCreated = (lead: RepairRequestLead) => {
    console.log('Lead created:', lead.id);
  };

  const handleTrackRequest = (requestId: string) => {
    setActiveTrackingId(requestId);
    navigateTo('/track');
    setTrackModalOpen(false);
  };

  const handleTrackModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInputId.trim()) return;
    setActiveTrackingId(trackInputId.trim().toUpperCase());
    navigateTo('/track');
    setTrackModalOpen(false);
  };

  const isStaffRoute =
    currentRoute.startsWith('/admin') ||
    currentRoute.startsWith('/technician') ||
    currentRoute.startsWith('/tech');

  // Dedicated, isolated Staff Portals (Admin & Technician)
  if (isStaffRoute) {
    return (
      <div className="min-h-screen bg-[#07080c] text-gray-200 font-['Plus_Jakarta_Sans'] selection:bg-[#FF5A1F] selection:text-white">
        {currentRoute.startsWith('/admin') && (
          isAdminAuthenticated ? (
            <AdminDashboard
              onNavigateHome={() => navigateTo('/')}
              onLogout={() => navigateTo('/admin')}
            />
          ) : (
            <AdminLoginPage
              onLoginSuccess={() => navigateTo('/admin')}
              onNavigateHome={() => navigateTo('/')}
            />
          )
        )}

        {(currentRoute.startsWith('/technician') || currentRoute.startsWith('/tech')) && (
          isTechAuthenticated ? (
            <TechnicianPortal
              onNavigateHome={() => navigateTo('/')}
              onLogout={() => navigateTo('/technician')}
            />
          ) : (
            <TechnicianLoginPage
              onLoginSuccess={() => navigateTo('/technician')}
              onNavigateHome={() => navigateTo('/')}
              onNavigateAdmin={() => navigateTo('/admin')}
            />
          )
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-200 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#FF5A1F] selection:text-white pb-16 md:pb-0">
      {/* Top Promotional Dynamic Hook Banner */}
      <TopHookBanner
        onClaimClick={(cat) => {
          if (currentRoute !== '/') {
            navigateTo('/');
            setTimeout(() => {
              const tab = document.getElementById(`hook-device-tab-${cat || 'phones'}`);
              if (tab) tab.click();
              const el = document.getElementById('free-consultation-hook');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 120);
          } else {
            const tab = document.getElementById(`hook-device-tab-${cat || 'phones'}`);
            if (tab) tab.click();
            const el = document.getElementById('free-consultation-hook');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Top Navbar */}
      <Navbar
        settings={settings}
        activeRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenTrackModal={() => setTrackModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRoute === '/track' ? (
          <RepairStatusPage
            initialRequestId={activeTrackingId}
            onNavigateHome={() => navigateTo('/')}
          />
        ) : (
          <PublicPage
            currentRoute={currentRoute}
            settings={settings}
            areas={areas}
            reviews={reviews}
            faqs={faqs}
            onNavigate={navigateTo}
            onLeadCreated={handleLeadCreated}
            onTrackRequest={handleTrackRequest}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer settings={settings} areas={areas} onNavigate={navigateTo} />

      {/* Floating WhatsApp Quick Connect Button (Desktop & Tablet) */}
      <FloatingWhatsApp settings={settings} />

      {/* Mobile Dynamic Bottom Action Dock */}
      <MobileBottomNav
        settings={settings}
        activeRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenTrackModal={() => setTrackModalOpen(true)}
      />

      {/* Quick Track Repair Modal */}
      {trackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141724] border border-[#2b3046] rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#FF5A1F]" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Track Existing Repair Status
                </h3>
              </div>
              <button
                onClick={() => setTrackModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Enter the unique Request ID provided when you booked your repair (e.g. SSC-20260911-001).
            </p>

            <form onSubmit={handleTrackModalSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="e.g. SSC-20260911-001"
                value={trackInputId}
                onChange={(e) => setTrackInputId(e.target.value)}
                className="w-full bg-[#1b1e2c] border border-gray-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-mono uppercase focus:outline-none focus:border-[#FF5A1F]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#e04812] text-white text-xs font-bold"
                >
                  Track Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
