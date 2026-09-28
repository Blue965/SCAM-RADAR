const BLOCK_OVERLAY_ID = 'scamradar-block-overlay';

function buildOverlay(result) {
  const root = document.createElement('div');
  root.id = BLOCK_OVERLAY_ID;
  root.style.position = 'fixed';
  root.style.inset = '0';
  root.style.zIndex = '2147483647';
  root.style.background = 'rgba(7, 24, 48, 0.94)';
  root.style.display = 'flex';
  root.style.alignItems = 'center';
  root.style.justifyContent = 'center';
  root.style.padding = '24px';
  root.style.fontFamily = 'Segoe UI, Arial, sans-serif';
  root.style.color = '#0f172a';

  const card = document.createElement('div');
  card.style.position = 'relative';
  card.style.width = 'min(560px, 92vw)';
  card.style.background = '#f8fafc';
  card.style.border = '1px solid rgba(15, 23, 42, 0.1)';
  card.style.borderRadius = '18px';
  card.style.boxShadow = '0 24px 60px rgba(15, 23, 42, 0.22)';
  card.style.padding = '28px 28px 22px';

  const iconWrap = document.createElement('div');
  iconWrap.style.width = '58px';
  iconWrap.style.height = '58px';
  iconWrap.style.borderRadius = '12px';
  iconWrap.style.display = 'flex';
  iconWrap.style.alignItems = 'center';
  iconWrap.style.justifyContent = 'center';
  iconWrap.style.background = '#e0f2fe';
  iconWrap.style.border = '1px solid rgba(14, 116, 144, 0.15)';
  iconWrap.style.marginBottom = '18px';
  iconWrap.style.fontSize = '26px';
  iconWrap.textContent = '⚠️';

  const badge = document.createElement('div');
  badge.textContent = 'SCAMRADAR';
  badge.style.display = 'inline-block';
  badge.style.padding = '7px 10px';
  badge.style.borderRadius = '999px';
  badge.style.fontSize = '11px';
  badge.style.fontWeight = '800';
  badge.style.letterSpacing = '0.12em';
  badge.style.background = '#dbeafe';
  badge.style.color = '#0f3d8a';
  badge.style.border = '1px solid rgba(37, 99, 235, 0.15)';
  badge.style.marginBottom = '16px';

  const title = document.createElement('h1');
  title.textContent = 'Ce site a été bloqué pour votre protection';
  title.style.margin = '0 0 12px';
  title.style.fontSize = 'clamp(28px, 4vw, 40px)';
  title.style.lineHeight = '1.2';
  title.style.fontWeight = '800';
  title.style.color = '#0f172a';

  const desc = document.createElement('p');
  desc.textContent = result?.detail || 'Ce domaine a été signalé comme suspect, potentiellement frauduleux ou trompeur. ScamRadar a empêché son chargement pour protéger vos données personnelles et la sécurité de votre navigateur.';
  desc.style.margin = '0';
  desc.style.fontSize = '16px';
  desc.style.lineHeight = '1.7';
  desc.style.color = '#334155';

  const warning = document.createElement('div');
  warning.textContent = 'Risque détecté : phishing, fraude ou contenu trompeur';
  warning.style.marginTop = '18px';
  warning.style.padding = '12px 14px';
  warning.style.borderRadius = '12px';
  warning.style.background = '#fef3c7';
  warning.style.border = '1px solid rgba(180, 83, 9, 0.18)';
  warning.style.color = '#7c2d12';
  warning.style.fontSize = '14px';
  warning.style.fontWeight = '700';

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.flexWrap = 'wrap';
  actions.style.gap = '12px';
  actions.style.marginTop = '24px';

  const continueBtn = document.createElement('button');
  continueBtn.textContent = 'Continuer vers ce site';
  continueBtn.style.flex = '1';
  continueBtn.style.minWidth = '200px';
  continueBtn.style.background = '#2563eb';
  continueBtn.style.color = '#fff';
  continueBtn.style.border = 'none';
  continueBtn.style.borderRadius = '10px';
  continueBtn.style.padding = '14px 18px';
  continueBtn.style.cursor = 'pointer';
  continueBtn.style.fontWeight = '700';
  continueBtn.style.fontSize = '15px';
  continueBtn.style.boxShadow = 'none';
  continueBtn.onclick = () => {
    const overlay = document.getElementById(BLOCK_OVERLAY_ID);
    if (overlay) overlay.remove();
  };

  const ignoreBtn = document.createElement('button');
  ignoreBtn.textContent = 'Ignorer';
  ignoreBtn.style.flex = '1';
  ignoreBtn.style.minWidth = '120px';
  ignoreBtn.style.background = '#f1f5f9';
  ignoreBtn.style.color = '#0f172a';
  ignoreBtn.style.border = '1px solid rgba(15, 23, 42, 0.12)';
  ignoreBtn.style.borderRadius = '10px';
  ignoreBtn.style.padding = '14px 18px';
  ignoreBtn.style.cursor = 'pointer';
  ignoreBtn.style.fontWeight = '600';
  ignoreBtn.style.fontSize = '15px';
  ignoreBtn.onclick = () => {
    chrome.runtime.sendMessage({ action: 'IGNORE_PAGE' });
  };

  actions.appendChild(continueBtn);
  actions.appendChild(ignoreBtn);
  card.appendChild(iconWrap);
  card.appendChild(badge);
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(warning);
  card.appendChild(actions);
  root.appendChild(card);
  return root;
}

function clearOverlay() {
  const existing = document.getElementById(BLOCK_OVERLAY_ID);
  if (existing) existing.remove();
}

chrome.runtime.onMessage.addListener((message) => {
  if (!message || !message.action) return;

  if (message.action === 'BLOCK_PAGE') {
    clearOverlay();
    const overlay = buildOverlay(message.result);
    document.body.appendChild(overlay);
    document.documentElement.style.overflow = 'hidden';
  }

  if (message.action === 'CLEAR_BLOCK_OVERLAY') {
    clearOverlay();
    document.documentElement.style.overflow = '';
  }
});

window.addEventListener('beforeunload', () => {
  clearOverlay();
  document.documentElement.style.overflow = '';
});
