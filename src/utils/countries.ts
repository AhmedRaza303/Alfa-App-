import { parsePhoneNumberFromString, AsYouType, CountryCode } from 'libphonenumber-js';

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  dialCode: string; // e.g. "+1"
  flag: string;
  postalPattern?: RegExp;
  postalPlaceholder: string;
  states?: string[];
}

export const COUNTRIES: CountryInfo[] = [
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    postalPattern: /^\d{5}(-\d{4})?$/,
    postalPlaceholder: '90210',
    states: [
      'California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania', 'Ohio',
      'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia', 'Washington',
      'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri', 'Maryland', 'Wisconsin',
      'Colorado', 'Minnesota', 'South Carolina', 'Alabama', 'Louisiana', 'Kentucky', 'Oregon',
      'Oklahoma', 'Connecticut', 'Utah', 'Nevada', 'Iowa', 'Arkansas', 'Mississippi', 'Kansas',
      'New Mexico', 'Nebraska', 'Idaho', 'West Virginia', 'Hawaii', 'New Hampshire', 'Maine',
      'Rhode Island', 'Montana', 'Delaware', 'South Dakota', 'North Dakota', 'Alaska', 'District of Columbia'
    ]
  },
  {
    code: 'PK',
    name: 'Pakistan',
    dialCode: '+92',
    flag: '🇵🇰',
    postalPattern: /^\d{5}$/,
    postalPlaceholder: '44000',
    states: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Kashmir']
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    postalPlaceholder: 'SW1A 1AA',
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland']
  },
  {
    code: 'ES',
    name: 'Spain',
    dialCode: '+34',
    flag: '🇪🇸',
    postalPattern: /^\d{5}$/,
    postalPlaceholder: '28001',
    states: [
      'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria', 'Castilla-La Mancha',
      'Castilla y León', 'Cataluña', 'Extremadura', 'Galicia', 'Madrid', 'Murcia', 'Navarra',
      'País Vasco', 'La Rioja', 'Comunidad Valenciana'
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    postalPlaceholder: 'K1A 0B1',
    states: [
      'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan',
      'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island'
    ]
  },
  {
    code: 'MX',
    name: 'Mexico',
    dialCode: '+52',
    flag: '🇲🇽',
    postalPattern: /^\d{5}$/,
    postalPlaceholder: '01000',
    states: [
      'Ciudad de México', 'Jalisco', 'Nuevo León', 'Puebla', 'Guanajuato', 'Veracruz',
      'Estado de México', 'Baja California', 'Sonora', 'Chihuahua', 'Yucatán', 'Querétaro'
    ]
  },
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    postalPattern: /^\d{6}$/,
    postalPlaceholder: '110001',
    states: [
      'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh', 'Gujarat',
      'West Bengal', 'Telangana', 'Kerala', 'Rajasthan', 'Punjab', 'Haryana'
    ]
  },
  {
    code: 'CO',
    name: 'Colombia',
    dialCode: '+57',
    flag: '🇨🇴',
    postalPattern: /^\d{6}$/,
    postalPlaceholder: '110111',
    states: ['Bogotá D.C.', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Santander', 'Bolívar']
  },
  {
    code: 'AR',
    name: 'Argentina',
    dialCode: '+54',
    flag: '🇦🇷',
    postalPlaceholder: 'C1002',
    states: ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán']
  },
  {
    code: 'BR',
    name: 'Brazil',
    dialCode: '+55',
    flag: '🇧🇷',
    postalPlaceholder: '01001-000',
    states: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná', 'Rio Grande do Sul']
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: '🇦🇺',
    postalPattern: /^\d{4}$/,
    postalPlaceholder: '2000',
    states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania']
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    postalPattern: /^\d{5}$/,
    postalPlaceholder: '10115',
    states: ['Berlin', 'Bavaria', 'Baden-Württemberg', 'North Rhine-Westphalia', 'Hesse', 'Hamburg']
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    postalPattern: /^\d{5}$/,
    postalPlaceholder: '75001',
    states: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie', 'Provence-Alpes-Côte d\'Azur']
  },
  {
    code: 'IT',
    name: 'Italy',
    dialCode: '+39',
    flag: '🇮🇹',
    postalPattern: /^\d{5}$/,
    postalPlaceholder: '00118',
    states: ['Lombardy', 'Lazio', 'Campania', 'Veneto', 'Sicily', 'Piedmont', 'Tuscany']
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    postalPlaceholder: '00000',
    states: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain']
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    flag: '🇸🇦',
    postalPlaceholder: '11564',
    states: ['Riyadh', 'Makkah', 'Eastern Province', 'Madinah', 'Asir']
  }
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // United States

export const getCountryByCode = (code?: string): CountryInfo => {
  if (!code) return DEFAULT_COUNTRY;
  const upper = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === upper) || DEFAULT_COUNTRY;
};

export const getCountryByDialCode = (dialCode?: string): CountryInfo => {
  if (!dialCode) return DEFAULT_COUNTRY;
  const clean = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  return COUNTRIES.find((c) => c.dialCode === clean) || DEFAULT_COUNTRY;
};

/**
 * Format a typed phone string using libphonenumber-js
 */
export const formatPhoneAsYouType = (input: string, countryCode: string): string => {
  try {
    const formatter = new AsYouType((countryCode as CountryCode) || 'US');
    return formatter.input(input);
  } catch {
    return input;
  }
};

/**
 * Validates international phone number using libphonenumber-js
 */
export const validateInternationalPhone = (
  fullOrNationalNumber: string,
  countryCode: string
): { isValid: boolean; e164?: string; formatted?: string; error?: string } => {
  const trimmed = fullOrNationalNumber.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  try {
    const parsed = parsePhoneNumberFromString(trimmed, (countryCode as CountryCode) || 'US');
    if (!parsed) {
      // Basic fallback check
      const digitsOnly = trimmed.replace(/\D/g, '');
      if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
        return { isValid: true, e164: trimmed, formatted: trimmed };
      }
      return { isValid: false, error: 'Invalid phone number format.' };
    }

    if (parsed.isValid()) {
      return {
        isValid: true,
        e164: parsed.format('E.164'),
        formatted: parsed.formatInternational()
      };
    } else {
      // Allow if length looks reasonable for international use
      if (parsed.nationalNumber && parsed.nationalNumber.length >= 7) {
        return {
          isValid: true,
          e164: parsed.format('E.164') || trimmed,
          formatted: parsed.formatInternational() || trimmed
        };
      }
      return { isValid: false, error: 'Please enter a valid phone number for the selected country.' };
    }
  } catch {
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
      return { isValid: true, e164: trimmed, formatted: trimmed };
    }
    return { isValid: false, error: 'Please enter a valid phone number.' };
  }
};
