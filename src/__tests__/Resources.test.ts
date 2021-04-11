import { resourcesHash } from '../Resources';

test('get osm template', () => {
  expect((resourcesHash["osm"] as any).template).toBe("https://www.openstreetmap.org/?mlat={latdegdec}&mlon={londegdec}&zoom={osmzoom}&layers=M");
});