document.addEventListener("DOMContentLoaded", function () {
  window.bridge.updateMessage(updateMessage);
  window.bridge.onUpdateProgress(updateProgress);

  const installBtn = document.getElementById('installBtn');
  const laterBtn = document.getElementById('laterBtn');
  if (installBtn) installBtn.addEventListener('click', () => {
    installBtn.disabled = true;
    const spinner = document.getElementById('btnSpinner');
    if (spinner) spinner.classList.remove('hidden');
    const installText = document.getElementById('installText');
    if (installText) installText.innerText = 'Installation...';
    window.bridge.requestInstall();
  });
  if (laterBtn) laterBtn.addEventListener('click', () => {
    window.bridge.cancelUpdate();
  });
});

function updateMessage(event, message) {
  let msg = document.getElementById("updateMessage");
  if (msg) msg.innerText = message;
}

function updateProgress(event, payload) {
  const fill = document.getElementById('progressFill');
  const percentText = document.getElementById('progressText');
  const installBtn = document.getElementById('installBtn');
  const installText = document.getElementById('installText');
  const changelog = document.getElementById('changelog');

  if (!fill || !percentText) return;

  let p = 0;
  if (typeof payload === 'object' && payload !== null) {
    p = payload.percent || (payload.total ? Math.floor((payload.transferred / payload.total) * 100) : 0);
  } else {
    p = Number(payload) || 0;
  }

  // set width with small transition
  fill.style.width = p + '%';
  percentText.innerText = p + '%';

  // append a short changelog line during download to make it lively
  if (changelog && p > 0 && p < 100) {
    const last = changelog.__last || 0;
    if (p - last >= 10) {
      const li = document.createElement('li');
      li.className = 'text-slate-400 text-sm';
      li.innerText = `Téléchargement: ${p}%`;
      changelog.appendChild(li);
      changelog.__last = p;
      while (changelog.children.length > 8) changelog.removeChild(changelog.firstChild);
    }
  }

  // enable install button when downloaded
  if (installBtn) {
    if (p >= 100) {
      installBtn.disabled = false;
      if (installText) installText.innerText = 'Installer et redémarrer';
    } else {
      installBtn.disabled = true;
      if (installText) installText.innerText = 'Installer et redémarrer';
    }
  }
}
