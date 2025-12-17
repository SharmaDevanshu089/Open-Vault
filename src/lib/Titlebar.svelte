<script lang="ts">
  // Import Svelte animation utilities
  import { slide } from 'svelte/transition'; // Provides smooth sliding animation for dropdown
  import { quintOut } from 'svelte/easing'; // Easing function for natural motion
  
  // Import icons from lucide-svelte library
  import { X, Settings, ChevronDown, FolderOpen } from 'lucide-svelte';
  
  // Tauri window handling - allows control of the native window
  let appWindow: any;
  
  // Dynamically import Tauri's window API
  // This is done asynchronously to handle cases where Tauri isn't available (e.g., in browser dev mode)
//   import('@tauri-apps/api/window').then((module) => {
//     appWindow = module.appWindow; // Store reference to current window
//   }).catch(() => {}); // Silently fail if Tauri is not available

  // State management for dropdown menu
  let isDropdownOpen = false;

  // Toggle the dropdown menu open/closed
  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }

  // Custom Svelte action to detect clicks outside an element
  // Used to close the dropdown when clicking elsewhere
  function clickOutside(node: HTMLElement) {
    const handleClick = (event: MouseEvent) => {
      // Check if the click was outside the node
      if (!node.contains(event.target as Node)) {
        isDropdownOpen = false; // Close dropdown
      }
    };
    
    // Add event listener when element is mounted
    document.addEventListener('click', handleClick, true);
    
    // Cleanup function - removes listener when element is destroyed
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  // Function to close the Tauri application window
  async function closeApp() {
    if (appWindow) await appWindow.close();
  }
</script>

<!-- Main titlebar container -->
<!-- data-tauri-drag-region allows dragging the window from this area -->
<header class="titlebar" data-tauri-drag-region>
  
  <!-- Left side: Project/Vault menu dropdown -->
  <div class="project-menu" use:clickOutside>
    <!-- Menu button that triggers dropdown -->
    <button 
      class="menu-trigger" 
      class:active={isDropdownOpen}
      on:click={toggleDropdown}
    >
      <!-- Folder icon -->
      <FolderOpen size={16} strokeWidth={2} class="app-icon"/>
      
      <!-- Project/Vault name text -->
      <span class="project-name">Open Vault</span>
      
      <!-- Chevron icon that rotates when dropdown opens -->
      <div class="icon-wrapper" class:rotated={isDropdownOpen}>
        <ChevronDown size={14} strokeWidth={2.5} />
      </div>
    </button>

    <!-- Dropdown panel - only rendered when isDropdownOpen is true -->
    {#if isDropdownOpen}
      <div 
        class="dropdown-panel"
        transition:slide={{ duration: 200, easing: quintOut, axis: 'y' }}>
        <div class="dropdown-content">
          <!-- Settings menu item -->
          <button class="menu-item">
            <Settings size={16} class="menu-icon" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Middle: Draggable spacer that fills remaining space -->
  <!-- This allows window dragging from the center area -->
  <div class="drag-spacer" data-tauri-drag-region></div>

  <!-- Right side: Window control buttons -->
  <div class="window-controls">
    <!-- Close button -->
    <button class="control-btn close-btn" on:click={closeApp} aria-label="Close">
      <X size={16} />
    </button>
  </div>

</header>

<style>
  /* ===== CSS CUSTOM PROPERTIES (VARIABLES) ===== */
  :global(:root) {
    /* Titlebar height */
    --tb-height: 40px; /* Slightly taller than standard for modern aesthetic */
    
    /* Font stack optimized for Windows */
    --font-ui: "Segoe UI Variable", "Segoe UI", sans-serif;
    
    /* MICA OPTIMIZATION - Low opacity backgrounds allow Windows 11 Mica blur to show through */
    --tb-hover: rgba(255, 255, 255, 0.06);  /* Subtle hover state */
    --tb-active: rgba(255, 255, 255, 0.1);   /* Slightly brighter active state */
    
    /* Glass effect with 25% max opacity as requested */
    --glass-bg: rgba(20, 20, 20, 0.25);      /* Dark background at 25% opacity */
    --glass-border: rgba(255, 255, 255, 0.08); /* Subtle border */
  }

  /* ===== TITLEBAR LAYOUT ===== */
  .titlebar {
    height: var(--tb-height);
    display: flex;                    /* Flexbox for horizontal layout */
    justify-content: space-between;   /* Space items apart (left, middle, right) */
    align-items: center;              /* Vertically center all items */
    padding: 0 0 0 8px;              /* Left padding for menu, right handled by controls */
    position: fixed;                  /* Fixed to top of window */
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;                   /* Ensure it's above all other content */
    user-select: none;               /* Prevent text selection in titlebar */
    font-family: var(--font-ui);
    color: white;
  }

  /* Middle spacer that allows window dragging and fills empty space */
  .drag-spacer {
    flex-grow: 1;                    /* Expand to fill available space */
    height: 100%;
  }

  /* ===== LEFT MENU SECTION ===== */
  .project-menu {
    position: relative;              /* Allows dropdown to position absolutely relative to this */
    -webkit-app-region: no-drag;    /* Prevent dragging from this interactive area */
    margin-right: 8px;
  }

  /* Main menu button */
  .menu-trigger {
    display: flex;
    align-items: center;
    gap: 8px;                        /* Space between icon, text, and chevron */
    background: transparent;
    border: none;
    color: #eeeeee;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.1s;     /* Smooth hover transition */
    height: 32px;
  }

  /* Hover state for menu button */
  .menu-trigger:hover {
    background: var(--tb-hover);
  }

  /* Active state when dropdown is open */
  .menu-trigger.active {
    background: var(--tb-active);
  }

  /* Folder icon styling */
  .app-icon {
    opacity: 0.8;                    /* Slightly transparent for subtlety */
  }

  /* Wrapper for chevron icon to enable rotation animation */
  .icon-wrapper {
    display: flex;
    transition: transform 0.2s cubic-bezier(0, 0, 0, 1); /* Smooth rotation */
  }

  /* Rotated state - flips chevron upside down when dropdown opens */
  .rotated {
    transform: rotate(180deg);
  }

  /* ===== DROPDOWN PANEL (25% Opacity Glass Effect) ===== */
  .dropdown-panel {
    position: absolute;              /* Position relative to .project-menu */
    top: calc(100% + 4px);          /* 4px below the menu button */
    left: 0;                        /* Align to left edge of menu */
    width: 220px;
    
    /* Glass effect background with 25% opacity constraint */
    background: var(--glass-bg);
    
    /* Heavy blur ensures readability despite low opacity */
    backdrop-filter: blur(40px);    /* Creates frosted glass effect */
    
    border: 1px solid var(--glass-border);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2); /* Depth shadow */
    border-radius: 6px;
    padding: 4px;
    overflow: hidden;
    transform-origin: top left;      /* Animation starts from top-left */
  }

  /* Individual menu item button */
  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;                       /* Space between icon and text */
    width: 100%;
    padding: 8px 12px;
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

  /* Menu item hover state */
  .menu-item:hover {
    background: var(--tb-hover);
  }

  /* ===== RIGHT WINDOW CONTROLS ===== */
  .window-controls {
    display: flex;
    height: 100%;                    /* Full height to hit window's top edge */
    -webkit-app-region: no-drag;    /* Make buttons clickable, not draggable */
  }

  /* Standard window control button (minimize, maximize, close) */
  .control-btn {
    width: 46px;                     /* Standard Windows control button width */
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: #ffffff;
    cursor: default;                 /* Windows standard cursor for controls */
    transition: background 0.1s;
    border-radius: 0;                /* Windows buttons have no border radius */
  }

  /* Generic control button hover */
  .control-btn:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  /* Close button hover - uses Windows standard red */
  .close-btn:hover {
    background: #c42b1c;             /* Standard Windows 11 close button red */
    color: white;
  }
</style>