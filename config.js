// Central configuration for the frontend
const CONFIG = {
    // Determine the Backend URL based on the current environment
    BACKEND_URL: 'https://nonjuristic-audria-uncapturable.ngrok-free.dev', // Active ngrok backend

    // Add other environment-specific settings here
    DISCORD_CLIENT_ID: '1405503287129804883'
};

// Export as a global variable if needed (for non-module scripts)
window.FRONTEND_CONFIG = CONFIG;
