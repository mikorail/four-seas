#!/bin/sh
# Build using available nvm node v24
export PATH="/Users/pratitasujatmika/.nvm/versions/node/v24.14.0/bin:$PATH"
cd "$(dirname "$0")/.." && exec npm run build "$@"
