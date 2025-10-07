/**
 * Utility functions for auto-generating codes from names
 */

/**
 * Generates a country code from a country name
 * Examples:
 * - "United States" -> "US"
 * - "United Kingdom" -> "UK"
 * - "Nigeria" -> "NG"
 * - "South Africa" -> "ZA"
 * - "New Zealand" -> "NZ"
 */
export const generateCountryCode = (countryName: string): string => {
  if (!countryName || typeof countryName !== 'string') {
    return '';
  }

  const name = countryName.trim();
  
  // Handle special cases for common countries
  const specialCases: { [key: string]: string } = {
    'united states': 'US',
    'united states of america': 'US',
    'usa': 'US',
    'america': 'US',
    'united kingdom': 'UK',
    'great britain': 'UK',
    'britain': 'UK',
    'south africa': 'ZA',
    'south korea': 'KR',
    'north korea': 'KP',
    'new zealand': 'NZ',
    'united arab emirates': 'AE',
    'uae': 'AE',
    'czech republic': 'CZ',
    'dominican republic': 'DO',
    'central african republic': 'CF',
    'democratic republic of the congo': 'CD',
    'republic of the congo': 'CG',
    'congo': 'CD',
    'cote d\'ivoire': 'CI',
    'ivory coast': 'CI',
    'trinidad and tobago': 'TT',
    'saint vincent and the grenadines': 'VC',
    'antigua and barbuda': 'AG',
    'saint kitts and nevis': 'KN',
    'bosnia and herzegovina': 'BA',
    'papua new guinea': 'PG',
    'marshall islands': 'MH',
    'solomon islands': 'SB',
    'cook islands': 'CK',
    'virgin islands': 'VI',
    'cayman islands': 'KY',
    'turks and caicos islands': 'TC',
    'british virgin islands': 'VG',
    'faroe islands': 'FO',
    'norfolk island': 'NF',
    'christmas island': 'CX',
    'cocos islands': 'CC',
    'heard island and mcdonald islands': 'HM',
    'south georgia and the south sandwich islands': 'GS',
    'british indian ocean territory': 'IO',
    'french southern territories': 'TF',
    'american samoa': 'AS',
    'guam': 'GU',
    'northern mariana islands': 'MP',
    'puerto rico': 'PR',
    'u.s. virgin islands': 'VI',
    'sao tome and principe': 'ST',
    'saint helena': 'SH',
    'falkland islands': 'FK',
    'greenland': 'GL',
    'svalbard and jan mayen': 'SJ',
    'aland islands': 'AX',
    'isle of man': 'IM',
    'jersey': 'JE',
    'guernsey': 'GG',
    'monaco': 'MC',
    'san marino': 'SM',
    'vatican city': 'VA',
    'liechtenstein': 'LI',
    'andorra': 'AD',
    'malta': 'MT',
    'cyprus': 'CY',
    'luxembourg': 'LU',
    'slovakia': 'SK',
    'slovenia': 'SI',
    'estonia': 'EE',
    'latvia': 'LV',
    'lithuania': 'LT',
    'moldova': 'MD',
    'belarus': 'BY',
    'ukraine': 'UA',
    'kazakhstan': 'KZ',
    'uzbekistan': 'UZ',
    'turkmenistan': 'TM',
    'tajikistan': 'TJ',
    'kyrgyzstan': 'KG',
    'mongolia': 'MN',
    'afghanistan': 'AF',
    'pakistan': 'PK',
    'bangladesh': 'BD',
    'sri lanka': 'LK',
    'maldives': 'MV',
    'nepal': 'NP',
    'bhutan': 'BT',
    'myanmar': 'MM',
    'burma': 'MM',
    'thailand': 'TH',
    'laos': 'LA',
    'cambodia': 'KH',
    'vietnam': 'VN',
    'malaysia': 'MY',
    'singapore': 'SG',
    'brunei': 'BN',
    'indonesia': 'ID',
    'philippines': 'PH',
    'taiwan': 'TW',
    'hong kong': 'HK',
    'macau': 'MO',
    'japan': 'JP',
    'china': 'CN',
    'india': 'IN',
    'russia': 'RU',
    'canada': 'CA',
    'mexico': 'MX',
    'brazil': 'BR',
    'argentina': 'AR',
    'chile': 'CL',
    'colombia': 'CO',
    'peru': 'PE',
    'venezuela': 'VE',
    'ecuador': 'EC',
    'bolivia': 'BO',
    'paraguay': 'PY',
    'uruguay': 'UY',
    'guyana': 'GY',
    'suriname': 'SR',
    'french guiana': 'GF',
    'australia': 'AU',
    'fiji': 'FJ',
    'samoa': 'WS',
    'tonga': 'TO',
    'vanuatu': 'VU',
    'palau': 'PW',
    'micronesia': 'FM',
    'kiribati': 'KI',
    'tuvalu': 'TV',
    'nauru': 'NR',
    'new caledonia': 'NC',
    'french polynesia': 'PF',
    'wallis and futuna': 'WF',
    'niue': 'NU',
    'tokelau': 'TK',
    'pitcairn islands': 'PN',
    'norway': 'NO',
    'sweden': 'SE',
    'finland': 'FI',
    'denmark': 'DK',
    'iceland': 'IS',
    'ireland': 'IE',
    'switzerland': 'CH',
    'austria': 'AT',
    'germany': 'DE',
    'france': 'FR',
    'spain': 'ES',
    'portugal': 'PT',
    'italy': 'IT',
    'greece': 'GR',
    'turkey': 'TR',
    'poland': 'PL',
    'hungary': 'HU',
    'romania': 'RO',
    'bulgaria': 'BG',
    'croatia': 'HR',
    'serbia': 'RS',
    'montenegro': 'ME',
    'albania': 'AL',
    'macedonia': 'MK',
    'bosnia': 'BA',
    'egypt': 'EG',
    'libya': 'LY',
    'tunisia': 'TN',
    'algeria': 'DZ',
    'morocco': 'MA',
    'sudan': 'SD',
    'south sudan': 'SS',
    'ethiopia': 'ET',
    'eritrea': 'ER',
    'djibouti': 'DJ',
    'somalia': 'SO',
    'kenya': 'KE',
    'uganda': 'UG',
    'tanzania': 'TZ',
    'rwanda': 'RW',
    'burundi': 'BI',
    'democratic republic of congo': 'CD',
    'republic of congo': 'CG',
    'chad': 'TD',
    'cameroon': 'CM',
    'nigeria': 'NG',
    'niger': 'NE',
    'mali': 'ML',
    'burkina faso': 'BF',
    'ghana': 'GH',
    'togo': 'TG',
    'benin': 'BJ',
    'liberia': 'LR',
    'sierra leone': 'SL',
    'guinea': 'GN',
    'guinea-bissau': 'GW',
    'senegal': 'SN',
    'gambia': 'GM',
    'mauritania': 'MR',
    'cape verde': 'CV',
    'equatorial guinea': 'GQ',
    'gabon': 'GA',
    'angola': 'AO',
    'zambia': 'ZM',
    'zimbabwe': 'ZW',
    'botswana': 'BW',
    'namibia': 'NA',
    'lesotho': 'LS',
    'eswatini': 'SZ',
    'swaziland': 'SZ',
    'madagascar': 'MG',
    'mauritius': 'MU',
    'seychelles': 'SC',
    'comoros': 'KM',
    'malawi': 'MW',
    'mozambique': 'MZ',
  };

  const lowerName = name.toLowerCase();
  
  // Check special cases first
  if (specialCases[lowerName]) {
    return specialCases[lowerName];
  }

  // For single words, take first 2 letters
  const words = name.split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  // For multiple words, take first letter of each word
  if (words.length === 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  // For 3+ words, take first letter of first two words
  if (words.length >= 3) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  // Fallback: take first 2 characters
  return name.substring(0, 2).toUpperCase();
};

/**
 * Generates a company code from a company name
 * Examples:
 * - "Acme Corporation" -> "ACME"
 * - "Tech Solutions Ltd" -> "TECH"
 * - "Global Industries Inc" -> "GLOB"
 * - "ABC Company" -> "ABC"
 */
export const generateCompanyCode = (companyName: string): string => {
  if (!companyName || typeof companyName !== 'string') {
    return '';
  }

  const name = companyName.trim();
  
  // Remove common company suffixes
  const suffixes = [
    'inc', 'inc.', 'incorporated', 'corp', 'corp.', 'corporation',
    'ltd', 'ltd.', 'limited', 'llc', 'l.l.c.', 'llp', 'l.l.p.',
    'co', 'co.', 'company', 'group', 'holdings', 'enterprises',
    'solutions', 'services', 'systems', 'technologies', 'tech',
    'international', 'global', 'worldwide', 'industries'
  ];

  let cleanName = name.toLowerCase();
  
  // Remove suffixes
  suffixes.forEach(suffix => {
    const regex = new RegExp(`\\b${suffix}\\b`, 'gi');
    cleanName = cleanName.replace(regex, '').trim();
  });

  // Split into words
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) {
    return name.substring(0, 4).toUpperCase();
  }

  if (words.length === 1) {
    // Single word: take first 4 characters or whole word if <= 4
    const word = words[0];
    return word.length <= 4 ? word.toUpperCase() : word.substring(0, 4).toUpperCase();
  }

  if (words.length === 2) {
    // Two words: take first 2 characters of each
    return (words[0].substring(0, 2) + words[1].substring(0, 2)).toUpperCase();
  }

  // Three or more words: take first character of first 4 words
  const code = words.slice(0, 4).map(word => word[0]).join('');
  return code.toUpperCase();
};

/**
 * Validates if a generated code is valid
 */
export const isValidCode = (code: string, minLength: number = 2, maxLength: number = 10): boolean => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  const trimmed = code.trim();
  return trimmed.length >= minLength && 
         trimmed.length <= maxLength && 
         /^[A-Z0-9]+$/.test(trimmed);
};

/**
 * Generates a unique code by checking against existing codes
 */
export const generateUniqueCode = (
  baseCode: string,
  existingCodes: string[],
  maxAttempts: number = 100
): string => {
  if (!existingCodes.includes(baseCode)) {
    return baseCode;
  }

  // Try appending numbers
  for (let i = 1; i <= maxAttempts; i++) {
    const newCode = `${baseCode}${i}`;
    if (!existingCodes.includes(newCode)) {
      return newCode;
    }
  }

  // If we can't find a unique code, append timestamp
  const timestamp = Date.now().toString().slice(-3);
  return `${baseCode}${timestamp}`;
};
