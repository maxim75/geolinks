# geolinks

Links to resources with geographical coordinates

- [Google Map](https://www.google.com/maps)
- Open Street Map
- Yandex Map
- [Mapillary](https://www.mapillary.com/)

```javascript
// get link to Google Map (resource ID: "google") 
var googleMapLink = geolink.getLink("google", {lat: -33.865, lng: 151.209, zoom: 10} );
// returns
// https://maps.google.com/maps?ll=-33.865,151.209&q=-33.865,151.209&hl=en&t=m&z=10
```

More details and interactive demo available at

[http://geolinks.kozlenko.info/](http://geolinks.kozlenko.info/)

[![Version Badge][npm-img]][npm-url]
[![Build Status](https://travis-ci.org/maxim75/geolinks.svg)](https://travis-ci.org/maxim75/geolinks)

