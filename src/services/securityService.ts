/**
 * Cryptographic Authentication & Security Service
 * Implements PBKDF2 with SHA-256, cryptographic salting, constant-time verification,
 * tamper-resistant session tokens, and security audit logging.
 */

export interface UserSessionPayload {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'technician';
  technicianId?: string;
  iat: number;
  exp: number;
  nonce: string;
}

export interface StoredCredential {
  identifier: string; // email or techId
  role: 'admin' | 'technician';
  displayName: string;
  salt: string; // 16 bytes hex
  hash: string; // PBKDF2-SHA256 hex digest
  updatedAt: string;
  failedAttempts: number;
  lockedUntil?: number;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'PASSWORD_CHANGED' | 'PIN_CHANGED' | 'ACCOUNT_LOCKED' | 'SESSION_EXPIRED';
  role: 'admin' | 'technician';
  identifier: string;
  details: string;
  clientInfo?: string;
}

const STORAGE_KEYS = {
  CREDENTIALS: 'sscare_secure_credentials_v2',
  AUDIT_LOGS: 'sscare_security_audit_logs_v2',
  ADMIN_TOKEN: 'sscare_admin_token_v2',
  TECH_TOKEN: 'sscare_tech_token_v2',
  DEVICE_KEY: 'sscare_device_master_key_v2'
};

// 12-hour session expiry
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

class SecurityService {
  private masterKey: string = '';
  private isInitialized = false;

  constructor() {
    this.initMasterKey();
  }

  /**
   * Initialize or retrieve local device master key for HMAC session signing
   */
  private initMasterKey() {
    if (typeof window === 'undefined') return;
    let key = localStorage.getItem(STORAGE_KEYS.DEVICE_KEY);
    if (!key) {
      key = this.generateRandomHex(32);
      localStorage.setItem(STORAGE_KEYS.DEVICE_KEY, key);
    }
    this.masterKey = key;
  }

  /**
   * Cryptographically secure random hex generator
   */
  public generateRandomHex(byteCount = 16): string {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const bytes = new Uint8Array(byteCount);
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    // Fallback pseudo-random
    let s = '';
    for (let i = 0; i < byteCount * 2; i++) {
      s += Math.floor(Math.random() * 16).toString(16);
    }
    return s;
  }

  /**
   * PBKDF2 with SHA-256 derivation using Web Crypto API
   * Falling back to SHA-256 rounds if Web Crypto is restricted
   */
  public async hashPasswordWithSalt(password: string, salt: string): Promise<string> {
    const enc = new TextEncoder();
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      try {
        const keyMaterial = await window.crypto.subtle.importKey(
          'raw',
          enc.encode(password),
          { name: 'PBKDF2' },
          false,
          ['deriveBits']
        );
        const derivedBits = await window.crypto.subtle.deriveBits(
          {
            name: 'PBKDF2',
            salt: enc.encode(salt + '_sscare_salt_pepper'),
            iterations: 100000,
            hash: 'SHA-256'
          },
          keyMaterial,
          256
        );
        return Array.from(new Uint8Array(derivedBits))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      } catch (e) {
        console.warn('Web Crypto PBKDF2 fallback to SHA-256 digest:', e);
      }
    }

