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
		return template.replace(/\{\S+?\}/mg, convertFunc);
	};

	mod.getLink = function(resourceId, data) {
		var resource = mod.resourcesHash[resourceId];
		return mod.getLinkFromTemplate(resource.template, data);
	};

})(geolink);