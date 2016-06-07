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