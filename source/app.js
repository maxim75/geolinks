var React = require('react');
var ReactDOM = require('react-dom');

global.jQuery = require('jquery');
var jqueryui = require('jquery-ui');
var lodash = require('lodash');

var bootstrap = require('bootstrap');
global.geolinks = require('geolinks');

var GlPage = GlPage || {};

GlPage.ResourceLink = require('./components/ResourceLink.react');


console.log("global.geolinks", global.geolinks);

GlPage.setLocationUpdates = function(func) {
    var onUpdate = function(position)
    {
        if(!position)
            func(null);
        else
        {
            var lat = parseFloat((position.coords) ? new String(position.coords.latitude) : position.x);
            var lng = parseFloat((position.coords) ? new String(position.coords.longitude) : position.y);

            func({
                loc: [lat, lng],
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                speed: position.coords.speed,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                date: new Date()
            });
        }
    };

    if(navigator.geolocation)
        navigator.geolocation.watchPosition( 
            onUpdate,
            function(error) { },
            {
            maximumAge: 10000,
            timeout: 5000,
            enableHighAccuracy: true
    	});
};

GlPage.parseParameterString = function(str) {
    var match,
        pl = /\+/g, // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function(s) { return decodeURIComponent(s.replace(pl, " ")); },
        query = str;

    var result = {};
    while (match = search.exec(query))
        result[decode(match[1])] = decode(match[2]);
    return result;
};

