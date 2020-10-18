/*
 * Copyright (C) 2020 Maksym Kozlenko <max@kozlenko.info>
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { Resource, resources, resourcesHash, ResourceTemplate } from './Resources';

interface LocationData {
  lat: number;
  lng: number;
  zoom?: number;
  title?: string;
  language?: string;
}

const fieldMatchRegExp = /\{\S+?\}/gm;

function toDms(deg: any) {
  const d = parseInt(deg, 10);
  const md = Math.abs(deg - d) * 60;
  const m = parseInt(md as any, 10);
  const sd = (md - m) * 60;
  return [d, m, sd];
}

const toRad = function(x: number) {
  return (x * Math.PI) / 180;
};

const toDegrees = function(x: number) {
  return (x * 180) / Math.PI;
};

const zoomToRadius = function(zoom: number) {
  return 5;
};

const toBoundingBox = function(data: any) {
  const R = 6371; // earth radius in km
  const radius = zoomToRadius(data.zoom); // km

  const lngOffset = toDegrees(radius / R / Math.cos(toRad(data.lat)));
  const latOffset = toDegrees(radius / R);

  return {
    south: data.lat - latOffset,
    north: data.lat + latOffset,
    east: data.lng + lngOffset,
    west: data.lng - lngOffset,
  };
};

const defaultData: LocationData = {
  lat: 0,
  lng: 0,
  zoom: 15,
  title: '',
  language: 'en',
};

const extendObject = function(obj1: any, obj2: any) {
  for (const i in obj2) {
    if (!obj1.hasOwnProperty(i)) {
      obj1[i] = obj2[i];
    }
  }
  return obj1;
};

const converters: any = {
  '{latdegdec}': (data: LocationData) => data.lat,
  '{londegdec}': (data: LocationData) => data.lng,
  '{osmzoom}': (data: LocationData) => data.zoom,
  '{title}': (data: LocationData) => data.title,
  '{titlee}': (data: LocationData) => encodeURIComponent(data.title || ''),
  '{language}': (data: LocationData) => data.language || 'en',
  '{latdegabs}': (data: LocationData) => Math.abs(toDms(data.lat)[0]),
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
        const zoom = Math.floor(parseFloat(r[3]));
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
        const zoom = Math.floor(parseFloat(r[3]));
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
  const convertFunc = function(x: string) {
    return converters[x] ? converters[x](data) : x;
  };
  return template.replace(fieldMatchRegExp, convertFunc);
};

const getFieldsFromTemplate = function(template: string) {
  return template.match(fieldMatchRegExp);
};

export function getLink (resourceId: string, data: LocationData): string {
  const resource = resourcesHash[resourceId];

  if (!resource) throw new Error(`Invalid resource ID: ${resourceId}`);
  return getLinkFromTemplate(resource.template, data);
};

export function getResourceList(): Resource[] {
  return resources.map(resource => ({ "id": resource.id, "tags": resource.tags }));
}

export const parseUrl = function(url: string) {
  let result: LocationData | null = defaultData;

  for (const formatIdx in parsers) {
    const parser = parsers[formatIdx];
    result = parser.f(url.match(parser.r));
    if (result) break;
  }
  return result ? extendObject(result, defaultData) : null;
};
