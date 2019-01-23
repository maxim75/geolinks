/* 
 * Copyright (C) 2015 Maksym Kozlenko <max@kozlenko.info>
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

(function (mod) {
    "use strict";

    QUnit.module("Geolinks");

    var getTestData = function() {
    	return { lat: -1.2, lng: -3.4, zoom: 8, title: "ABC DEF", language: "uk" };
    };

    test("init", function() {
		ok(mod.resources);
	});

	test("getFieldsFromTemplate", function() {
		var result = mod.getFieldsFromTemplate("{a}aaa{b}--{xyz}");
		equal(result.length, 3);
		equal(result[0], "{a}");
		equal(result[1], "{b}");
		equal(result[2], "{xyz}");
	});

	test("latdegdec", function() {
		equal(mod.getLinkFromTemplate("{latdegdec}", getTestData()), "-1.2");
	});

	test("londegdec", function() {
		equal(mod.getLinkFromTemplate("{londegdec}", getTestData()), "-3.4");
	});

	test("osmzoom", function() {
		equal(mod.getLinkFromTemplate("{osmzoom}", getTestData()), "8");
	});

	test("title", function() {
		equal(mod.getLinkFromTemplate("{title}", getTestData()), "ABC DEF");
	});

	test("titlee", function() {
		equal(mod.getLinkFromTemplate("{titlee}", getTestData()), "ABC%20DEF");
	});

	test("language", function() {
		equal(mod.getLinkFromTemplate("{language}", getTestData()), "uk");
	});

	test("latdegabs", function() {
		equal(mod.getLinkFromTemplate("{latdegabs}", getTestData()), "1"); 
	});

	test("latminint", function() {
		equal(mod.getLinkFromTemplate("{latminint}", getTestData()), "11");
	});

	test("latsecdec", function() {
		equal(mod.getLinkFromTemplate("{latsecdec}", getTestData()), "60.0000");
	});

	test("latsecdec", function() {
		equal(mod.getLinkFromTemplate("{latsecdec}", getTestData()), "60.0000");
	});

})(geolink);

(function (mod) {
    "use strict";

    QUnit.module("Geolinks getLink");

    var getTestData = function() {
    	return { lat: -1.2, lng: -3.4, zoom: 8, title: "ABC DEF", language: "uk" };
	};
	
	test("google", function() {
		equal(mod.getLink("google", getTestData()), "https://www.google.com/maps?ll=-1.2,-3.4&q=-1.2,-3.4&hl=uk&t=m&z=8");
	});

	test("osm", function() {
		equal(mod.getLink("osm", getTestData()), "https://www.openstreetmap.org/?mlat=-1.2&mlon=-3.4&zoom=8&layers=M");
	});

	test("geohack", function() {
		equal(mod.getLink("geohack", getTestData()), "https://tools.wmflabs.org/geohack/geohack.php?pagename=Test&params=1_11_60.0000_S_3_23_60.0000_W");
	});

	test("mapillary", function() {
		equal(mod.getLink("mapillary", getTestData()), "http://www.mapillary.com/map/search/-1.2/-3.4/8");
	});

	test("wikimapia", function() {
		equal(mod.getLink("wikimapia", getTestData()), "http://wikimapia.org/#lang=en&lat=-1.2&lon=-3.4&z=8");
	});

	test("geocaching", function() {
		equal(mod.getLink("geocaching", getTestData()), "https://www.geocaching.com/map/?ll=-1.2,-3.4&z=8");
	});

	test("waze", function() {
		equal(mod.getLink("waze", getTestData()), "https://www.waze.com/livemap/?zoom=8&lat=-1.2&lon=-3.4");
	});

	test("fotki.yandex.ru", function() {
		equal(mod.getLink("fotki.yandex.ru", getTestData()), "https://fotki.yandex.ru/map/?lng=-1.2&lat=-3.4&zoom=8");
	});

	test("marinetraffic", function() {
		equal(mod.getLink("marinetraffic", getTestData()), "https://www.marinetraffic.com/en/ais/home/centerx:-3.4/centery:-1.2/zoom:8");
	});

	test("latlon", function() {
		equal(mod.getLink("latlon", getTestData()), "-1.2,-3.4");
	});

	test("wkt", function() {
		equal(mod.getLink("wkt", getTestData()), "POINT(-3.4 -1.2)");
	});

	test("geojson", function() {
		equal(mod.getLink("geojson", getTestData()), "{ \"type\": \"Point\", \"coordinates\": [ -3.4, -1.2 ] }");
	});

	test("wikipedia template", function() {
		equal(mod.getLink("wikipedia template", getTestData()), "{{Coord |-1.2|-3.4display=title} }");
	});

	test("wikimedia commons location", function() {
		equal(mod.getLink("wikimedia commons location", getTestData()), "{{Location dec|-1.2|-3.4}}");
	});

	test("geo uri", function() {
		equal(mod.getLink("geo uri", getTestData()), "geo:-1.2,-3.4");
	});

	test("geonames google", function() {
		equal(mod.getLink("geonames google", getTestData()), "http://www.geonames.org/maps/google_-1.2_-3.4.html");
	});

	test("geolocator", function() {
		equal(mod.getLink("geolocator", getTestData()), "http://tools.freeside.sk/geolocator/geolocator.html?params=-1.2_-3.4");
	});

	test("domain.com.au", function() {
		equal(mod.getLink("domain.com.au", getTestData()), "http://www.domain.com.au/search/buy/?mode=buy&displmap=1&startloc=-1.2449660802959366%2c-3.444975944263748&endloc=-1.1550339197040633%2c-3.355024055736252");
	});

	test("commercialrealestate.com.au", function() {
		equal(mod.getLink("commercialrealestate.com.au", getTestData()), "http://www.commercialrealestate.com.au/for-sale/?bb=-1.1550339197040633%2C-1.2449660802959366%2C-3.355024055736252%2C-3.444975944263748%2C8");
	});

	test("geolinks", function() {
		equal(mod.getLink("geolinks", getTestData()), "http://geolinks.kozlenko.info/?q=-1.2,-3.4");
	});

	test("wikishootme", function() {
		equal(mod.getLink("wikishootme", getTestData()), "https://tools.wmflabs.org/wikishootme/index.html#lat=-1.2&lng=-3.4&zoom=8");
	});

	test("INVALID", function() {
		throws(function() { mod.getLink("INVALID", getTestData()) }, "Invalid resource ID: INVALID" ,"Exception expected");
	});
})(geolink);


(function (mod) {
    "use strict";

    QUnit.module("Geolinks parseUrl");

    test("parseUrl invalid", function() {
		equal(null, mod.parseUrl("ABC"));
	});

	test("parseUrl lat,lng", function() {
		var result = mod.parseUrl("test/1.2,-34.567/zzz");
		equal(result.lat, 1.2);
		equal(result.lng, -34.567);
		equal(result.language, "en");
		equal(result.zoom, 15);
	});

	test("parseUrl lat lng", function() {
		var result = mod.parseUrl("aaa 1.2 -34.567 NNNN");
		equal(result.lat, 1.2);
		equal(result.lng, -34.567);
	});

	test("parseUrl lat;lng", function() {
		var result = mod.parseUrl("aaa 1.2;-34.567 NNNN");
		equal(result.lat, 1.2);
		equal(result.lng, -34.567);
	});

	test("parseUrl Google Maps", function() {
		var result = mod.parseUrl("https://www.google.com.au/maps/place/Douglas+Park/@-34.1909818,150.7130019,15.5z/data=!4m2!3m1!1s0x6b12fc6f59d70d01:0x1d0609b5909b97b0");
		equal(result.lat, -34.1909818);
		equal(result.lng, 150.7130019);
		equal(result.zoom, 15);
	});

	test("parseUrl Geohack", function() {
		var result = mod.parseUrl("https://tools.wmflabs.org/geohack/geohack.php?pagename=Douglas_Park_railway_station&params=-34.183237_N_150.710117_E_region:AU-NSW_type:railwaystation");
		equal(result.lat, -34.183237);
		equal(result.lng, 150.710117);
	});
})(geolink);