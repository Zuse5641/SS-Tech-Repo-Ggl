/**
 * Conversion & Event Tracking Utility
 * Dispatches to window.dataLayer, Google Ads gtag, and console in dev
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface UtmParameters {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

/**
 * Extract UTM params from current URL query
 */
export function getUtmParams(): UtmParameters {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmTerm: params.get('utm_term') || undefined,
    utmContent: params.get('utm_content') || undefined
  };
}

export type AnalyticsEvent =
  | 'quote_started'
  | 'cta_clicked'
  | 'device_selected'
  | 'brand_selected'
  | 'model_selected'
  | 'repair_selected'
  | 'quote_submitted'
  | 'whatsapp_clicked'
  | 'phone_clicked'
  | 'contact_form_submitted'
  | 'booking_confirmed'
  | 'payment_completed'
  | 'free_consultation_modal_opened'
  | 'free_consultation_whatsapp_clicked'
  | 'free_consultation_booked'
  | 'free_consultation_tab_switched';

export function trackEvent(eventName: AnalyticsEvent, payload: Record<string, any> = {}) {
  const eventData = {
    event: eventName,
    ...payload,
    timestamp: new Date().toISOString()
  };

  // Google Tag Manager / DataLayer
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }
  }

  // Developer logging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics Event: ${eventName}]`, payload);
  }
}
