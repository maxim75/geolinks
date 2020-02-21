import { getLink } from '../Geolinks';

test('getLink osm', () => {
  expect(getLink("osm", { lat: -33.1, lng: 151.1 })).toBe("https://www.openstreetmap.org/?mlat=-33.1&mlon=151.1&zoom=undefined&layers=M");
});
