
var GeolinksHomePage = React.createClass({


	render: function() {
		return (
			<div className="geolinksHomePage">
				<h1>Test</h1>
				<h4>{ this.props.version }</h4>
				<div>{ 2+2 }</div>
				<ResourceList />
			</div>
		);
	}
});

var ResourceList = React.createClass({


	render: function() {

		

		var resourceNodes = geolink.resources.map(function (x) {
			return (
				<ResourceLink key={x.id} id={x.id}>
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

		return geolink.getLink(this.props.id, data);
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