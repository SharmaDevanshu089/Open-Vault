(async function(){
  // Module uses dynamic import of Tauri window API when available.
  const minimizeBtn = document.getElementById('minimizeBtn');
  const maximizeBtn = document.getElementById('maximizeBtn');
  const closeBtn = document.getElementById('closeBtn');

  function safeQuery(sel){ return document.querySelector(sel); }

  let isTauri = false;
  let appWindow = null;
  try{
    const mod = await import('@tauri-apps/api/window');
    appWindow = mod.appWindow;
    isTauri = true;
  }catch(e){
    // not running in Tauri environment — fallbacks will be used
  }

  function updateMaxIcon(maxed){
    const i = maximizeBtn && maximizeBtn.querySelector('i');
    if (!i) return;
    i.className = maxed ? 'fas fa-window-restore' : 'fas fa-window-maximize';
  }

  if (minimizeBtn){
    minimizeBtn.addEventListener('click', async () => {
      if (isTauri && appWindow && appWindow.minimize) {
        await appWindow.minimize();
      } else {
        // Browser fallback: blur window
        try{ window.blur(); }catch(e){}
      }
    });
  }

  if (maximizeBtn){
    maximizeBtn.addEventListener('click', async () => {
      if (isTauri && appWindow && appWindow.isMaximized) {
        const maxed = await appWindow.isMaximized();
        if (maxed && appWindow.unmaximize) await appWindow.unmaximize();
        else if (!maxed && appWindow.maximize) await appWindow.maximize();
        updateMaxIcon(!maxed);
      } else {
        // Browser fullscreen fallback
        try{
          if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
          else await document.exitFullscreen();
          updateMaxIcon(!!document.fullscreenElement);
        }catch(e){ console.warn('Fullscreen toggle failed', e); }
      }
    });
  }

  if (closeBtn){
    closeBtn.addEventListener('click', async () => {
      if (isTauri && appWindow && appWindow.close) {
        await appWindow.close();
      } else {
        // Browser fallback
        window.close();
      }
    });
  }

  // initialize icon state if possible
  if (isTauri && appWindow && appWindow.isMaximized){
    try{ const m = await appWindow.isMaximized(); updateMaxIcon(m); }catch(e){}
  }
})();
