import site from '../data/site.json';

export interface Stat {
  num: string;
  label: string;
}

export const WHATSAPP: string = site.whatsapp;
export const WHATSAPP_TEXT: string = site.whatsappText;
export const PHONE_DISPLAY: string = site.phoneDisplay;
export const EMAIL: string = site.email;
export const STATS: Stat[] = site.stats;

// Reproduce EXACTAMENTE la URL original del prototipo, incluyendo el "!" como %21.
export const waUrl: string = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
  site.whatsappText,
).replace(/!/g, '%21')}`;

export const mailto: string = `mailto:${site.email}`;

export default site;
