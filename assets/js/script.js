
$(document).ready( function()	{

	var width = parseInt($('.map').css('width')),
		height = width * 0.5,
		active;

	var projection = d3.geo.mercator()
	    .center([-98, 35])
	    .scale(6400)
	    .translate([575, 300])
	    .precision(1);

	var scale = d3.scale.log()
		.domain([1, 5.6])
		.range([1,5]);

	var path = d3.geo.path().projection(projection);

	var svg = d3.select(".map")
		.append("svg")
		.style("width", width + "px")
		.style("height", height + "px");

	var g = svg.append("g");

	d3.json("assets/data/combined.json", function(error, data) {

		var counties = data.objects.counties,
        earthquakes = data.objects.earthquakes,
        faultlines = data.objects.faultlines,
        wells = data.objects.iwells;

		var county = g.append("g")
			.attr("class", "counties")
			.selectAll("path")
			.data(topojson.feature(data, counties).features)
			.enter()
			.append("path")
			.attr("class", "county")
			.attr("d", path)
			.on("click", clicked);

    var faultline = g.append("g")
      .attr("class", "faultlines")
			.selectAll("path")
			.data(topojson.feature(data, faultlines).features)
			.enter()
			.append("path")
			.attr("class", "faultline")
			.attr("d", path);

    var wells = g.append("g")
      .attr("class", "wells")
      .selectAll("path")
      .data(topojson.feature(data, wells).features)
      .enter()
      .append("path")
      .attr("class", "well")
      .attr("d", path.pointRadius(1.5));

		var earthquake = g.append("g")
			.attr("class", "earthquakes")
			.selectAll("path")
			.data(topojson.feature(data, earthquakes).features.sort( function(a, b) { return b.properties.origintime - a.properties.origintime; }))
			.enter()
			.append("path")
			.attr("class", "earthquake")
      //.attr("d", path.pointRadius(1.5));
// 			.attr("d", path.pointRadius(0.1))
// 			.transition()
// 			.duration(1500)
// 			.delay(function(d, i) { return i * 5; })
			.attr("d", path.pointRadius( function(d) { if ( !d.properties.magnitude || d.properties.magnitude < 2.5 ) { return 1.5 } else { return scale(d.properties.magnitude); } } ));

	});

	function clicked(d) {
		if (active === d) return reset();
		g.selectAll(".active").classed("active", false);
		d3.select(this).classed("active", active = d);

		var b = path.bounds(d);
		g.transition()
			.duration(750)
			.attr("transform",
			"translate(" + projection.translate() + ")"
			+ "scale(" + .85 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
			+ "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
	}

	function reset() {
		g.selectAll(".active").classed("active", active = false);
		g.transition().duration(750).attr("transform", "");
	}

});
