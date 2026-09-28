const blacklistedDomains = {
  'phishing-fake-bank.com': 'Copie frauduleuse d’un site bancaire',
  'scam-shop-discount.site': 'Fausse boutique en ligne',
  'free-robux-generator.net': 'Arnaque de génération de crédits',
  'paypal-security-update.xyz': 'Tentative d’hameçonnage PayPal',
  'amazon-account-recovery.site': 'Faux renouvellement de compte Amazon'
};

const suspiciousKeywords = [
  'free-robux', 'free-robux-generator', 'free-coin', 'claim-prize', 'claim-reward',
  'urgent-verification', 'verify-account', 'verify-your-account', 'winner-2026',
  'crypto-giveaway', 'secure-your-wallet', 'security-update', 'account-security',
  'reward', 'bonus', 'cashback', 'giveaway', 'winner', 'prize', 'robux',
  'verify', 'wallet', 'secure', 'security', 'claim', 'limited-offer', 'double-your-money'
];

const suspiciousHostPatterns = [
  /free.*(robux|coin|gift|reward|bonus)/i,
  /(giveaway|winner|claim|reward|verify|security|secure|wallet|cashback|promo|bonus|crypto)/i,
  /(xyz|top|club|site|info|buzz|click|online|live|vip|ml|ga|tk|bid|loan)/i,
  /altbot|robux|prize|verify-account|security-update/i
];

function analyzeCurrentPage(url) {
  if (!url) {
    return {
      safe: true,
      label: 'Aucune page active',
      detail: 'Aucune URL détectée pour l’analyse.'
    };
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const fullPath = `${hostname}${parsed.pathname}`.toLowerCase();

    if (blacklistedDomains[hostname]) {
      return {
        safe: false,
        label: 'Site suspect',
        detail: `${hostname} — ${blacklistedDomains[hostname]}`
      };
    }

    const keywordMatch = suspiciousKeywords.some(keyword => fullPath.includes(keyword));
    const hostPatternMatch = suspiciousHostPatterns.some(pattern => pattern.test(hostname));
    const suspiciousTld = /\.(xyz|top|club|online|site|info|buzz|click|best|vip)$/i.test(hostname);
    const suspiciousSegment = /(free|gift|reward|claim|verify|security|winner|bonus|cashback|robux)/i.test(hostname);

    if (keywordMatch || hostPatternMatch || suspiciousTld || suspiciousSegment) {
      return {
        safe: false,
        label: 'Signalement de phishing',
        detail: 'Le domaine ou l’URL contient des éléments typiques d’arnaque ou d’hameçonnage.'
      };
    }

    return {
      safe: true,
      label: 'Site protégé',
      detail: 'Aucun marqueur de phishing ou de fraude détecté.'
    };
  } catch (error) {
    return {
      safe: true,
      label: 'Analyse impossible',
      detail: 'Cette page ne peut pas être vérifiée automatiquement.'
    };
  }
}

function updatePopup(result) {
  const statusEl = document.getElementById('status');
  const detailEl = document.getElementById('detail');
  const badgeEl = document.getElementById('risk-badge');

  statusEl.textContent = result.label;
  detailEl.textContent = result.detail;

  if (result.safe) {
    badgeEl.textContent = 'Protégé';
    badgeEl.className = 'risk-badge risk-safe';
    statusEl.style.color = '#22c55e';
  } else {
    badgeEl.textContent = 'Attention';
    badgeEl.className = 'risk-badge risk-warn';
    statusEl.style.color = '#f87171';
  }
}

function refreshScanState() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const result = analyzeCurrentPage(activeTab?.url || '');
    updatePopup(result);
  });

  chrome.storage.local.get(['blockedCount'], (data) => {
    document.getElementById('blocked-count').textContent = Number(data.blockedCount || 0);
  });
}

document.getElementById('scan-btn').addEventListener('click', () => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Analyse en cours…';
  statusEl.style.color = '#fbbf24';

  setTimeout(() => {
    refreshScanState();
  }, 700);
});

refreshScanState();