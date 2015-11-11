
ko.bindingHandlers.element = {
    init: function (element, valueAccessor) {
        var target = valueAccessor();
        target(element);
    }
};

var Vm = function() {
          
	var self = this;

	var syd = ["-33.865", "151.209444"];
	
	var loc = syd;

	self.version = "0.2";
	self.address = ko.observable();
	self.addressInputTextElement = ko.observable();
	self.lat = ko.observable(loc[0]);
	self.lng = ko.observable(loc[1]);
	self.template = ko.observable("{bbSouth} {bbNorth} {bbEast} {bbWest}");

	self.minJsLink = ko.computed(function() {
		return "https://cdn.rawgit.com/maxim75/geolinks/" + self.version + "/dist/geolinks.min.js";
	});

	self.jsLink = ko.computed(function() {
		return "https://cdn.rawgit.com/maxim75/geolinks/" + self.version + "/dist/geolinks.js";
	});


	self.data = ko.computed(function() {
		return {
			lat: parseFloat(self.lat()),
			lng: parseFloat(self.lng()),
			zoom: 18,
			title: "Title",
			language: "en"
		};
	});

	self.templateResult = ko.computed(function() {
		return geolink.getLinkFromTemplate(self.template(), self.data());
	});

	self.addressInputTextElement.subscribe(function() {
		var autocomplete = new google.maps.places.Autocomplete(self.addressInputTextElement(), {});
			google.maps.event.addListener(autocomplete, 'place_changed', function() {
	        var place = autocomplete.getPlace();
	        console.log(place.geometry.location.lng());

	        self.lat(place.geometry.location.lat());
			self.lng(place.geometry.location.lng());
	    });
	});
};

var vm = new Vm();
ko.applyBindings(vm, $("body")[0]);