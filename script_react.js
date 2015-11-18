
var GlPage = GlPage || {};

GlPage.isURL = function(str) {
     var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
     var url = new RegExp(urlRegex, 'i');
     return str.length < 2083 && url.test(str);
};


window.setLocationUpdates = function(func) {
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

var GeolinksHomePage = React.createClass({
	getInitialState: function() {

		var self = this;

		var urlParameters = GlPage.parseParameterString(window.location.search.substring(1));

		var data = geolink.parseUrl(urlParameters["q"]);
		
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

		window.setLocationUpdates(function(data) {
			if(data && data.loc) {
				var locationData =self.state.locationData;
				locationData.lat = data.loc[0];
				locationData.lng = data.loc[1];
				self.setState({
					locationData: locationData
				})
				
			}
		});

		return { locationData: data	};
	},

	onFormChange: function(newLocationData) {
		var locationData = this.state.locationData;
		locationData.lat = newLocationData.lat;
		locationData.lng = newLocationData.lng;

		this.setState({
			locationData: locationData
		});
	},

	getJsLink: function(minified) {
		return "https://cdn.rawgit.com/maxim75/geolinks/" + this.props.version + 
			(minified ? "/dist/geolinks.min.js" : "/dist/geolinks.js");
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

					<h3>{ geolink.resources.length } Available Resources</h3>

					<LocationForm onChange={ this.onFormChange } locationData={ this.state.locationData } />
					<ResourceList locationData={ this.state.locationData } />
				</div>
			</div>
		);
	}
});

var LocationForm = React.createClass({
	getInitialState: function() {
		return { 
			address: ""
		};
	},

	componentDidMount: function() {
	},

	latChange: function(event) {
		var lat = parseFloat(event.target.value);
		this.props.onChange({ lat: lat, lng: this.props.locationData.lng });
	},

	lngChange: function(event) {
		var lng = parseFloat(event.target.value);
		this.props.onChange({ lat: this.props.locationData.lat, lng: lng });
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
	      </div>
		);
	}
});


var ResourceList = React.createClass({
	render: function() {
		var self = this;
		

		var resourceNodes = geolink.resources.map(function (x) {
			return (
				<ResourceLink key={x.id} id={x.id}  locationData={ self.props.locationData }>
				</ResourceLink>
			);
		});

		return (
			<table className="table">
				<tbody>
					{ resourceNodes }
				</tbody>
			</table>
		);
	}
});

var ResourceLink = React.createClass({
	getUrl: function() { 
		var link = geolink.getLink(this.props.id, this.props.locationData);
		return GlPage.isURL(link) ? link : null;
	},

	getTextValue: function() { 
		return geolink.getLink(this.props.id, this.props.locationData);
	},

	render: function() {
		var anchorOpts = {};
		var url = this.getUrl();

		if(url) anchorOpts.href = url;

		return (
			<tr id={this.props.key}>
				<td >
					<p>{ this.props.id }</p>
				</td>
				<td>
					<a {...anchorOpts}>
						{ this.getTextValue() }
					</a>
				</td>
			</tr>
		);
	}
});


ReactDOM.render(
	<GeolinksHomePage version="0.7" />,
	document.getElementById('content')
);
