/**
 * Detect user's currency based on their timezone/locale
 */

const TIMEZONE_TO_CURRENCY: Record<string, string> = {
  // Europe - Euro
  "Europe/Amsterdam": "EUR",
  "Europe/Athens": "EUR",
  "Europe/Berlin": "EUR",
  "Europe/Brussels": "EUR",
  "Europe/Budapest": "EUR",
  "Europe/Copenhagen": "EUR",
  "Europe/Dublin": "EUR",
  "Europe/Helsinki": "EUR",
  "Europe/Istanbul": "EUR",
  "Europe/Lisbon": "EUR",
  "Europe/London": "EUR",
  "Europe/Madrid": "EUR",
  "Europe/Malta": "EUR",
  "Europe/Paris": "EUR",
  "Europe/Prague": "EUR",
  "Europe/Rome": "EUR",
  "Europe/Stockholm": "EUR",
  "Europe/Vienna": "EUR",
  "Europe/Warsaw": "EUR",
  "Europe/Zurich": "EUR",
  "Europe/Luxembourg": "EUR",
  "Europe/Belgrade": "EUR",
  "Europe/Bratislava": "EUR",
  "Europe/Ljubljana": "EUR",
  "Europe/Podgorica": "EUR",
  "Europe/Riga": "EUR",
  "Europe/Sofia": "EUR",
  "Europe/Tallinn": "EUR",
  "Europe/Vilnius": "EUR",

  // UK - British Pound
  "Europe/London": "GBP",

  // Georgia - Georgian Lari
  "Asia/Tbilisi": "GEL",

  // USA - US Dollar
  "America/New_York": "USD",
  "America/Chicago": "USD",
  "America/Denver": "USD",
  "America/Los_Angeles": "USD",
  "America/Anchorage": "USD",
  "Pacific/Honolulu": "USD",
  "America/Phoenix": "USD",
  "America/Toronto": "USD",
  "America/Mexico_City": "USD",

  // Canada - Canadian Dollar
  "America/Toronto": "CAD",
  "America/Vancouver": "CAD",
  "America/Edmonton": "CAD",
  "America/Halifax": "CAD",
  "America/St_Johns": "CAD",
  "America/Winnipeg": "CAD",

  // UK
  "Europe/London": "GBP",

  // Australia - Australian Dollar
  "Australia/Sydney": "AUD",
  "Australia/Melbourne": "AUD",
  "Australia/Brisbane": "AUD",
  "Australia/Perth": "AUD",
  "Australia/Adelaide": "AUD",
  "Australia/Darwin": "AUD",
  "Australia/Hobart": "AUD",

  // Japan - Japanese Yen
  "Asia/Tokyo": "JPY",

  // China - Chinese Yuan
  "Asia/Shanghai": "CNY",
  "Asia/Hong_Kong": "HKD",

  // India - Indian Rupee
  "Asia/Kolkata": "INR",

  // Singapore - Singapore Dollar
  "Asia/Singapore": "SGD",

  // Russia - Russian Ruble
  "Europe/Moscow": "RUB",
  "Europe/Volgograd": "RUB",

  // Brazil - Brazilian Real
  "America/Sao_Paulo": "BRL",
  "America/Rio_Branco": "BRL",

  // South Africa - South African Rand
  "Africa/Johannesburg": "ZAR",

  // Mexico - Mexican Peso
  "America/Mexico_City": "MXN",

  // Switzerland - Swiss Franc
  "Europe/Zurich": "CHF",

  // Sweden - Swedish Krona
  "Europe/Stockholm": "SEK",

  // Norway - Norwegian Krone
  "Europe/Oslo": "NOK",

  // Denmark - Danish Krone
  "Europe/Copenhagen": "DKK",

  // New Zealand - NZ Dollar
  "Pacific/Auckland": "NZD",

  // South Korea - Korean Won
  "Asia/Seoul": "KRW",

  // Thailand - Thai Baht
  "Asia/Bangkok": "THB",

  // Turkey - Turkish Lira
  "Europe/Istanbul": "TRY",
};

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return "UTC";
  }
}

/**
 * Detect currency based on user's timezone
 */
export function detectCurrencyFromTimezone(): string {
  const timezone = getUserTimezone();
  const currency = TIMEZONE_TO_CURRENCY[timezone];

  // If timezone not found, try to get from locale
  if (!currency) {
    try {
      const locale = navigator.language || "en-US";
      // Try to extract currency from locale
      const numberFormat = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
      });
      const parts = new Intl.NumberFormat(locale, {
        style: "currency",
        currencyDisplay: "code",
      }).formatToParts(1);
      const currencyPart = parts.find((p) => p.type === "currency");
      if (currencyPart) {
        return currencyPart.value;
      }
    } catch (e) {
      // Fall through to default
    }
  }

  return currency || "EUR"; // Default to EUR
}

/**
 * Get all available currencies
 */
export const AVAILABLE_CURRENCIES = [
  { code: "EUR", name: "Euro (€)", regions: "Europe" },
  { code: "GBP", name: "British Pound (£)", regions: "United Kingdom" },
  { code: "USD", name: "US Dollar ($)", regions: "United States" },
  { code: "CAD", name: "Canadian Dollar (C$)", regions: "Canada" },
  { code: "AUD", name: "Australian Dollar (A$)", regions: "Australia" },
  { code: "NZD", name: "New Zealand Dollar (NZ$)", regions: "New Zealand" },
  { code: "GEL", name: "Georgian Lari (₾)", regions: "Georgia" },
  { code: "JPY", name: "Japanese Yen (¥)", regions: "Japan" },
  { code: "CNY", name: "Chinese Yuan (¥)", regions: "China" },
  { code: "HKD", name: "Hong Kong Dollar (HK$)", regions: "Hong Kong" },
  { code: "INR", name: "Indian Rupee (₹)", regions: "India" },
  { code: "SGD", name: "Singapore Dollar (S$)", regions: "Singapore" },
  { code: "RUB", name: "Russian Ruble (₽)", regions: "Russia" },
  { code: "BRL", name: "Brazilian Real (R$)", regions: "Brazil" },
  { code: "ZAR", name: "South African Rand (R)", regions: "South Africa" },
  { code: "MXN", name: "Mexican Peso ($)", regions: "Mexico" },
  { code: "CHF", name: "Swiss Franc (CHF)", regions: "Switzerland" },
  { code: "SEK", name: "Swedish Krona (kr)", regions: "Sweden" },
  { code: "NOK", name: "Norwegian Krone (kr)", regions: "Norway" },
  { code: "DKK", name: "Danish Krone (kr)", regions: "Denmark" },
  { code: "KRW", name: "South Korean Won (₩)", regions: "South Korea" },
  { code: "THB", name: "Thai Baht (฿)", regions: "Thailand" },
  { code: "TRY", name: "Turkish Lira (₺)", regions: "Turkey" },
];
