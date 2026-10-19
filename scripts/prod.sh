#!/bin/sh
# Production build + static preview (service worker + offline only work here, not in dev)
export PATH="/Users/pratitasujatmika/.nvm/versions/node/v24.14.0/bin:$PATH"
cd "$(dirname "$0")/.." && npm run build && exec npm run preview -- --port 5194 --host
