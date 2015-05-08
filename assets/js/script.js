$(document).ready(function () {

    var width = parseInt($('.container').css('width')),
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

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select(".map")
        .append("svg")
        .style("width", width + "px")
        .style("height", height + "px");

    d3.json("assets/data/combined1.json", function (error, data) {

        var counties = topojson.feature(data, data.objects.county).features,
            earthquakes = topojson.feature(data, data.objects.earthquakes).features,
            //faultlines = topojson.feature(data, data.objects.OKfaults_dd).features,
            wells = topojson.feature(data, data.objects.iwells).features;

        var maxtime = d3.max(earthquakes, function (d) {
                return d.properties.origintime;
            }),
            mintime = d3.min(earthquakes, function (d) {
                return d.properties.origintime;
            }),
            maxmag = d3.max(earthquakes, function(d) {
                return d.properties.magnitude;
            }),
            minmag = d3.min(earthquakes, function(d) {
                if (!d.properties.magnitude || d.properties.magnitude < 1) {
                    return 1;
                } else {
                    return d.properties.magnitude;
                }
            });

        var scale = d3.scale.log()
            .domain([minmag, maxmag])
            .range([1, 5]);

        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(counties)
            .enter()
            .append("path")
            .attr("class", "county")
            .attr("d", path);

        // var faultline = g.append("g")
        //     .attr("class", "faultlines")
        //     .selectAll("path")
        //     .data(faultlines)
        //     .enter()
        //     .append("path")
        //     .attr("class", "faultline")
        //     .attr("d", path);




        $('.interactiveoptions input[type=range]').attr({
            "max": parseFormat(maxtime),
            "min": parseFormat(mintime),
            "value": parseFormat(maxtime)
        });

        $('.yearvalue').html(parseFormat(maxtime));

        function stageOne() {

            svg.append("g")
                .attr("class", "earthquakes")
                .selectAll("path")
                .data(earthquakes)
                .enter()
                .append("path")
                .attr("class", "earthquake")
                .attr("d", path.pointRadius(function (d) {
                    if (!d.properties.magnitude || d.properties.magnitude < 1) {
                        return 1;
                    } else {
                        return scale(d.properties.magnitude);
                    }
                }));
        };

        $('.one button').on("click", function(){
            stageOne();
            $("ul li button").removeClass("active");
            $(this).addClass("active");
        });

        function stageTwo() {

            svg.append("g")
                .attr("class", "wells")
                .selectAll("path")
                .data(wells)
                .enter()
                .append("path")
                .attr("class", "well")
                .attr("d", path.pointRadius(1));
        };

        $('.two button').on("click", function(){
            stageTwo();
            $("ul li button").removeClass("active");
            $(this).addClass("active");
        });

    });

    function parseFormat(date) {
        if (date.length > 19) {
            return formatDate(parseDateMilli(date));
        } else {
            return formatDate(parseDate(date));
        }
    };

});
