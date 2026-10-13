import {
  parsePhoneNumberFromString,
  AsYouType,
  CountryCode,
  validatePhoneNumberLength,
  getExampleNumber
} from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  dialCode: string; // e.g. "+1"
  flag: string;
  postalPattern?: RegExp;
  postalPlaceholder: string;
  states?: string[];
}

/** Postal codes in this app are exactly 5 digits. */
export const POSTAL_CODE_LENGTH = 5;
export const POSTAL_CODE_PATTERN = /^\d{5}$/;

/** City names: letters, spaces, hyphen, apostrophe, period (no digits). */
export const CITY_NAME_PATTERN = /^[\p{L}][\p{L}\s'.-]*$/u;

export const COUNTRIES: CountryInfo[] = [
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '90012',
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
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '44000',
    states: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Kashmir']
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '10001',
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland']
  },
  {
    code: 'ES',
    name: 'Spain',
    dialCode: '+34',
    flag: '🇪🇸',
    postalPattern: POSTAL_CODE_PATTERN,
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
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '10001',
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
    postalPattern: POSTAL_CODE_PATTERN,
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
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '11000',
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
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '11011',
    states: ['Bogotá D.C.', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Santander', 'Bolívar']
  },
  {
    code: 'AR',
    name: 'Argentina',
    dialCode: '+54',
    flag: '🇦🇷',
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '10000',
    states: ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán']
  },
  {
    code: 'BR',
    name: 'Brazil',
    dialCode: '+55',
    flag: '🇧🇷',
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '01001',
    states: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná', 'Rio Grande do Sul']
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: '🇦🇺',
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '20000',
    states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania']
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '10115',
    states: ['Berlin', 'Bavaria', 'Baden-Württemberg', 'North Rhine-Westphalia', 'Hesse', 'Hamburg']
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '75001',
    states: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie', 'Provence-Alpes-Côte d\'Azur']
  },
  {
    code: 'IT',
    name: 'Italy',
    dialCode: '+39',
    flag: '🇮🇹',
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '00118',
    states: ['Lombardy', 'Lazio', 'Campania', 'Veneto', 'Sicily', 'Piedmont', 'Tuscany']
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    postalPattern: POSTAL_CODE_PATTERN,
    postalPlaceholder: '00001',
    states: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain']
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    flag: '🇸🇦',
    postalPattern: POSTAL_CODE_PATTERN,
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

/** Typical / example national length (for UI hint + input cap). */
export const getExpectedNationalPhoneLength = (countryCode: string): number => {
  try {
    const example = getExampleNumber((countryCode || 'US') as CountryCode, examples);
    return example?.nationalNumber?.length ?? 10;
  } catch {
    return 10;
  }
};

/**
 * Max national digits allowed while typing.
 * Uses the country example length so the counter matches real valid numbers
 * (e.g. US = 10, not an inflated libphonenumber "possible" upper bound).
 */
export const getMaxNationalPhoneLength = (countryCode: string): number =>
  getExpectedNationalPhoneLength(countryCode);

export const getPhoneDigitCount = (input: string): number =>
  (input || '').replace(/\D/g, '').length;

/**
 * Format phone as-you-type and enforce country max digit length.
 */
export const formatPhoneAsYouType = (input: string, countryCode: string): string => {
  const code = (countryCode || 'US') as CountryCode;
  const maxDigits = getMaxNationalPhoneLength(code);
  const digitsOnly = (input || '').replace(/\D/g, '').slice(0, maxDigits);

  try {
    const formatter = new AsYouType(code);
    return formatter.input(digitsOnly);
  } catch {
    return digitsOnly;
  }
};

/**
 * Strict phone validation for the selected country.
 * Pass the national number only (without dial code) — SignUp already shows dial code separately.
 */
export const validateInternationalPhone = (
  nationalOrFullNumber: string,
  countryCode: string
): { isValid: boolean; e164?: string; formatted?: string; error?: string } => {
  const trimmed = (nationalOrFullNumber || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  const code = (countryCode || 'US') as CountryCode;
  const expected = getExpectedNationalPhoneLength(code);
  const max = getMaxNationalPhoneLength(code);
  const digitCount = getPhoneDigitCount(trimmed);

  if (digitCount === 0) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  if (digitCount > max) {
    return {
      isValid: false,
      error: `Phone number is too long for the selected country (max ${max} digits).`
    };
  }

  try {
    // Validate as national number for the selected country (do not prepend dial code —
    // that would inflate digit counts and break length checks).
    const lengthResult = validatePhoneNumberLength(trimmed, code);
    if (lengthResult === 'TOO_SHORT') {
      return {
        isValid: false,
        error: `Phone number is too short. Enter ${expected} digits for this country.`
      };
    }
    if (lengthResult === 'TOO_LONG' || lengthResult === 'INVALID_LENGTH') {
      return {
        isValid: false,
        error: `Enter a valid ${expected}-digit phone number for the selected country.`
      };
    }

    const parsed = parsePhoneNumberFromString(trimmed, code);
    // Accept isPossible() — isValid() rejects many real-looking / test numbers
    // (e.g. 222-222-2222) even when length & country format are correct.
    if (!parsed || !parsed.isPossible()) {
      return {
        isValid: false,
        error: `Enter a valid ${expected}-digit phone number for the selected country.`
      };
    }

    return {
      isValid: true,
      e164: parsed.format('E.164'),
      formatted: parsed.formatInternational()
    };
  } catch {
    return { isValid: false, error: 'Please enter a valid phone number.' };
  }
};

/** Keep only city-name characters (letters + space / hyphen / apostrophe / period). */
export const sanitizeCityName = (input: string): string =>
  (input || '').replace(/[^\p{L}\s'.-]/gu, '').replace(/\s{2,}/g, ' ');

export const validateCityName = (
  city: string
): { isValid: boolean; error?: string } => {
  const trimmed = (city || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Please enter your city name.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'City name must be at least 2 characters.' };
  }
  if (/\d/.test(trimmed)) {
    return { isValid: false, error: 'City name cannot contain numbers.' };
  }
  if (!CITY_NAME_PATTERN.test(trimmed)) {
    return { isValid: false, error: 'Enter a valid city name (letters only).' };
  }
  return { isValid: true };
};

/** Digits only, capped at POSTAL_CODE_LENGTH. */
export const sanitizePostalCode = (input: string): string =>
  (input || '').replace(/\D/g, '').slice(0, POSTAL_CODE_LENGTH);

export const validatePostalCode = (
  postalCode: string
): { isValid: boolean; error?: string } => {
  const cleaned = sanitizePostalCode(postalCode);
  if (!cleaned) {
    return { isValid: false, error: 'Please enter your postal code.' };
  }
  if (!POSTAL_CODE_PATTERN.test(cleaned)) {
    return {
      isValid: false,
      error: `Postal code must be exactly ${POSTAL_CODE_LENGTH} digits.`
    };
  }
  return { isValid: true };
};
