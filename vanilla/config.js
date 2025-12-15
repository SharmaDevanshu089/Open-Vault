// Frontend configuration for vanilla demo
// The backend team can be given the value of `window.API_BASE` (e.g. "http://localhost:3000")
// Scripts can read `window.API_BASE` when making fetch requests.

window.API_BASE = window.API_BASE || "http://localhost:3000";
window.FRONTEND_ORIGIN = window.FRONTEND_ORIGIN || location.origin;

// Helpful helper for building full API URLs
window.apiUrl = (path) => {
  return `${window.API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

// You can override these values before this script (e.g., from a server-injected script)
// Example usage in other scripts:
// fetch(window.apiUrl('/update-csv'), { method: 'POST', body: JSON.stringify(...) })
