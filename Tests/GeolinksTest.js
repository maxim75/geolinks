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

	//---------------

	test("osm", function() {
		equal(mod.getLink("osm", getTestData()), "https://www.openstreetmap.org/?mlat=-1.2&mlon=-3.4&zoom=8&layers=M");
	});

	test("geohack", function() {
		equal(mod.getLink("geohack", getTestData()), "https://tools.wmflabs.org/geohack/geohack.php?pagename=Test&params=1_11_60.0000_S_3_23_60.0000_W");
	});

})(geolink);