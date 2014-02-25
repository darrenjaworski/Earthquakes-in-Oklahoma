
$(document).ready( function()	{

	var width = parseInt($('.map').css('width')),
		height = width * 0.5,
    parseDateMilli = d3.time.format("%Y-%m-%d %H:%M:%S.%L").parse,
    parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse,
    formatDate = d3.time.format("%Y"),
    translatex = width / 1.73,
    translatey = width / 3.41,
		active;

	var projection = d3.geo.mercator()
	    .center([-98, 35])
	    .scale(width * 6.45)
	    .translate([translatex, translatey])
	    .precision(1);

	var scale = d3.scale.log()
		.domain([1, 5.6])
		.range([1.5,5]);

	var path = d3.geo.path().projection(projection);

	var svg = d3.select(".map")
		.append("svg")
		.style("width", width + "px")
		.style("height", height + "px");

	var g = svg.append("g");

	d3.json("assets/data/combined1.json", function(error, data) {

		var counties = topojson.feature(data, data.objects.county).features,
        earthquakes = topojson.feature(data, data.objects.earthquakes).features,
        faultlines = topojson.feature(data, data.objects.OKfaults_dd).features,
        wells = topojson.feature(data, data.objects.iwells).features;

		var county = g.append("g")
			.attr("class", "counties")
			.selectAll("path")
			.data(counties)
			.enter()
			.append("path")
			.attr("class", "county")
			.attr("d", path)
			.on("click", clicked);

    var faultline = g.append("g")
      .attr("class", "faultlines")
			.selectAll("path")
			.data(faultlines)
			.enter()
			.append("path")
			.attr("class", "faultline")
			.attr("d", path);

    var wells = g.append("g")
      .attr("class", "wells")
      .selectAll("path")
      .data(wells)
      .enter()
      .append("path")
      .attr("class", "well")
      .attr("d", path.pointRadius(1.5));

		var earthquake = g.append("g")
			.attr("class", "earthquakes")
			.selectAll("path")
			.data(earthquakes.sort( function(a, b) { return b.properties.origintime - a.properties.origintime; }))
			.enter()
			.append("path")
			.attr("class", "earthquake")
      //.attr("d", path.pointRadius(1.5));
// 			.attr("d", path.pointRadius(0.1))
// 			.transition()
// 			.duration(1500)
// 			.delay(function(d, i) { return i * 5; })
			.attr("d", path.pointRadius( function(d) { if ( !d.properties.magnitude || d.properties.magnitude < 2.5 ) { return 1.5 } else { return scale(d.properties.magnitude); } } ));

      var maximumvalue = d3.max(earthquakes, function(d) { return d.properties.origintime; }),
          minimumvalue = d3.min(earthquakes, function(d) { return d.properties.origintime; });

    $('.interactiveoptions input[type=range]').attr({
      "max" : parseFormat(maximumvalue),
      "min" : parseFormat(minimumvalue),
      "value" : parseFormat(minimumvalue)
    })

    $('.yearvalue').html(parseFormat(minimumvalue));

	});

  function parseFormat(date) {
      if (date.length > 19) {
        return formatDate(parseDateMilli(date));
      } else {
        return formatDate(parseDate(date));
      }
    };

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

  $('.interactiveoptions input[type=checkbox]').on("click", function(){
    var selection = $(this).data("target");
    if (!this.checked) {
      $('.' + selection).css("display", "none");
    } else {
      $('.' + selection).css("display", "block");
    }
  })

  $('.interactiveoptions input[type=range]').on("change", function(){
    var value = $(this).val();
    $('.yearvalue').html(value);
  })

});
