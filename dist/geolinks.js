/* 
 * Copyright (C) 2015 Maksym Kozlenko <max@kozlenko.info>
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

 var geolink = geolink || {};

 (function(mod) {

	

	var toDms = function(deg) {
        var d = parseInt(deg, 10);
        var md = Math.abs(deg-d) * 60;
        var m = parseInt(md, 10);
        var sd = (md - m) * 60;
        return [d, m, sd];
    };

    var toRad = function(x) {
		return x * Math.PI / 180;
	};

	var toDegrees = function(x) {
		return x * 180 / Math.PI;
	};

	var zoomToRadius = function(zoom) {
		return 5;
	};

	var toBoundingBox = function(data) {
		var R = 6371;  // earth radius in km
		var radius = zoomToRadius(data.zoom); // km

		var lngOffset = toDegrees(radius/R/Math.cos(toRad(data.lat)));
		var latOffset = toDegrees(radius/R);

		return {
			"south": data.lat - latOffset,
			"north": data.lat + latOffset,
			"east": data.lng + lngOffset,
			"west": data.lng - lngOffset,
		};
	};

	var converters = {
		"{latdegdec}": function(data) { return data.lat; },
		"{londegdec}": function(data) { return data.lng; },
		"{osmzoom}": function(data) { return data.zoom; },
		"{title}": function(data) { return data.title; },
		"{titlee}": function(data) { return encodeURIComponent(data.title); },
		"{language}": function(data) { return data.language || "en"; },
		"{latdegabs}": function(data) { return Math.abs(toDms(data.lat)[0]); },
		"{latminint}": function(data) { return toDms(data.lat)[1]; },
		"{latsecdec}": function(data) { return toDms(data.lat)[2].toFixed(4); },
		"{latNS}": function(data) { return data.lat < 0 ? "S" : "N"; },
		"{londegabs}": function(data) { return Math.abs(toDms(data.lng)[0]); },
		"{lonminint}": function(data) { return toDms(data.lng)[1]; },
		"{lonsecdec}": function(data) { return toDms(data.lng)[2].toFixed(4); },
		"{lonEW}": function(data) { return data.lng < 0 ? "W" : "E"; },
		"{bbSouth}": function(data) { return toBoundingBox(data).south; },
		"{bbNorth}": function(data) { return toBoundingBox(data).north; },
		"{bbEast}": function(data) { return toBoundingBox(data).east; },
		"{bbWest}": function(data) { return toBoundingBox(data).west; },
	};

	mod.getLinkFromTemplate = function(template, data) {
		var convertFunc = function(x) {
			return converters[x] ? converters[x](data) : x;
		};
		return template.replace(/\{.+?\}/mg, convertFunc);
	};

	mod.getLink = function(resourceId, data) {
		var resource = mod.resourcesHash[resourceId];
		return mod.getLinkFromTemplate(resource.template, data);
	};

})(geolink);
/* 
 * Copyright (C) 2015 Maksym Kozlenko <max@kozlenko.info>
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

 var geolink = geolink || {};

 (function(mod) {

    // https://en.wikipedia.org/wiki/Template:GeoTemplate
    mod.resources = [
        { 
            id: "bing", 
            template: "https://www.bing.com/maps/?v=2&cp={latdegdec}~{londegdec}&style=r&lvl={osmzoom}&sp=Point.{latdegdec}_{londegdec}_{titlee}___"
        },

        { 
            id: "google", 
            template: "https://maps.google.com/maps?ll={latdegdec},{londegdec}&q={latdegdec},{londegdec}&hl={language}&t=m&z={osmzoom}"
        },

        { 
            id: "osm", 
            template: "https://www.openstreetmap.org/?mlat={latdegdec}&mlon={londegdec}&zoom={osmzoom}&layers=M"
        },

        { 
            id: "wikimapia", 
            template: "http://wikimapia.org/#lang={language}&lat={latdegdec}&lon={londegdec}&z={osmzoom}&m=w"
        },

        { 
            id: "geolocation.ws", 
            template: "https://www.geolocation.ws/map/{latdegdec},{londegdec}/{osmzoom}",
            tags: [ "photo" ]
        },

        { 
            id: "yandex", 
            template: "https://maps.yandex.ru/?ll={londegdec},{latdegdec}&spn={span},{span}&l=map&pt={londegdec},{latdegdec}"
        },

        { 
            id: "visicom", 
            template: "http://maps.visicom.ua/#lng={londegdec};lat={latdegdec};z=6;map=ukraine_en;lngm={londegdec};latm={latdegdec};",
            tags: [ "country-ua" ]
        },

        {
            id: "acme mapper",
            template: "http://mapper.acme.com/?ll={latdegdec},{londegdec}&z={osmzoom}&t=M&marker0={latdegdec},{londegdec},{titlee}"
        },

        {
            id: "arctic.io",
            template: "http://www.arctic.io/wikipedia/?lon={londegdec}&lat={latdegdec}&title={titlee}"
        },

        {
            id: "wikidata",
            template: "https://tools.wmflabs.org/wikidata-todo/around.html?lat={latdegdec}&lon={londegdec}&radius=15&lang=en"
        },

        {
            id: "commons",
            template: "https://tools.wmflabs.org/wiwosm/osm-on-ol/commons-on-osm.php?zoom={osmzoom}&lat={latdegdec}&lon={londegdec}",
            tags: [ "photo" ]
        },

        {
            id: "flickr",
            template: "https://www.flickr.com/map/?fLat={latdegdec}&fLon={londegdec}&zl={osmzoom}",
            tags: [ "photo" ]
        },

        {
            id: "panoramio",
            template: "http://www.panoramio.com/map/#lt={latdegdec}&ln={londegdec}&z=0&k=0&a=1&tab=1",
            tags: [ "photo" ]
        },

        {
            id: "flightradar24",
            template: "http://www.flightradar24.com/{latdegdec},{londegdec}/{osmzoom}",
            tags: [  ]
        },

        {
            id: "street-directory.com.au",
            template: "http://www.street-directory.com.au/sd_new/genmap.cgi?x={londegdec}&y={latdegdec}&sizex=800&sizey=800&level=5&star=6",
            tags: [ "country-au" ]
        },

        {
            id: "mapillary",
            template: "http://www.mapillary.com/map/search/{latdegdec}/{londegdec}/{osmzoom}",
            tags: [ "photo" ]
        },

        {
            id: "commercialrealestate.com.au",
            template: "http://www.commercialrealestate.com.au/for-sale/?bb={bbNorth}%2C{bbSouth}%2C{bbEast}%2C{bbWest}%2C{osmzoom}",
            tags: [ "real estate", "country-au" ]
        },

        {
            id: "zillow",
            template: "http://www.zillow.com/homes/for_sale/featured_sort/{bbNorth},{bbEast},{bbSouth},{bbWest}_rect/",
            tags: [ "real estate", "country-us" ]
        },

        {
            id: "osm missing streets",
            template: "http://tools.geofabrik.de/osmi/?view=highways&lon={londegdec}&lat={latdegdec}&zoom={osmzoom}&overlays=name_missing_major,name_missing_minor",
            tags: [ "osm" ]
        },

        {
            id: "geohack",
            template: "https://tools.wmflabs.org/geohack/geohack.php?pagename=Test&params={latdegabs}_{latminint}_{latsecdec}_{latNS}_{londegabs}_{lonminint}_{lonsecdec}_{lonEW}",
            tags: [ ]
        },

        
    ];

    mod.resourcesHash = {};

    mod.resources.forEach(function(x) {
        mod.resourcesHash[x.id] = x;
    });

})(geolink);