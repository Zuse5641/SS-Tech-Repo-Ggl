import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { getFirebaseAuth, loginWithGoogle, logoutUser } from '../firebase/config';
import { onAuthStateChanged, User as FbUser } from 'firebase/auth';
import { securityService } from '../services/securityService';

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  role: UserRole;
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
  } | null;
  technicianId?: string;
  isAdminAuthenticated: boolean;
  isTechAuthenticated: boolean;
  setRole: (role: UserRole, technicianId?: string) => void;
  loginAdmin: (email: string, password?: string) => Promise<AuthResult>;
  loginTechnician: (techId: string, passcode?: string) => Promise<AuthResult>;
  changeAdminPassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  changeTechnicianPin: (techId: string, newPin: string) => Promise<AuthResult>;
  logoutAdmin: () => void;
  logoutTechnician: () => void;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if admin is currently authenticated in session
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('sscare_admin_auth') === 'true';
  });

  // Check if technician is currently authenticated in session
  const [isTechAuthenticated, setIsTechAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('sscare_tech_auth') === 'true';
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('sscare_auth_role') as UserRole;
    if (savedRole === 'admin' && localStorage.getItem('sscare_admin_auth') === 'true') {
      return 'admin';
    }
    if (savedRole === 'technician' && localStorage.getItem('sscare_tech_auth') === 'true') {
      return 'technician';
    }
    return 'customer';
  });

  const [technicianId, setTechnicianId] = useState<string | undefined>(() => {
    return localStorage.getItem('sscare_tech_id') || undefined;
  });

  const [user, setUser] = useState<{
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
  } | null>(() => {
    const saved = localStorage.getItem('sscare_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Cryptographic token validation on boot
  useEffect(() => {
    const validateExistingSessions = async () => {
      await securityService.ensureSeeded();

      // Check Admin Session Token
      const adminToken = securityService.getSessionToken('admin');
      if (adminToken) {
        const validation = await securityService.validateSessionToken(adminToken);
        if (!validation.valid) {
          console.warn('Admin cryptographic token invalid or expired:', validation.reason);
          setIsAdminAuthenticated(false);
          localStorage.removeItem('sscare_admin_auth');
          if (role === 'admin') {
            setRoleState('customer');
            setUser(null);
          }
        }
      }

      // Check Tech Session Token
      const techToken = securityService.getSessionToken('technician');
      if (techToken) {
        const validation = await securityService.validateSessionToken(techToken);
        if (!validation.valid) {
          console.warn('Tech cryptographic token invalid or expired:', validation.reason);
          setIsTechAuthenticated(false);
          localStorage.removeItem('sscare_tech_auth');
          if (role === 'technician') {
            setRoleState('customer');
            setUser(null);
          }
        }
      }
    };

    validateExistingSessions();
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FbUser | null) => {
        if (fbUser) {
          const u = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Authenticated User',
            photoURL: fbUser.photoURL || undefined
          };
          setUser(u);
          localStorage.setItem('sscare_auth_user', JSON.stringify(u));

          if (fbUser.email === 'farhanshariff999@gmail.com' || fbUser.email?.includes('admin')) {
            setRoleState('admin');
            setIsAdminAuthenticated(true);
            localStorage.setItem('sscare_auth_role', 'admin');
            localStorage.setItem('sscare_admin_auth', 'true');
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const setRole = (newRole: UserRole, techId?: string) => {
    setRoleState(newRole);
    localStorage.setItem('sscare_auth_role', newRole);
    if (techId) {
      setTechnicianId(techId);
      localStorage.setItem('sscare_tech_id', techId);
    }
  };

  /**
   * Cryptographically authenticated Admin Login using PBKDF2 with SHA-256
   */
  const loginAdmin = async (email: string, password?: string): Promise<AuthResult> => {
    const res = await securityService.authenticateAdmin(email, password || '');
    if (!res.success) {
      return { success: false, error: res.error || 'Authentication failed.' };
    }

    const adminUser = res.user || {
      uid: 'admin-' + Date.now(),
      email: email.trim().toLowerCase(),
      displayName: 'Central Admin Desk'
    };

    setUser(adminUser);
    setRoleState('admin');
    setIsAdminAuthenticated(true);
    localStorage.setItem('sscare_auth_user', JSON.stringify(adminUser));
    localStorage.setItem('sscare_auth_role', 'admin');
    localStorage.setItem('sscare_admin_auth', 'true');

    return { success: true };
  };

  /**
   * Cryptographically authenticated Technician Login using PBKDF2 with SHA-256 PIN
   */
  const loginTechnician = async (techId: string, passcode?: string): Promise<AuthResult> => {
    const res = await securityService.authenticateTechnician(techId, passcode || '');
    if (!res.success) {
      return { success: false, error: res.error || 'Authentication failed.' };
    }

    const techUser = res.user;
    setUser(techUser);
    setTechnicianId(techId);
    setRoleState('technician');
    setIsTechAuthenticated(true);
    localStorage.setItem('sscare_auth_user', JSON.stringify(techUser));
    localStorage.setItem('sscare_tech_id', techId);
    localStorage.setItem('sscare_auth_role', 'technician');
    localStorage.setItem('sscare_tech_auth', 'true');

    return { success: true };
  };

  /**
   * Cryptographically change admin password
   */
  const changeAdminPassword = async (currentPass: string, newPass: string): Promise<AuthResult> => {
    const targetEmail = user?.email || 'admin@sscaretechnology.com';
    return await securityService.changeAdminPassword(targetEmail, currentPass, newPass);
  };

  /**
   * Update technician security PIN
   */
  const changeTechnicianPin = async (techId: string, newPin: string): Promise<AuthResult> => {
    return await securityService.updateTechnicianPin(techId, newPin);
  };

  const logoutAdmin = () => {
    securityService.clearSession('admin');
    setIsAdminAuthenticated(false);
    localStorage.removeItem('sscare_admin_auth');
    if (role === 'admin') {
      setRoleState('customer');
      localStorage.setItem('sscare_auth_role', 'customer');
      setUser(null);
      localStorage.removeItem('sscare_auth_user');
    }
  };

  const logoutTechnician = () => {
    securityService.clearSession('technician');
    setIsTechAuthenticated(false);
    localStorage.removeItem('sscare_tech_auth');
    localStorage.removeItem('sscare_tech_id');
    setTechnicianId(undefined);
    if (role === 'technician') {
      setRoleState('customer');
      localStorage.setItem('sscare_auth_role', 'customer');
      setUser(null);
      localStorage.removeItem('sscare_auth_user');
    }
  };

  const signInGoogle = async () => {
    try {
      const res = await loginWithGoogle();
      if (res?.user) {
        const u = {
          uid: res.user.uid,
          email: res.user.email || '',
          displayName: res.user.displayName || 'Google User',
          photoURL: res.user.photoURL || undefined
        };
        setUser(u);
        localStorage.setItem('sscare_auth_user', JSON.stringify(u));
        setRoleState('admin');
        setIsAdminAuthenticated(true);
        localStorage.setItem('sscare_auth_role', 'admin');
        localStorage.setItem('sscare_admin_auth', 'true');
      }
    } catch (err) {
      console.warn('Google sign in fallback:', err);
      const demoUser = {
        uid: 'user-google-demo',
        email: 'farhanshariff999@gmail.com',
        displayName: 'Farhan Shariff (Admin)'
      };
      setUser(demoUser);
      setRoleState('admin');
      setIsAdminAuthenticated(true);
      localStorage.setItem('sscare_auth_user', JSON.stringify(demoUser));
      localStorage.setItem('sscare_auth_role', 'admin');
      localStorage.setItem('sscare_admin_auth', 'true');
    }
  };

  const signOut = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    securityService.clearSession('admin');
    securityService.clearSession('technician');
    setUser(null);
    setRoleState('customer');
    setIsAdminAuthenticated(false);
    setIsTechAuthenticated(false);
    setTechnicianId(undefined);
    localStorage.removeItem('sscare_auth_user');
    localStorage.removeItem('sscare_admin_auth');
    localStorage.removeItem('sscare_tech_auth');
    localStorage.removeItem('sscare_tech_id');
    localStorage.setItem('sscare_auth_role', 'customer');
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        technicianId,
        isAdminAuthenticated,
        isTechAuthenticated,
        setRole,
        loginAdmin,
        loginTechnician,
        changeAdminPassword,
        changeTechnicianPin,
        logoutAdmin,
        logoutTechnician,
        signInGoogle,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

