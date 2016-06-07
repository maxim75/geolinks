/* 
 * Copyright (C) 2015 Maksym Kozlenko <max@kozlenko.info>
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

 var geolink = geolink || {};

 (function(mod) {

 	var fieldMatchRegExp = /\{\S+?\}/mg;

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

	var defaultData = {
		lat: 0, 
		lng:  0, 
		zoom: 15, 
		title: "", 
		language: "en"
	};

	var extendObject = function(obj1, obj2) {
       for (var i in obj2) {
          if (!obj1.hasOwnProperty(i)) {
             obj1[i] = obj2[i];
          }
       }
       return obj1;
    };

	mod.converters = {
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

	mod.parsers = [


		{ 
			n: "geohack",
			r: /https:\/\/tools.wmflabs.org\/geohack.*=(-?\d+\.?\d+?)_([NS])_(-?\d+\.?\d+?)_([EW])/, 
			f: function(r) { 
				if(r && r.length === 5) {
					var zoom = Math.floor(parseFloat(r[3]));
					return { lat: r[1], lng: r[3] };
				}
				else {
					return null;
				}
			} 
		},
		{ 
			n: "Google Maps",
			r: /https?:\/\/www\.google\..*@(-?\d+\.\d+),(-?\d+\.\d+),(\d+\.?\d?)+z/, 
			f: function(r) { 
				if(r && r.length === 4) {
					var zoom = Math.floor(parseFloat(r[3]));
					return { lat: r[1], lng: r[2], zoom: zoom };
				}
				else {
					return null;
				}
			} 
		},
		{ 
			n: "lat,lng",
			r: /(-?\d+\.\d+)[;, ](-?\d+\.\d+)/, 
			f: function(r) { 
				return (r && r.length === 3) ? { lat: r[1], lng: r[2] } : null; 
			} 
		} 
	];

	mod.getLinkFromTemplate = function(template, data) {
		var convertFunc = function(x) {
			return mod.converters[x] ? mod.converters[x](data) : x;
		};
		return template.replace(fieldMatchRegExp, convertFunc);
	};

	mod.getFieldsFromTemplate = function(template) {
		return template.match(fieldMatchRegExp);
	};

	mod.getLink = function(resourceId, data) {
		var resource = mod.resourcesHash[resourceId];

		if(!resource) throw ("Invalid resource ID: " + resourceId);
		return mod.getLinkFromTemplate(resource.template, data);
	};

	mod.parseUrl = function(url) {
		var result = {};

		for(var formatIdx in mod.parsers) {
			var parser = mod.parsers[formatIdx];
			result = parser.f(url.match(parser.r));
			if(result) break;
		}
		return result ? extendObject(result, defaultData) : null;
	};

})(geolink);

if(typeof module !== 'undefined') module.exports = geolink;
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
            id: "fotki.yandex.ru", 
            template: "https://fotki.yandex.ru/map/?lng={latdegdec}&lat={londegdec}&zoom={osmzoom}",
            tags: [ "photo" ]
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
            tags: [ "transport" ]
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
            id: "domain.com.au",
            template: "http://www.domain.com.au/search/buy/?mode=buy&displmap=1&startloc={bbSouth}%2c{bbWest}&endloc={bbNorth}%2c{bbEast}",
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

        {
            id: "wikimapia",
            template: "http://wikimapia.org/#lang=en&lat={latdegdec}&lon={londegdec}&z={osmzoom}",
            tags: [ ]
        },

        {
            id: "geocaching",
            template: "https://www.geocaching.com/map/?ll={latdegdec},{londegdec}&z={osmzoom}",
            tags: [ ]
        },

        {
            id: "waze",
            template: "https://www.waze.com/livemap/?zoom={osmzoom}&lat={latdegdec}&lon={londegdec}",
            tags: [ "transport" ]
        },


        {
            id: "marinetraffic",
            template: "https://www.marinetraffic.com/en/ais/home/centerx:{londegdec}/centery:{latdegdec}/zoom:{osmzoom}",
            tags: [ "transport" ]
        },

        {
            id: "latlon",
            template: "{latdegdec},{londegdec}",
            tags: [ "geoformat" ]
        },

        {
            id: "wkt",
            template: "POINT({londegdec} {latdegdec})",
            tags: [ "geoformat" ]
        },

        {
            id: "geojson",
            template: "{ \"type\": \"Point\", \"coordinates\": [ {londegdec}, {latdegdec} ] }",
            tags: [ "geoformat" ]
        },

        {
            id: "wikipedia template",
            template: "{{Coord |{latdegdec}|{londegdec}display=title} }",
            tags: [ "geoformat" ]
        },

        {
            id: "wikimedia commons location",
            template: "{{Location dec|{latdegdec}|{londegdec}}}",
            tags: [ "geoformat" ]
        },
        
        {
            id: "geo uri",
            template: "geo:{latdegdec},{londegdec}",
            tags: [ "geoformat" ]
        },

        {
            id: "geonames google",
            template: "http://www.geonames.org/maps/google_{latdegdec}_{londegdec}.html",
            tags: [ ]
        },

        {
            id: "geolocator",
            template: "http://tools.freeside.sk/geolocator/geolocator.html?params={latdegdec}_{londegdec}",
            tags: [ ]
        },

        {
            id: "geolinks",
            template: "http://geolinks.kozlenko.info/?q={latdegdec},{londegdec}",
            tags: [ ]
        },
    ];

    mod.resourcesHash = {};

    mod.resources.forEach(function(x) {
        mod.resourcesHash[x.id] = x;
    });

})(geolink);