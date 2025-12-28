<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut, cubicIn } from 'svelte/easing';
  import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-svelte';
  
  // 1. Get the data passed from the backend (username, etc.)
  export let data; 

  // 2. State Management
  let password = "";
  let showPassword = false;
  let isExiting = false; // Controls the "Slide to Left" animation
  let inputElement: HTMLInputElement;

  // 3. Toggle Password Visibility
  function toggleVisibility() {
    showPassword = !showPassword;
    // Keep focus on input so user can keep typing
    if(inputElement) inputElement.focus();
  }

  // 4. Handle Submit
  function handleSubmit() {
    if (!password) return;

    // Trigger the exit animation (Slide Left)
    isExiting = true;

    // Wait for animation to finish (400ms) before actually navigating or saving
    setTimeout(() => {
        console.log("Saving Super Password:", password);
        // TODO: Call Rust invoke here to save password
        // await invoke('save_master_password', { password });
        // goto('/dashboard');
    }, 400);
  }
</script>

{#if !isExiting}
  <main 
    class="container"
    in:fly={{ x: 50, duration: 400, delay: 100, opacity: 0, easing: cubicOut }}
    out:fly={{ x: -50, duration: 300, opacity: 0, easing: cubicIn }}
  >
    
    <div class="header">
      <div class="icon-circle">
        <ShieldCheck size={32} />
      </div>
      <h1>Welcome, {data.fullName}!</h1>
      <p class="subtitle">
        To secure your vault, we need to create a <strong>Super Password</strong>. 
        This key will encrypt everything you store.
      </p>
    </div>

    <div class="form-group">
      <label for="super-pass">Create Master Password</label>
      
      <div class="input-wrapper" class:focused={password.length > 0}>
        <input 
          id="super-pass"
          bind:this={inputElement}
          type={showPassword ? "text" : "password"} 
          bind:value={password}
          placeholder="Enter a strong password..."
          on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        
        <button 
          class="icon-btn" 
          on:click={toggleVisibility} 
          tabindex="-1"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {#if showPassword}
            <EyeOff size={18} />
          {:else}
            <Eye size={18} />
          {/if}
        </button>
      </div>

      <span class="hint">Don't lose this. There is no password reset.</span>
    </div>

    <div class="footer">
      <button 
        class="primary-btn" 
        disabled={password.length === 0}
        on:click={handleSubmit}
      >
        <span>Next</span>
        <ArrowRight size={16} />
      </button>
    </div>

  </main>
{/if}

<style>
  /* --- THEME VARIABLES (Responsive to System) --- */
  :root {
    --font-ui: "Segoe UI Variable", "Segoe UI", sans-serif;
    --anim-speed: 0.2s;
  }

  /* LIGHT MODE DEFAULTS */
  :global(body) {
    --bg-input: rgba(0, 0, 0, 0.04);
    --bg-input-hover: rgba(0, 0, 0, 0.08);
    --bg-input-focus: #ffffff;
    --border-input: rgba(0, 0, 0, 0.1);
    --border-input-focus: var(--accent);
    --text-primary: #1a1a1a;
    --text-secondary: #5d5d5d;
    --accent: #0067c0; /* Windows Blue */
    --accent-hover: #005a9e;
    --accent-text: #ffffff;
    --shadow-card: 0 4px 12px rgba(0,0,0,0.05);
  }

  /* DARK MODE OVERRIDES */
  @media (prefers-color-scheme: dark) {
    :global(body) {
      --bg-input: rgba(255, 255, 255, 0.05);
      --bg-input-hover: rgba(255, 255, 255, 0.08);
      --bg-input-focus: #1e1e1e;
      --border-input: rgba(255, 255, 255, 0.08);
      --border-input-focus: #60cdff;
      --text-primary: #ffffff;
      --text-secondary: #a0a0a0;
      --accent: #60cdff;
      --accent-hover: #7aceff;
      --accent-text: #000000;
      --shadow-card: 0 8px 32px rgba(0,0,0,0.3);
    }
  }

  /* --- LAYOUT --- */
  .container {
    /* height: 100vh; */
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* Pushes Footer to bottom */
    padding: 40px;
    font-family: var(--font-ui);
    color: var(--text-primary);
    max-width: 500px;
    margin: 0 auto;
    position: relative;
    box-sizing: border-box;
  }

  /* --- HEADER STYLES --- */
  .header {
    margin-top: 10vh;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    animation: fade-in 0.6s ease;
  }

  .icon-circle {
    width: 64px;
    height: 64px;
    background: var(--bg-input);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    margin-bottom: 8px;
  }

  h1 {
    font-size: 28px;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
  }

  .subtitle {
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }

  strong {
    color: var(--text-primary);
    font-weight: 600;
  }

  /* --- INPUT STYLES (Windows 11 Style) --- */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 32px;
  }

  label {
    font-size: 14px;
    font-weight: 600;
    margin-left: 2px;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  input {
    width: 100%;
    padding: 12px 44px 12px 16px; /* Right padding for eye icon */
    font-size: 16px;
    border-radius: 6px;
    border: 1px solid transparent;
    border-bottom: 2px solid var(--border-input); /* Windows Style underline hint */
    background: var(--bg-input);
    color: var(--text-primary);
    transition: all var(--anim-speed);
    outline: none;
    font-family: inherit;
  }

  input:hover {
    background: var(--bg-input-hover);
  }

  input:focus {
    background: var(--bg-input-focus);
    border-bottom-color: var(--border-input-focus);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .hint {
    font-size: 12px;
    color: var(--text-secondary);
    margin-left: 4px;
  }

  /* Eye Toggle Button */
  .icon-btn {
    position: absolute;
    right: 8px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    transition: all 0.1s;
  }

  .icon-btn:hover {
    background: var(--bg-input-hover);
    color: var(--text-primary);
  }

  /* --- FOOTER BUTTON (Bottom Right) --- */
  .footer {
    display: flex;
    justify-content: flex-end;
    padding-bottom: 20px;
  }

  .primary-btn {
    background: var(--accent);
    color: var(--accent-text);
    border: none;
    padding: 10px 24px;
    border-radius: 4px; /* Standard Windows radius */
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .primary-btn:hover:not(:disabled) {
    background: var(--accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  .primary-btn:active:not(:disabled) {
    transform: translateY(0);
    opacity: 0.9;
  }

  .primary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--bg-input);
    color: var(--text-secondary);
    box-shadow: none;
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>