    // SHA-256 digest fallback
    return this.sha256Hex(password + ':' + salt + ':_sscare_salt_pepper');
  }

  /**
   * SHA-256 helper
   */
  private async sha256Hex(message: string): Promise<string> {
    const enc = new TextEncoder();
    const data = enc.encode(message);
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      try {
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      } catch {
        // fallback to JS sha256
      }
    }
    // Simple fast fallback
    return this.pseudoSha256(message);
  }

  /**
   * Pure JS SHA-256 fallback implementation
   */
  private pseudoSha256(ascii: string): string {
    function rightRotate(value: number, amount: number) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i, j;
    const result = '';
    const words: number[] = [];
    const asciiBitLength = ascii.length * 8;
    let hash: number[] = [];
    const k: number[] = [];
    let primeCounter = 0;

    const isPrime = (n: number) => {
      for (let factor = 2; factor * factor <= n; factor++) {
        if (n % factor === 0) return false;
      }
      return true;
    };

    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (isPrime(candidate)) {
        if (primeCounter < 8) {
          hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        }
        k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        primeCounter++;
      }
    }

    words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
    words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

    for (i = 0; i < ascii.length; i++) {
      words[i >> 2] |= ascii.charCodeAt(i) << (24 - (i % 4) * 8);
    }

    for (j = 0; j < words.length; j += 16) {
      const w = words.slice(j, j + 16);
      const oldHash = hash.slice(0);

      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15] || 0;
        const w2 = w[i - 2] || 0;
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[i] = i < 16 ? w[i] || 0 : ((w[i - 16] + s0 + (w[i - 7] || 0) + s1) | 0);

        const s1_ch = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
        const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        const temp1 = (hash[7] + s1_ch + ch + k[i] + w[i]) | 0;
        const s0_maj = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
        const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        const temp2 = (s0_maj + maj) | 0;

        hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j >= 0; j--) {
        const b = (hash[i] >> (8 * j)) & 255;
        result.concat((b < 16 ? '0' : '') + b.toString(16));
      }
    }

    return hash.map((h) => (h >>> 0).toString(16).padStart(8, '0')).join('');
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
      mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
  }

  /**
   * Ensure standard credentials store is seeded with salted PBKDF2 hashes
   */
  public async ensureSeeded(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;

    const existing = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    if (!existing) {
      const now = new Date().toISOString();
      const credentials: Record<string, StoredCredential> = {};

      // Seed Admin accounts
      const adminSalt = this.generateRandomHex(16);
      const adminHash = await this.hashPasswordWithSalt('admin123', adminSalt);

      credentials['admin@sscaretechnology.com'] = {
        identifier: 'admin@sscaretechnology.com',
        role: 'admin',
        displayName: 'Central Admin Desk',
        salt: adminSalt,
        hash: adminHash,
        updatedAt: now,
        failedAttempts: 0
      };

      // Also register farhanshariff999@gmail.com with same password
      const farhanSalt = this.generateRandomHex(16);
      const farhanHash = await this.hashPasswordWithSalt('admin123', farhanSalt);

      credentials['farhanshariff999@gmail.com'] = {
        identifier: 'farhanshariff999@gmail.com',
        role: 'admin',
        displayName: 'Farhan Shariff (Admin)',
        salt: farhanSalt,
        hash: farhanHash,
        updatedAt: now,
        failedAttempts: 0
      };

      // Seed Technician accounts (Default PIN: 1234)
      const techs = [
        { id: 'tech-01', name: 'Karthik Ramanathan' },
        { id: 'tech-02', name: 'Syed Imran' },
        { id: 'tech-03', name: 'Praveen Kumar B' },
        { id: 'tech-04', name: 'Deepak V' }
      ];

      for (const t of techs) {
        const techSalt = this.generateRandomHex(16);
        const techHash = await this.hashPasswordWithSalt('1234', techSalt);
        credentials[t.id] = {
          identifier: t.id,
          role: 'technician',
          displayName: t.name,
          salt: techSalt,
          hash: techHash,
          updatedAt: now,
          failedAttempts: 0
        };
      }

      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
    }
    this.isInitialized = true;
  }

  private getCredentialsStore(): Record<string, StoredCredential> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveCredentialsStore(store: Record<string, StoredCredential>): void {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(store));
  }

  /**
   * Authenticate Admin with email + password using PBKDF2 salted hash comparison
   */
  public async authenticateAdmin(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: any; token?: string }> {
    await this.ensureSeeded();
    const cleanEmail = email.trim().toLowerCase();
    const store = this.getCredentialsStore();

    // Check account existence
    let credential = store[cleanEmail];
    if (!credential && cleanEmail.includes('admin')) {
      // Fallback matching for default admin
      credential = store['admin@sscaretechnology.com'];
    }

    if (!credential || credential.role !== 'admin') {
      this.recordAuditLog('LOGIN_FAILURE', 'admin', cleanEmail, 'Unknown admin account');
      return { success: false, error: 'Invalid administrator email or passkey.' };
    }

    // Check lockout
    const now = Date.now();
    if (credential.lockedUntil && credential.lockedUntil > now) {
      const remainingSecs = Math.ceil((credential.lockedUntil - now) / 1000);
      return {
        success: false,
        error: `Account temporarily locked due to excessive failed attempts. Please retry in ${remainingSecs} seconds.`
      };
    }

    // Hash user input with stored salt
    const computedHash = await this.hashPasswordWithSalt(password, credential.salt);
    const isMatch = this.constantTimeCompare(computedHash, credential.hash);

    if (!isMatch) {
      credential.failedAttempts = (credential.failedAttempts || 0) + 1;
      if (credential.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        credential.lockedUntil = now + LOCKOUT_DURATION_MS;
        this.recordAuditLog('ACCOUNT_LOCKED', 'admin', cleanEmail, 'Max 5 attempts exceeded. Locked for 60s.');
      }
      this.saveCredentialsStore(store);
      this.recordAuditLog('LOGIN_FAILURE', 'admin', cleanEmail, 'Incorrect password supplied');
      return {
        success: false,
        error: `Invalid credentials. (${MAX_FAILED_ATTEMPTS - (credential.failedAttempts % MAX_FAILED_ATTEMPTS)} attempt(s) remaining)`
      };
    }

    // Reset failed counter
    credential.failedAttempts = 0;
    credential.lockedUntil = undefined;
    this.saveCredentialsStore(store);

    const user = {
      uid: 'admin-' + cleanEmail.replace(/[^a-z0-9]/g, '-'),
      email: cleanEmail,
      displayName: credential.displayName || 'SS Care Administrator'
    };

    const token = await this.createSessionToken({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: 'admin',
      iat: now,
      exp: now + SESSION_TTL_MS,
      nonce: this.generateRandomHex(8)
    });

    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
    this.recordAuditLog('LOGIN_SUCCESS', 'admin', cleanEmail, 'SHA-256 authenticated successfully');

    return { success: true, user, token };
  }

  /**
   * Authenticate Technician using techId and 4-digit PIN
   */
  public async authenticateTechnician(
    techId: string,
    pin: string
  ): Promise<{ success: boolean; error?: string; user?: any; token?: string }> {
    await this.ensureSeeded();
    const cleanId = techId.trim().toLowerCase();
    const store = this.getCredentialsStore();
    const credential = store[cleanId];

    if (!credential || credential.role !== 'technician') {
      this.recordAuditLog('LOGIN_FAILURE', 'technician', cleanId, 'Unknown technician ID');
      return { success: false, error: 'Technician ID not registered on dispatch network.' };
    }

    // Check lockout
    const now = Date.now();
    if (credential.lockedUntil && credential.lockedUntil > now) {
      const remainingSecs = Math.ceil((credential.lockedUntil - now) / 1000);
      return {
        success: false,
        error: `Technician portal locked due to failed PIN attempts. Retry in ${remainingSecs} seconds.`
      };
    }

    // Hash PIN with stored salt
    const computedHash = await this.hashPasswordWithSalt(pin, credential.salt);
    const isMatch = this.constantTimeCompare(computedHash, credential.hash);

    if (!isMatch) {
      credential.failedAttempts = (credential.failedAttempts || 0) + 1;
      if (credential.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        credential.lockedUntil = now + LOCKOUT_DURATION_MS;
        this.recordAuditLog('ACCOUNT_LOCKED', 'technician', cleanId, 'Max attempts exceeded. Locked for 60s.');
      }
      this.saveCredentialsStore(store);
      this.recordAuditLog('LOGIN_FAILURE', 'technician', cleanId, 'Incorrect PIN provided');
      return {
        success: false,
        error: `Incorrect security PIN. (${MAX_FAILED_ATTEMPTS - (credential.failedAttempts % MAX_FAILED_ATTEMPTS)} attempt(s) remaining)`
      };
    }

    credential.failedAttempts = 0;
    credential.lockedUntil = undefined;
    this.saveCredentialsStore(store);

    const user = {
      uid: cleanId,
      email: `${cleanId}@sscaretechnology.com`,
      displayName: credential.displayName
    };

    const token = await this.createSessionToken({
      uid: cleanId,
      email: user.email,
      displayName: user.displayName,
      role: 'technician',
      technicianId: cleanId,
      iat: now,
      exp: now + SESSION_TTL_MS,
      nonce: this.generateRandomHex(8)
    });

    localStorage.setItem(STORAGE_KEYS.TECH_TOKEN, token);
    this.recordAuditLog('LOGIN_SUCCESS', 'technician', cleanId, 'SHA-256 PIN authenticated');

    return { success: true, user, token };
  }

  /**
   * Change Admin Password (cryptographically validates current password first)
   */
  public async changeAdminPassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    await this.ensureSeeded();
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters in length.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const store = this.getCredentialsStore();
    let credential = store[cleanEmail] || store['admin@sscaretechnology.com'];

    if (!credential) {
      return { success: false, error: 'Admin account not found.' };
    }

    // Verify current password
    const currentComputed = await this.hashPasswordWithSalt(currentPassword, credential.salt);
    if (!this.constantTimeCompare(currentComputed, credential.hash)) {
      this.recordAuditLog('LOGIN_FAILURE', 'admin', cleanEmail, 'Failed current password verification during password change');
      return { success: false, error: 'Current password is incorrect. Verification failed.' };
    }

    // Generate fresh salt and compute new PBKDF2 hash
    const newSalt = this.generateRandomHex(16);
    const newHash = await this.hashPasswordWithSalt(newPassword, newSalt);

    credential.salt = newSalt;
    credential.hash = newHash;
    credential.updatedAt = new Date().toISOString();
    credential.failedAttempts = 0;

    store[cleanEmail] = credential;
    this.saveCredentialsStore(store);

    this.recordAuditLog('PASSWORD_CHANGED', 'admin', cleanEmail, 'Admin password rotated with new cryptographic salt');
    return { success: true };
  }

  /**
   * Update Technician PIN
   */
  public async updateTechnicianPin(
    techId: string,
    newPin: string
  ): Promise<{ success: boolean; error?: string }> {
    await this.ensureSeeded();
    if (!/^\d{4,6}$/.test(newPin.trim())) {
      return { success: false, error: 'Technician PIN must be 4 to 6 numeric digits.' };
    }

    const cleanId = techId.trim().toLowerCase();
    const store = this.getCredentialsStore();
    const credential = store[cleanId];

    if (!credential) {
      return { success: false, error: `Technician ${techId} not found in credentials store.` };
    }

    const newSalt = this.generateRandomHex(16);
    const newHash = await this.hashPasswordWithSalt(newPin.trim(), newSalt);

    credential.salt = newSalt;
    credential.hash = newHash;
    credential.updatedAt = new Date().toISOString();
    credential.failedAttempts = 0;

    store[cleanId] = credential;
    this.saveCredentialsStore(store);

    this.recordAuditLog('PIN_CHANGED', 'technician', cleanId, `Security PIN updated by Admin`);
    return { success: true };
  }

  /**
   * Create tamper-resistant session token signed with device master key
   */
  private async createSessionToken(payload: UserSessionPayload): Promise<string> {
    const payloadStr = JSON.stringify(payload);
    const b64Payload = btoa(unescape(encodeURIComponent(payloadStr)));
    const signature = await this.sha256Hex(`${b64Payload}.${this.masterKey}`);
    return `ssc_${b64Payload}.${signature}`;
  }

  /**
   * Validate and decode session token
   */
  public async validateSessionToken(
    token: string
  ): Promise<{ valid: boolean; payload?: UserSessionPayload; reason?: string }> {
    if (!token || !token.startsWith('ssc_')) {
      return { valid: false, reason: 'Invalid token structure' };
    }

    try {
      const raw = token.slice(4);
      const [b64Payload, signature] = raw.split('.');
      if (!b64Payload || !signature) {
        return { valid: false, reason: 'Malformed token' };
      }

      // Verify signature
      const expectedSignature = await this.sha256Hex(`${b64Payload}.${this.masterKey}`);
      if (!this.constantTimeCompare(signature, expectedSignature)) {
        return { valid: false, reason: 'Cryptographic signature mismatch (tampering detected)' };
      }

      // Parse payload
      const payloadStr = decodeURIComponent(escape(atob(b64Payload)));
      const payload: UserSessionPayload = JSON.parse(payloadStr);

      // Check expiration
      if (Date.now() > payload.exp) {
        return { valid: false, reason: 'Session expired', payload };
      }

      return { valid: true, payload };
    } catch (err) {
      return { valid: false, reason: 'Failed to verify session token' };
    }
  }

  /**
   * Clear active session tokens
   */
  public clearSession(role: 'admin' | 'technician') {
    if (role === 'admin') {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TECH_TOKEN);
    }
  }

  /**
   * Retrieve active session token
   */
  public getSessionToken(role: 'admin' | 'technician'): string | null {
    return localStorage.getItem(role === 'admin' ? STORAGE_KEYS.ADMIN_TOKEN : STORAGE_KEYS.TECH_TOKEN);
  }

  /**
   * Security Audit Log management
   */
  public recordAuditLog(
    event: SecurityAuditLog['event'],
    role: SecurityAuditLog['role'],
    identifier: string,
    details: string
  ) {
    try {
      const logs = this.getAuditLogs();
      const newLog: SecurityAuditLog = {
        id: 'sec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        event,
        role,
        identifier,
        details,
        clientInfo: typeof navigator !== 'undefined' ? `${navigator.platform} - ${navigator.userAgent.slice(0, 40)}` : 'Node/Browser'
      };
      const updated = [newLog, ...logs.slice(0, 49)]; // keep 50 logs
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  public getAuditLogs(): SecurityAuditLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get summary status of technicians PIN security
   */
  public getTechniciansSecurityStatus(): { id: string; name: string; hasCustomPin: boolean; updatedAt: string }[] {
    const store = this.getCredentialsStore();
    const techs = [
      { id: 'tech-01', name: 'Karthik Ramanathan' },
      { id: 'tech-02', name: 'Syed Imran' },
      { id: 'tech-03', name: 'Praveen Kumar B' },
      { id: 'tech-04', name: 'Deepak V' }
    ];

    return techs.map((t) => {
      const cred = store[t.id];
      return {
        id: t.id,
        name: t.name,
        hasCustomPin: Boolean(cred),
        updatedAt: cred?.updatedAt ? new Date(cred.updatedAt).toLocaleDateString() : 'Default'
      };
    });
  }
}

export const securityService = new SecurityService();
