<script>
  import TitleBar from '$lib/Titlebar.svelte';
      import { onMount } from "svelte";
    import { invoke } from "@tauri-apps/api/core";
    import { goto } from "$app/navigation";

    let isChecking = true; // Blocks the UI while we check

    onMount(async () => {
        try {
            // 1. Ask Rust: Is this the first run?
            const isFirstRun = await invoke("check_first_run");

            if (isFirstRun) {
                console.log("Status: First Run. Redirecting to /setup...");
                await goto("/setup");
            } else {
                console.log("Status: Normal Run. Continuing...");
                // Optional: If they are on /setup but shouldn't be, kick them out
                // goto("/"); 
            }
        } catch (error) {
            console.error("Failed to check first run status:", error);
        } finally {
            // 2. Allow the UI to render
            isChecking = false;
        }
    });
</script>

<TitleBar />

<main style="padding-top: 32px;">
  {#if isChecking}
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
        <p>Loading...</p>
    </div>
{:else}
    <slot />
{/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
  }
</style>