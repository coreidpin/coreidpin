export interface CountryCode {
  code: string;
  country: string;
  name: string;
  flag: string;
  supported: boolean;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+234', country: 'NG', name: 'Nigeria', flag: '🇳🇬', supported: true },
  { code: '+1', country: 'US', name: 'United States', flag: '🇺🇸', supported: false },
  { code: '+1', country: 'CA', name: 'Canada', flag: '🇨🇦', supported: false },
  { code: '+44', country: 'GB', name: 'United Kingdom', flag: '🇬🇧', supported: false },
  { code: '+33', country: 'FR', name: 'France', flag: '🇫🇷', supported: false },
  { code: '+49', country: 'DE', name: 'Germany', flag: '🇩🇪', supported: false },
  { code: '+39', country: 'IT', name: 'Italy', flag: '🇮🇹', supported: false },
  { code: '+34', country: 'ES', name: 'Spain', flag: '🇪🇸', supported: false },
  { code: '+31', country: 'NL', name: 'Netherlands', flag: '🇳🇱', supported: false },
  { code: '+41', country: 'CH', name: 'Switzerland', flag: '🇨🇭', supported: false },
  { code: '+43', country: 'AT', name: 'Austria', flag: '🇦🇹', supported: false },
  { code: '+32', country: 'BE', name: 'Belgium', flag: '🇧🇪', supported: false },
  { code: '+45', country: 'DK', name: 'Denmark', flag: '🇩🇰', supported: false },
  { code: '+46', country: 'SE', name: 'Sweden', flag: '🇸🇪', supported: false },
  { code: '+47', country: 'NO', name: 'Norway', flag: '🇳🇴', supported: false },
  { code: '+358', country: 'FI', name: 'Finland', flag: '🇫🇮', supported: false },
  { code: '+91', country: 'IN', name: 'India', flag: '🇮🇳', supported: false },
  { code: '+86', country: 'CN', name: 'China', flag: '🇨🇳', supported: false },
  { code: '+81', country: 'JP', name: 'Japan', flag: '🇯🇵', supported: false },
  { code: '+82', country: 'KR', name: 'South Korea', flag: '🇰🇷', supported: false },
  { code: '+61', country: 'AU', name: 'Australia', flag: '🇦🇺', supported: false },
  { code: '+64', country: 'NZ', name: 'New Zealand', flag: '🇳🇿', supported: false },
  { code: '+27', country: 'ZA', name: 'South Africa', flag: '🇿🇦', supported: false },
  { code: '+20', country: 'EG', name: 'Egypt', flag: '🇪🇬', supported: false },
  { code: '+212', country: 'MA', name: 'Morocco', flag: '🇲🇦', supported: false },
  { code: '+254', country: 'KE', name: 'Kenya', flag: '🇰🇪', supported: false },
  { code: '+233', country: 'GH', name: 'Ghana', flag: '🇬🇭', supported: false },
  { code: '+55', country: 'BR', name: 'Brazil', flag: '🇧🇷', supported: false },
  { code: '+52', country: 'MX', name: 'Mexico', flag: '🇲🇽', supported: false },
  { code: '+54', country: 'AR', name: 'Argentina', flag: '🇦🇷', supported: false },
  { code: '+56', country: 'CL', name: 'Chile', flag: '🇨🇱', supported: false },
  { code: '+57', country: 'CO', name: 'Colombia', flag: '🇨🇴', supported: false },
  { code: '+51', country: 'PE', name: 'Peru', flag: '🇵🇪', supported: false },
  { code: '+7', country: 'RU', name: 'Russia', flag: '🇷🇺', supported: false },
  { code: '+380', country: 'UA', name: 'Ukraine', flag: '🇺🇦', supported: false },
  { code: '+48', country: 'PL', name: 'Poland', flag: '🇵🇱', supported: false },
  { code: '+90', country: 'TR', name: 'Turkey', flag: '🇹🇷', supported: false },
  { code: '+966', country: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', supported: false },
  { code: '+971', country: 'AE', name: 'UAE', flag: '🇦🇪', supported: false },
  { code: '+65', country: 'SG', name: 'Singapore', flag: '🇸🇬', supported: false },
  { code: '+60', country: 'MY', name: 'Malaysia', flag: '🇲🇾', supported: false },
  { code: '+66', country: 'TH', name: 'Thailand', flag: '🇹🇭', supported: false },
  { code: '+84', country: 'VN', name: 'Vietnam', flag: '🇻🇳', supported: false },
  { code: '+63', country: 'PH', name: 'Philippines', flag: '🇵🇭', supported: false },
  { code: '+62', country: 'ID', name: 'Indonesia', flag: '🇮🇩', supported: false }
];

export const getCountryByCode = (code: string): CountryCode | undefined => {
  return COUNTRY_CODES.find(country => country.code === code);
};

export const isCountrySupported = (code: string): boolean => {
  const country = getCountryByCode(code);
  return country?.supported || false;
};

export const getDefaultCountry = (): CountryCode => {
  return COUNTRY_CODES.find(country => country.supported) || COUNTRY_CODES[0];
};