GlPage.GeolinksHomePage = React.createClass({
	getInitialState: function() {

		var self = this;

		var urlParameters = GlPage.parseParameterString(window.location.search.substring(1));

		var query = urlParameters["q"];
		var data = query ? geolink.parseUrl(query) : null;
		
		if(!data) {
			data = {
				lat: -34.06,
				lng: 151.1,
				zoom: 18,
				title: "Title",
				language: "en"
			};
		}

		data.lat = parseFloat(data.lat);
		data.lng = parseFloat(data.lng);

		GlPage.setLocationUpdates(function(data) {

			if(data && data.loc) {
				console.log("location update", data);
				self.setState({
					gpsLocation: { lat: data.loc[0], lng: data.loc[1] }
				});

				if(self.state.useGps)
				{
					var locationData = self.state.locationData;
					locationData.lat = data.loc[0];
					locationData.lng = data.loc[1];
					self.setState({
						locationData: locationData
					})
				}
			}
		});

		return { 
			locationData: data,
			useGps: !query
		};
	},

	onFormChange: function(data) {
		var locationData = this.state.locationData;

		if(data.lat !== undefined) locationData.lat = data.lat;
		if(data.lng !== undefined) locationData.lng = data.lng;
		if(data.useGps !== undefined) {
			this.setState({ useGps: data.useGps });
		}

		this.setState({
			locationData: locationData
		});
	},

	getJsLink: function(minified) {
		return "https://cdn.rawgit.com/maxim75/geolinks/" + this.props.version + 
			(minified ? "/dist/geolinks.min.js" : "/dist/geolinks.js");
	},

	componentWillUpdate: function(updatedState) {
		//console.log("componentWillUpdate", arguments);
		return;

		// if(this.state.useGps && this.state.gpsLocation)
		// {
		// 	var locationData = this.state.locationData;
		// 	locationData.lat = this.state.gpsLocation.lat;
		// 	locationData.lng = this.state.gpsLocation.lng;
		// 	this.setState({
		// 		locationData: locationData
		// 	});
		// }
	},

	render: function() {
		return (
			
			<div className="geolinksHomePage">
				<div className="container">
					<h1>geolinks</h1>
	      			<h4>version { this.props.version }</h4>

	      			<p>Generate URLs to various geographical web resources</p>

					<h3>Download</h3>

					<ul className="list-unstyled">
						<li>
							<a href={ this.getJsLink(true) }>geolinks.min.js</a>
						</li>
						<li>
							<a href={ this.getJsLink(false) }>geolinks.js</a>
						</li>
						<li>
							<a href="https://github.com/maxim75/geolinks">Project on GitHub</a>
						</li>
					</ul>

					<h3>Quick start</h3>

					<p>Following code generates link to Google Maps centered at Sydney, Australia</p>


					<pre>
						// get link to Google Map (resource ID: "google")
						var googleMapLink = geolink.getLink("google", &#123;lat: -33.865, lng: 151.209, zoom: 10&#125; );
					</pre>

					<p>
						<code>googleMapLink</code> is set to <code><a href="https://maps.google.com/maps?ll=-33.865,151.209&q=-33.865,151.209&hl=en&t=m&z=10">https://maps.google.com/maps?ll=-33.865,151.209&q=-33.865,151.209&hl=en&t=m&z=10</a></code>
					</p>


					<h3>{ geolinks.resources.length } Available Resources</h3>

					<GlPage.LocationForm onChange={ this.onFormChange } locationData={ this.state.locationData } useGps={ this.state.useGps } />
					<GlPage.ResourceList locationData={ this.state.locationData } />
				</div>
			</div>
		);
	}
});

GlPage.LocationForm = React.createClass({
	getInitialState: function() {
		return { 
			address: ""
		};
	},

	componentDidMount: function() {
	},

	latChange: function(event) {
		var lat = parseFloat(event.target.value);
		this.props.onChange({ lat: lat });
	},

	lngChange: function(event) {
		var lng = parseFloat(event.target.value);
		this.props.onChange({ lng: lng });
	},

	addressChange: function(event) {
		var address = event.target.value;

		this.setState({
			address: address
		});

		var data = geolink.parseUrl(address);
		if(data) {
			this.props.onChange({ lat: data.lat, lng: data.lng });
		}
	},

	useGpsChange: function(event) {
		this.props.onChange({ useGps: event.target.checked  });
	},


	toFixedDecimals: function(value, precision) {
		return parseFloat(value.toFixed(precision));
	},

	addressRef: function(addressElement) {
		var self = this;

		var autocomplete = new google.maps.places.Autocomplete(addressElement, {});
			google.maps.event.addListener(autocomplete, 'place_changed', function() {
	        var place = autocomplete.getPlace();

	        self.props.onChange({ 
	        	lat: self.toFixedDecimals(place.geometry.location.lat(), 4), 
	        	lng: self.toFixedDecimals(place.geometry.location.lng(), 4) 
	        });
	    });
	},

	render: function() {

		return (
			<div>
			<div className="row">
	        <div className="col-md-12">
	           <form>
	              <div className="form-group">
	                <label htmlFor="address">Address</label>
	                <input type="text" className="form-control" id="address" value={this.state.address} onChange={this.addressChange} placeholder="Location address, for example city, street, etc" ref={this.addressRef} />
	              </div>
	            </form>
	        </div>
	      </div>

	      <div className="row">
	        <div className="col-md-6">
	          <div className="form-group">
	            <label htmlFor="latitude">Latitude</label>
	            <input type="text" className="form-control" id="latitude" placeholder="Latitude" value={this.props.locationData.lat} onChange={this.latChange} />
	          </div>
	        </div>
	        <div className="col-md-6">
	          <div className="form-group">
	            <label htmlFor="longitude">Longitude</label>
	            <input type="text" className="form-control" id="longitude" placeholder="Longitude" value={this.props.locationData.lng} onChange={this.lngChange} />
	          </div>
	        </div>
	      </div>

	      <div className="row">
	        <div className="col-md-12">
	        	<div className="checkbox">
				  <label>
				    <input type="checkbox" checked={this.props.useGps} onChange={this.useGpsChange} /> Use GPS position
				  </label>

				</div>
	        </div>
	       </div>



	      </div>
		);
	}
});


GlPage.ResourceList = React.createClass({
	render: function() {
		var self = this;
		
		var resourceNodes = geolinks.resources.map(function (x) {
			return (
				<GlPage.ResourceLink key={x.id} id={x.id}  locationData={ self.props.locationData }>
				</GlPage.ResourceLink>
			);
		});

		return (
			<div className="row">
				{ resourceNodes }
			</div>
		);
	}
});



ReactDOM.render(
	<GlPage.GeolinksHomePage version="0.15" />,
	document.getElementById('content')
); 


