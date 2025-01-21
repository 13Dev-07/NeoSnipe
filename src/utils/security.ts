import { sanitize } from 'isomorphic-dompurify';
import { ethers } from 'ethers';

interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
}

export const sanitizeInput = (input: any, options: SanitizeOptions = {}) => {
  if (typeof input === 'string') {
    return sanitize(input, {
      ALLOWED_TAGS: options.allowedTags || [],
      ALLOWED_ATTR: options.allowedAttributes || [],
    });
  }

  if (typeof input === 'object' && input !== null) {
    return Object.keys(input).reduce((acc, key) => {
      acc[key] = sanitizeInput(input[key], options);
      return acc;
    }, {} as any);
  }

  return input;
};

export const validateTokenAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

export const validateNetwork = (network: string): boolean => {
  const allowedNetworks = ['ethereum', 'polygon', 'arbitrum', 'optimism'];
  return allowedNetworks.includes(network.toLowerCase());
};

export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const validateAndSanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['https:', 'http:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }
    return sanitize(url);
  } catch {
    return null;
  }
};