# Isolated Earth cover preview

Published at `/earth-preview/`; local file entry: `../earth-preview.html`.
The live homepage and shared assets are unchanged. The Genuine Earth Hydrosphere page also uses this renderer. Both shells reuse the current
site renderer, then add this preview's sphere renderer and styles.

Native WebGL renders a textured analytical sphere with lighting and atmosphere.
Rotation takes approximately six minutes. Focus the scene and press Space to pause/resume;
reduced-motion preference starts paused; hidden tabs stop rendering. Missing
WebGL, context loss, or failed textures retain the original static Earth.

`texture.js` embeds earth.jpg and clouds.png as data URLs for file:// support.
Background source and image licenses are documented in credits.html and
../public/assets/earth-preview/STAR-LICENSE.md. All runtime assets are local.

Validation: node --check earth-preview/earth.js; node --check site.js;
node --check data/site.js; git diff --check. Inspect desktop/mobile layout and
keyboard pause/resume in a browser before deployment. Only stage these new preview files.
