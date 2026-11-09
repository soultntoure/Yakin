# Amanah Ayam (demo)

Clickable mobile-web prototype for halal restaurant owners in Kuantan. Static frontend, no backend. All suppliers, ratings and prices are fictional demo data.

    npm install
    npm run dev       # local, also reachable from your phone on the same Wi-Fi
    npm test          # distance, filter/sort and halal-status logic
    npm run build     # outputs dist/, deploy to Vercel or Netlify as a static site

Open the deployed link once on each phone while online; after that it works offline (map tiles are cached for areas already viewed). Use "Add to Home Screen" to install it.

Routing uses the URL hash, so no rewrite rules are needed on the host.
