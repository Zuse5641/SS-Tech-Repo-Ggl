/**
 * Centralized WhatsApp Integration Utility
 * Generates pre-filled, compliant WhatsApp deep links and API payload structures
 */

export interface WhatsAppQuoteParams {
  businessNumber: string;
  requestId?: string;
  customerName?: string;
  device?: string;
  brand?: string;
  model?: string;
  repair?: string;
  locality?: string;
  preferredTime?: string;
}

export interface WhatsAppLeadDispatchParams {
  businessNumber: string;
  requestId: string;
  customerName: string;
  phone: string;
  whatsappNumber?: string;
  locality: string;
  pincode: string;
  address: string;
  addressType?: string;
  category: string;
  brand: string;
  model: string;
  repairIssue: string;
  quotedStartingPrice: number;
  preferredDate: string;
  preferredTime: string;
  serviceOtp?: string;
  notes?: string;
}

/**
 * Format a phone number to standard international format without '+' or spaces
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '919880123456';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`; // Default to India country code 91
  }
  return cleaned;
}

/**
 * Construct raw text of the lead notification to be received by the business on WhatsApp
 */
export function buildLeadDispatchMessageText(lead: WhatsAppLeadDispatchParams): string {
  let msg = `🚨 *NEW DOORSTEP REPAIR LEAD* 🚨\n`;
  msg += `*SS Care Technology Bangalore*\n\n`;
  msg += `📋 *Booking ID:* ${lead.requestId}\n`;
  msg += `👤 *Customer:* ${lead.customerName}\n`;
  msg += `📞 *Phone:* ${lead.phone}\n`;
  if (lead.whatsappNumber && lead.whatsappNumber !== lead.phone) {
    msg += `💬 *WhatsApp:* ${lead.whatsappNumber}\n`;
  }
  msg += `📍 *Locality:* ${lead.locality} (${lead.pincode})\n`;
  msg += `🏠 *Address:* ${lead.address} [${lead.addressType || 'Home'}]\n\n`;

  msg += `💻 *Device:* ${lead.brand} ${lead.model} (${lead.category.toUpperCase()})\n`;
  msg += `🛠️ *Issue:* ${lead.repairIssue}\n`;
  msg += `💰 *Est. Quote:* ₹${lead.quotedStartingPrice.toLocaleString('en-IN')} (Starting)\n`;
  msg += `🗓️ *Slot:* ${lead.preferredDate} | ${lead.preferredTime}\n`;

  if (lead.serviceOtp) {
    msg += `🔑 *Customer Arrival OTP:* ${lead.serviceOtp}\n`;
  }

  if (lead.notes) {
    msg += `📝 *Customer Notes:* ${lead.notes}\n`;
  }

  msg += `\n⚡ *Action:* Please confirm engineer dispatch & contact customer.`;
  return msg;
}

/**
 * Construct direct WhatsApp link to send lead directly to the business/admin WhatsApp number
 */
export function buildLeadDispatchWhatsAppUrl(lead: WhatsAppLeadDispatchParams): string {
  const number = sanitizePhoneNumber(lead.businessNumber || '919880123456');
  const message = buildLeadDispatchMessageText(lead);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Construct WhatsApp link to dispatch a work order directly to a Field Technician
 */
export function buildTechnicianJobAssignmentWhatsAppUrl(
  techPhone: string,
  lead: WhatsAppLeadDispatchParams
): string {
  const number = sanitizePhoneNumber(techPhone);
  let msg = `🔧 *NEW DOORSTEP JOB ASSIGNMENT* 🔧\n`;
  msg += `*SS Care Dispatch Desk*\n\n`;
  msg += `Job ID: *${lead.requestId}*\n`;
  msg += `Customer: *${lead.customerName}*\n`;
  msg += `Call Customer: tel:${lead.phone}\n`;
  msg += `Location: *${lead.locality}* (${lead.pincode})\n`;
  msg += `Address: ${lead.address}\n\n`;
  msg += `Device: *${lead.brand} ${lead.model}*\n`;
  msg += `Issue: *${lead.repairIssue}*\n`;
  msg += `Slot: *${lead.preferredDate} (${lead.preferredTime})*\n`;
  msg += `Expected Price: ₹${lead.quotedStartingPrice.toLocaleString('en-IN')}\n\n`;
  msg += `⚠️ *Arrival Verification:* Ask customer for 4-digit arrival OTP on doorstep arrival.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

/**
 * Construct test WhatsApp URL for Admin settings verification
 */
export function buildTestLeadWhatsAppUrl(businessNumber: string): string {
  const number = sanitizePhoneNumber(businessNumber || '919880123456');
  const sampleLead: WhatsAppLeadDispatchParams = {
    businessNumber: number,
    requestId: 'TEST-LEAD-' + Math.floor(1000 + Math.random() * 9000),
    customerName: 'Karthik Rao (Test)',
    phone: '+91 98801 99999',
    locality: 'Koramangala 4th Block',
    pincode: '560034',
    address: '#142, 5th Cross, Near Sony World Signal',
    addressType: 'Home',
    category: 'phones',
    brand: 'Apple iPhone',
    model: '15 Pro Max',
    repairIssue: 'Cracked OLED Display Replacement',
    quotedStartingPrice: 4499,
    preferredDate: 'Today',
    preferredTime: '02:00 PM – 04:00 PM',
    serviceOtp: '4819'
  };

  const message = `✅ *WHATSAPP LEAD RECEIVER VERIFIED* ✅\n\nThis is a test notification confirming that this WhatsApp number is properly configured to receive incoming repair leads from SS Care Technology.\n\n` +
    buildLeadDispatchMessageText(sampleLead);

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Construct standard WhatsApp direct chat link with prefilled message
 */
export function buildWhatsAppQuoteUrl(params: WhatsAppQuoteParams): string {
  const number = sanitizePhoneNumber(params.businessNumber || '919880123456');

  let message = 'Hello SS Care Technology Bangalore,\n\n';

  if (params.requestId) {
    message += `I would like to track / discuss my repair request.\n\n`;
    message += `*Request ID:* ${params.requestId}\n`;
  } else {
    message += `I would like to request a doorstep electronics repair in Bangalore.\n\n`;
  }

  if (params.customerName) {
    message += `*Name:* ${params.customerName}\n`;
  }
  if (params.device || params.model) {
    message += `*Device:* ${params.brand ? params.brand + ' ' : ''}${params.model || params.device || 'Electronics'}\n`;
  }
  if (params.repair) {
    message += `*Issue / Repair:* ${params.repair}\n`;
  }
  if (params.locality) {
    message += `*Location in Bangalore:* ${params.locality}\n`;
  }
  if (params.preferredTime) {
    message += `*Preferred Time:* ${params.preferredTime}\n`;
  }

  message += `\nPlease confirm technician availability & quote details. Thank you!`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Simple general support WhatsApp link
 */
export function buildWhatsAppSupportUrl(businessNumber: string, inquiryType: string = 'Doorstep Repair Inquiry'): string {
  const number = sanitizePhoneNumber(businessNumber || '919880123456');
  const message = `Hello SS Care Technology,\n\nI have an inquiry regarding *${inquiryType}* at my location in Bangalore. Could you please assist me?`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

