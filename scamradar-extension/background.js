const blacklistedDomains = {
  'phishing-fake-bank.com': 'Copie frauduleuse d’un site bancaire',
  'scam-shop-discount.site': 'Fausse boutique en ligne',
  'free-robux-generator.net': 'Arnaque de génération de crédits',
  'paypal-security-update.xyz': 'Tentative d’hameçonnage PayPal',
  'amazon-account-recovery.site': 'Faux renouvellement de compte Amazon'
};

const suspiciousKeywords = [
  'free-robux',
  'claim-prize',
  'urgent-verification',
  'verify-account',
  'winner-2026',
  'crypto-giveaway',
  'secure-your-wallet'
];

function analyzeUrl(url) {
  if (!url) {
    return { safe: true, label: 'Aucune page active', detail: 'Aucune URL détectée pour l’analyse.' };
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

    if (suspiciousKeywords.some(keyword => fullPath.includes(keyword))) {
      return {
        safe: false,
        label: 'Signalement de phishing',
        detail: 'Le domaine ou l’URL contient des éléments typiques d’arnaque.'
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

function updateTabSecurity(tabId, url) {
  const result = analyzeUrl(url);

  chrome.action.setBadgeText({ tabId, text: result.safe ? 'OK' : '!' });
  chrome.action.setBadgeBackgroundColor({ tabId, color: result.safe ? '#22c55e' : '#ef4444' });
  chrome.action.setTitle({ tabId, title: result.safe ? 'ScamRadar : site sûr' : 'ScamRadar : site suspect' });

  if (result.safe) {
    chrome.tabs.sendMessage(tabId, { action: 'CLEAR_BLOCK_OVERLAY' }).catch(() => {});
  } else {
    chrome.tabs.sendMessage(tabId, { action: 'BLOCK_PAGE', result }).catch(() => {});
    chrome.storage.local.get(['blockedCount'], (data) => {
      const currentCount = Number(data.blockedCount || 0);
      chrome.storage.local.set({ blockedCount: currentCount + 1 });
    });
  }

  chrome.storage.local.set({ [`tab-${tabId}`]: result });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    updateTabSecurity(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab?.url) {
      updateTabSecurity(tabId, tab.url);
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ blockedCount: 0 });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === 'IGNORE_PAGE') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab?.id) {
        chrome.tabs.remove(currentTab.id);
      }
    });
  }

  return false;
});