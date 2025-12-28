import { invoke } from "@tauri-apps/api/core";

export const ssr = false; // Required for Tauri

export const load = async () => {
    // DIRECTLY call invoke. No onMount needed here.
    const name = await invoke("get_full_name");
    
    console.log("Full name from Rust:", name);

    // Return it so the UI can use it
    return {
        fullName: name
    };
};