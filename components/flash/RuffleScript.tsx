import * as React from "react";
import Script from "next/script";

// Pinned so the integrity hash stays valid. To upgrade, bump the version and recompute the hash:
//   curl -sL https://unpkg.com/@ruffle-rs/ruffle@<version>/ruffle.js | openssl dgst -sha384 -binary | openssl base64 -A
const RUFFLE_VERSION = "0.6.0";
const RUFFLE_SRC = `https://unpkg.com/@ruffle-rs/ruffle@${RUFFLE_VERSION}/ruffle.js`;
const RUFFLE_INTEGRITY = "sha384-eYV2CNXhSXdisg3+UbVhJIIRzygKoAWlfmBTkftwI9bsN5ctHUovLhbLzCcTelXF";

/**
 * Ruffle - Flash emulator. Once loaded it auto-polyfills every Flash `<embed>`/`<object>` on the
 * page, including ones added later (e.g. by the FlashPlayerModal). Only render this on pages
 * that contain Flash content.
 */
export const RuffleScript: React.FC = () => (
  <Script
    src={RUFFLE_SRC}
    integrity={RUFFLE_INTEGRITY}
    crossOrigin="anonymous"
    strategy="lazyOnload"
  />
);
