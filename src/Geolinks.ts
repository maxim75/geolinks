/*
 * Copyright (C) 2015 Maksym Kozlenko <max@kozlenko.info>
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { resourcesHash } from './Resources';

interface LocationData {
  lat: number;
  lng: number;
  zoom?: number;
  title?: string;
  language?: string;
}

var fieldMatchRegExp = /\{\S+?\}/gm;

function toDms(deg: any) {
  var d = parseInt(deg, 10);
  var md = Math.abs(deg - d) * 60;
  var m = parseInt(md as any, 10);
  var sd = (md - m) * 60;
  return [d, m, sd];
}

var toRad = function(x: number) {
  return (x * Math.PI) / 180;
};

var toDegrees = function(x: number) {
  return (x * 180) / Math.PI;
};

var zoomToRadius = function(zoom: number) {
  return 5;
};

var toBoundingBox = function(data: any) {
  var R = 6371; // earth radius in km
  var radius = zoomToRadius(data.zoom); // km

  var lngOffset = toDegrees(radius / R / Math.cos(toRad(data.lat)));
  var latOffset = toDegrees(radius / R);

  return {
    south: data.lat - latOffset,
    north: data.lat + latOffset,
    east: data.lng + lngOffset,
    west: data.lng - lngOffset,
  };
};

var defaultData = {
  lat: 0,
  lng: 0,
  zoom: 15,
  title: '',
  language: 'en',
};

var extendObject = function(obj1: any, obj2: any) {
  for (var i in obj2) {
    if (!obj1.hasOwnProperty(i)) {
      obj1[i] = obj2[i];
    }
  }
  return obj1;
};

const converters: any = {
  '{latdegdec}': function(data: LocationData) {
    return data.lat;
  },
  '{londegdec}': function(data: LocationData) {
    return data.lng;
  },
  '{osmzoom}': function(data: LocationData) {
    return data.zoom;
  },
  '{title}': function(data: LocationData) {
    return data.title;
  },
  '{titlee}': function(data: LocationData) {
    return encodeURIComponent(data.title || "");
  },
  '{language}': function(data: LocationData) {
    return data.language || 'en';
  },
  '{latdegabs}': function(data: LocationData) {
    return Math.abs(toDms(data.lat)[0]);
  },
  '{latminint}': function(data: LocationData) {
    return toDms(data.lat)[1];
  },
  '{latsecdec}': function(data: LocationData) {
    return toDms(data.lat)[2].toFixed(4);
  },
  '{latNS}': function(data: LocationData) {
    return data.lat < 0 ? 'S' : 'N';
  },
  '{londegabs}': function(data: LocationData) {
    return Math.abs(toDms(data.lng)[0]);
  },
  '{lonminint}': function(data: LocationData) {
    return toDms(data.lng)[1];
  },
  '{lonsecdec}': function(data: LocationData) {
    return toDms(data.lng)[2].toFixed(4);
  },
  '{lonEW}': function(data: LocationData) {
    return data.lng < 0 ? 'W' : 'E';
  },
  '{bbSouth}': function(data: LocationData) {
    return toBoundingBox(data).south;
  },
  '{bbNorth}': function(data: LocationData) {
    return toBoundingBox(data).north;
  },
  '{bbEast}': function(data: LocationData) {
    return toBoundingBox(data).east;
  },
  '{bbWest}': function(data: LocationData) {
    return toBoundingBox(data).west;
  },
};

const parsers = [
  {
    n: 'geohack',
    r: /https:\/\/tools.wmflabs.org\/geohack.*=(-?\d+\.?\d+?)_([NS])_(-?\d+\.?\d+?)_([EW])/,
    f: function(r: any) {
      if (r && r.length === 5) {
        var zoom = Math.floor(parseFloat(r[3]));
        return { lat: r[1], lng: r[3] };
      } else {
        return null;
      }
    },
  },
  {
    n: 'Google Maps',
    r: /https?:\/\/www\.google\..*@(-?\d+\.\d+),(-?\d+\.\d+),(\d+\.?\d?)+z/,
    f: function(r: any) {
      if (r && r.length === 4) {
        var zoom = Math.floor(parseFloat(r[3]));
        return { lat: r[1], lng: r[2], zoom: zoom };
      } else {
        return null;
      }
    },
  },
  {
    n: 'lat,lng',
    r: /(-?\d+\.\d+)[;, ](-?\d+\.\d+)/,
    f: function(r: any) {
      return r && r.length === 3 ? { lat: r[1], lng: r[2] } : null;
    },
  },
];

const getLinkFromTemplate = function(template: string, data: LocationData) {
  var convertFunc = function(x: string) {
    return converters[x] ? converters[x](data) : x;
  };
  return template.replace(fieldMatchRegExp, convertFunc);
};

const getFieldsFromTemplate = function(template: string) {
  return template.match(fieldMatchRegExp);
};

export const getLink = function(resourceId: string, data: LocationData) {
  var resource = resourcesHash[resourceId];

  if (!resource) throw 'Invalid resource ID: ' + resourceId;
  return getLinkFromTemplate(resource.template, data);
};

export const parseUrl = function(url: string) {
  var result = {};

  for (var formatIdx in parsers) {
    var parser = parsers[formatIdx];
    let result = parser.f(url.match(parser.r));
    if (result) break;
  }
  return result ? extendObject(result, defaultData) : null;
};
