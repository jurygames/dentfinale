# Capture Export

This folder is separate from the main app and is meant for local recording/export assets.

Local access on this machine:

1. Open this folder in Explorer:
   `C:\Users\Tom\Documents\Repos\dentfinale\capture-export`
2. From PowerShell:
   `cd C:\Users\Tom\Documents\Repos\dentfinale\capture-export`
3. The downloaded Winedark media file will be placed here once fetched.

Main app path:

`C:\Users\Tom\Documents\Repos\dentfinale`

If you want to run the app locally for OBS capture:

1. `cd C:\Users\Tom\Documents\Repos\dentfinale`
2. `cmd /c npm run dev`
3. Open `http://localhost:3000`

Current note:

The app's production build is still blocked in this environment by external Google Font fetches in `app/layout.tsx`, but local dev mode is the right path for OBS capture anyway.
