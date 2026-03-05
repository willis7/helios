import { Jimp } from 'jimp';
import { geoNaturalEarth1 } from 'd3-geo';

const width = 800;
const height = 600;
const projection = geoNaturalEarth1().scale(160).translate([400, 300]);

async function run() {
  console.log('Reading image...');
  const image = await Jimp.read(
    'public/static/images/earth-equirectangular.jpg',
  );
  const imgWidth = image.bitmap.width;
  const imgHeight = image.bitmap.height;

  console.log(`Image size: ${imgWidth}x${imgHeight}`);

  // create transparent image
  const out = new Jimp({ width, height, color: 0x00000000 });

  console.log('Projecting...');
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const coords = projection.invert([x, y]);
      if (coords) {
        let [lon, lat] = coords;
        if (isNaN(lon) || isNaN(lat)) continue;
        if (lon < -180 || lon > 180 || lat < -90 || lat > 90) continue;

        let srcX = Math.floor(((lon + 180) / 360) * imgWidth);
        let srcY = Math.floor(((90 - lat) / 180) * imgHeight);

        srcX = Math.max(0, Math.min(srcX, imgWidth - 1));
        srcY = Math.max(0, Math.min(srcY, imgHeight - 1));

        const hex = image.getPixelColor(srcX, srcY);
        // Only set if not black? Or just set it.
        // Equirectangular maps usually cover the whole area, but Natural Earth projection has boundaries.
        // If invert returns valid coords, it's inside the globe.
        out.setPixelColor(hex, x, y);
      }
    }
  }

  console.log('Writing output...');
  await out.write('public/static/images/earth-natural-projected.png');
  console.log('Done');
}

run().catch(console.error);
