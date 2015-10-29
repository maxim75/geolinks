
var GeolinksHomePage = React.createClass({
  render: function() {
    return (
      <div className="geolinksHomePage">
        <h1>Geolinks</h1>
      </div>
    );
  }
});

ReactDOM.render(
  <GeolinksHomePage />,
  document.getElementById('content')
);

console.log("here");