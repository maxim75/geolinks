self.getLocaionList = function(search, callback) {
		self.loading(true);
		$.ajax({ 
			method: "GET",
			url: "https://open.mapquestapi.com/nominatim/v1/search", 
			data: { format: "json", q: search }
		})
		.done(function(response) { self.onSearchResponse(response, callback) })
		.fail(function(result) { trace("LocationSearchView nominatim call error", result); })
		.always(function() { self.loading(false); });	
	};

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

	self.address = ko.observable();
	self.addressInputTextElement = ko.observable();
	self.lat = ko.observable(loc[0]);
	self.lng = ko.observable(loc[1]);
	self.template = ko.observable("{bbSouth} {bbNorth} {bbEast} {bbWest}");

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
		$(self.addressInputTextElement()).autocomplete({
			minLength: 3,
      
			source: function(request, response ) {
				$.ajax({ 
					method: "GET",
					url: "https://open.mapquestapi.com/nominatim/v1/search", 
					data: { format: "json", q: request.term }
				})
				.done(function(result) { 
					var list = _(result).map(function(x) {
						return { label: x.display_name, lat: x.lat, lng: x.lon };
					});
					response(list);
				});
			},

			select: function( event, ui ) {
				self.lat(ui.item.lat);
				self.lng(ui.item.lng);
			}
		});

		$(self.addressInputTextElement()).data("ui-autocomplete")._renderItem = function (ul, item) {
			var $li = $("<li></li>");
			$li.text(item.label);
			ul.append($li);

			return $li;
		};
	});
};

var vm = new Vm();
ko.applyBindings(vm, $("body")[0]);