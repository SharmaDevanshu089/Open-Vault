<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { X, Settings, ChevronDown, Home } from 'lucide-svelte';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
  
  // 1. IMPORT THE STORE TO TRACK URL
  import { page } from '$app/stores';

  // Tauri window handling
  let isDropdownOpen = false;

  // 2. REACTIVE CHECK: Are we on the home page?
  // The '$' means this updates automatically whenever the URL changes.
  $: isHomePage = $page.url.pathname === '/';

  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }

  function clickOutside(node: HTMLElement) {
    const handleClick = (event: MouseEvent) => {
      if (!node.contains(event.target as Node)) {
        isDropdownOpen = false;
      }
    };
    document.addEventListener('click', handleClick, true);
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  async function closeApp() {
    console.log("Close button clicked");
    const window = getCurrentWindow();
    await window.close();
  }

  async function openSettings() {
    console.log('Opening Settings Window');

    const existingWin = await WebviewWindow.getByLabel('settings'); 

    if (existingWin) {
      await existingWin.setFocus(); 
      return;
    }

    const webview = new WebviewWindow('settings', {
      url: '/settings',
      title: 'Settings',
      width: 400,
      height: 600,
      resizable: false,
      decorations: true,
      transparent: true
    });

    webview.once('tauri://created', () => {
      console.log('Settings window created');
    });

    webview.once('tauri://error', (e) => {
      console.error('Settings window error', e);
    });
  }
</script>

<header class="titlebar" data-tauri-drag-region>
  
  <div class="project-menu" use:clickOutside>
    <button 
      class="menu-trigger" 
      class:active={isDropdownOpen} 
      on:click={toggleDropdown}
    >
      <span class="project-name">Open Vault</span>
      
      <div class="icon-wrapper" class:rotated={isDropdownOpen}>
        <ChevronDown size={14} strokeWidth={2.5} />
      </div>
    </button>

    {#if isDropdownOpen}
      <div 
        class="dropdown-panel"
        transition:slide={{ duration: 200, easing: quintOut, axis: 'y' }}
      >
        <div class="dropdown-content">
            
          <button 
            class="menu-item" 
            disabled={isHomePage} 
            class:disabled={isHomePage}
          >
            <Home size={16} class="menu-icon" />
            <span>Home</span>
          </button>

          <button class="menu-item" on:click={openSettings}>
            <Settings size={16} class="menu-icon" />
            <span>Settings</span>
          </button>
          
        </div>
      </div>
    {/if}
  </div>

  <div class="drag-spacer" data-tauri-drag-region></div>

  <div class="window-controls">
    <button class="control-btn close-btn" on:click={closeApp} aria-label="Close">
      <X size={16} />
    </button>
  </div>

</header>

<style>
  :global(:root) {
    --tb-height: 42px; 
    --font-ui: "Segoe UI Variable", "Segoe UI", sans-serif;
    
    /* MICA VARS */
    --tb-hover: rgba(255, 255, 255, 0.06); 
    --tb-active: rgba(255, 255, 255, 0.1);
    --glass-bg: rgba(20, 20, 20, 0.25); 
    --glass-border: rgba(255, 255, 255, 0.08);
  }

  /* LAYOUT */
  .titlebar {
    height: var(--tb-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 0 12px; 
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    user-select: none;
    font-family: var(--font-ui);
    color: AccentColorText;
  }

  /* DRAG FIX */
  .drag-spacer {
    flex-grow: 1;
    height: 100%;
    pointer-events: auto; 
  }

  /* LEFT MENU */
  .project-menu {
    position: relative;
    margin-right: 8px;
  }

  .menu-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    color: #eeeeee;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.1s;
    height: 34px;
  }

  .project-name {
    font-size: 16px; 
    font-weight: 400; 
    letter-spacing: 0.3px;
  }

  .menu-trigger:hover {
    background: var(--tb-hover);
  }

  .menu-trigger.active {
    background: var(--tb-active);
  }

  .icon-wrapper {
    display: flex;
    transition: transform 0.2s cubic-bezier(0, 0, 0, 1);
    opacity: 0.8;
  }

  .rotated {
    transform: rotate(180deg);
  }

  /* DROPDOWN PANEL */
  .dropdown-panel {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 220px;
    background: var(--glass-bg); 
    backdrop-filter: blur(40px); 
    border: 1px solid var(--glass-border);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 4px;
    overflow: hidden;
    transform-origin: top left;
  }

  .dropdown-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px; 
    background: transparent;
    border: none;
    color: #f0f0f0;
    border-radius: 4px;
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    font-family: var(--font-ui);
    transition: background 0.1s;
  }

  .menu-item:hover {
    background: var(--tb-hover);
  }

  /* 4. DISABLED STATE STYLING */
  /* This makes the button look inactive and prevents clicks */
  .menu-item:disabled,
  .menu-item.disabled {
    opacity: 0.5;
    cursor: default;
    background: transparent; /* Removes hover effect */
    pointer-events: none;    /* Ensures no mouse interaction */
  }

  /* RIGHT CONTROLS */
  .window-controls {
    display: flex;
    height: 100%;
    -webkit-app-region: no-drag; 
  }

  .control-btn {
    width: 48px; 
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: #ffffff;
    cursor: default;
    transition: background 0.1s;
    border-radius: 0;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .close-btn:hover {
    background: #c42b1c;
    color: white;
  }
</style>