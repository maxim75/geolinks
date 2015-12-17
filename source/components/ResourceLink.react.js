var React = require('react');

var GlPage = GlPage || {};

GlPage.isURL = function(str) {
     var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
     var url = new RegExp(urlRegex, 'i');
     return str.length < 2083 && url.test(str);
};

GlPage.ResourceLink = React.createClass({
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

		var tags = geolinks.resourcesHash[this.props.id].tags;

		var tagNodes = tags 
			? tags.map(function (x) {
				return (
					<span className="label label-default">{x}</span>
				) })
			: [];
		

		return (
			<div className="container">
				<div className="row link-grid" id={this.props.key}>
					<div className="col-sm-6 col-xs-12">
						<strong>{ this.props.id }</strong>
						<div>
							{ tagNodes }
						</div>
					</div>
					<div className="col-sm-6 col-xs-12">
						<a {...anchorOpts}>
							{ this.getTextValue() }
						</a>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = GlPage.ResourceLink;