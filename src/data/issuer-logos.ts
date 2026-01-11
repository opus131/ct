// Issuer logos with brand colors (lowercase tickers)
const ISSUER_BRANDS: Record<string, string> = {
  // Tech
  aapl: '#000000',
  googl: '#4285f4',
  msft: '#00a4ef',
  amzn: '#ff9900',
  meta: '#0082fb',
  nvda: '#76b900',
  intc: '#0071c5',
  csco: '#1ba0d7',
  orcl: '#f80000',
  adbe: '#ff0000',
  adsk: '#0696d7',
  mu: '#0077c8',
  qcom: '#3253dc',
  txn: '#cc0000',
  ntap: '#0067c5',

  // Finance
  jpm: '#117aca',
  bac: '#e31837',
  wfc: '#d71e28',
  c: '#003b70',
  v: '#1a1f71',
  ma: '#eb001b',
  pypl: '#003087',

  // Consumer
  dis: '#113ccf',
  nflx: '#e50914',
  sbux: '#00704a',
  pep: '#004b93',
  pg: '#003da5',
  wmt: '#0071ce',
  tjx: '#e11a2c',
  czr: '#8b6914',

  // Healthcare
  jnj: '#d51900',
  pfe: '#0093d0',
  mrk: '#009a9a',
  abt: '#003366',
  unh: '#002677',
  cvs: '#cc0000',
  bmy: '#754c9e',
  mdt: '#004990',

  // Industrial / Energy
  ba: '#0039a6',
  ge: '#005eb8',
  ups: '#351c15',
  xom: '#ed1b2d',
  cvx: '#0055a5',
  rtx: '#00205b',
  lin: '#002a5c',

  // Telecom
  t: '#00a8e0',
  vz: '#cd040b',
  cmcsa: '#000000',

  // Other
  tsla: '#cc0000',
  bkng: '#003580',
  baba: '#ff6a00',
  luv: '#304cb2',
  amt: '#003087',
  nee: '#003c71',
  acn: '#a100ff',
  adp: '#d0271d',
  fis: '#003366',
  xo: '#1d1d1d',
};

export function getIssuerLogoUrl(ticker: string | undefined | null): string | null {
  if (!ticker || ticker === 'N/A') return null;

  // Extract base ticker (handle exchange suffixes like "AAPL:US")
  const baseTicker = ticker.split(':')[0].toLowerCase();

  if (baseTicker in ISSUER_BRANDS) {
    return `/assets/issuers/${baseTicker}.svg`;
  }

  return null;
}

export function getIssuerBrandColor(ticker: string | undefined | null): string | null {
  if (!ticker || ticker === 'N/A') return null;

  const baseTicker = ticker.split(':')[0].toLowerCase();
  return ISSUER_BRANDS[baseTicker] || null;
}

export function hasIssuerLogo(ticker: string | undefined | null): boolean {
  return getIssuerLogoUrl(ticker) !== null;
}
