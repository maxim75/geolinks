
var GeolinksHomePage = React.createClass({
	getInitialState: function() {
		

		return { 
			locationData: {
				lat: parseFloat("-34.06"),
				lng: parseFloat("151.1"),
				zoom: 18,
				title: "Title",
				language: "en"
			}
		};
	},



	render: function() {
		return (
			<div className="geolinksHomePage">
				<h1>Test</h1>
				<h4>{ this.props.version }</h4>
				<LocationForm />
				<ResourceList locationData={ this.state.locationData } />
			</div>
		);
	}
});

var LocationForm = React.createClass({
	getInitialState: function() {
		return { 
			lat: 2.3,
			lng: 4.5

		};
	},

	componentDidMount: function() {
		console.log("componentDidMount", arguments);
	},

	latChange: function(event) {
		this.setState({ lat: parseFloat(event.target.value) });
	},

	lngChange: function(event) {
		this.setState({ lng: parseFloat(event.target.value) });
	},

	addressRef: function() {
		console.log("addressRef", arguments);
	},

	render: function() {
		return (
			<div>
			<div className="row">
	        <div className="col-md-12">
	           <form>
	              <div className="form-group">
	                <label htmlFor="address">Address</label>
	                <input type="text" className="form-control" id="address" placeholder="Location address, for example city, street, etc" ref={this.addressRef} />
	              </div>
	            </form>
	        </div>
	      </div>

	      <div className="row">
	        <div className="col-md-6">
	          <div className="form-group">
	            <label htmlFor="latitude">Latitude</label>
	            <input type="text" className="form-control" id="latitude" placeholder="Latitude" value={this.state.lat} onChange={this.latChange} />
	          </div>
	        </div>
	        <div className="col-md-6">
	          <div className="form-group">
	            <label htmlFor="longitude">Longitude</label>
	            <input type="text" className="form-control" id="longitude" placeholder="Longitude" value={this.state.lng} onChange={this.lngChange} />
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

		var data = {
			lat: parseFloat("1.1"),
			lng: parseFloat("2.2"),
			zoom: 18,
			title: "Title",
			language: "en"
		};

		return geolink.getLink(this.props.id, this.props.locationData);
	},

	render: function() {
		return (
			<tr id={this.props.key}>
				<td >
					<p>{ this.props.id }</p>
				</td>
				<td>
					<a href={ this.getUrl() }>
						{ this.getUrl() }
					</a>
				</td>
			</tr>
		);
	}
});


ReactDOM.render(
	<GeolinksHomePage version="0.3" />,
	document.getElementById('content')
);

console.log("here");