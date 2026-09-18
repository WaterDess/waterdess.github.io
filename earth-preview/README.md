# Isolated Earth cover preview

Published at `/earth-preview/`; local file entry: `../earth-preview.html`.
The live homepage and shared assets are unchanged. Both shells reuse the current
site renderer, then add this preview's sphere renderer and styles.

Native WebGL renders a textured analytical sphere with lighting and atmosphere.
Rotation takes approximately six minutes. Pause/resume is keyboard accessible;
reduced-motion preference starts paused; hidden tabs stop rendering. Missing
WebGL, context loss, or failed textures retain the original static Earth.

`texture.js` embeds earth.jpg and clouds.png as data URLs for file:// support.
Background source and image licenses are documented in credits.html and
../public/assets/earth-preview/STAR-LICENSE.md. All runtime assets are local.

Validation: node --check earth-preview/earth.js; node --check site.js;
node --check data/site.js; git diff --check. Inspect desktop/mobile layout and
pause/resume in a browser before deployment. Only stage these new preview files.
