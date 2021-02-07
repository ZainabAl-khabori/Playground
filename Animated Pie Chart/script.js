// jshint esversion: 8

function pieChart(container, data, minRadius, barWidth, pathFill, indicatorFill) {
	var id = $(container).attr("id");
	var name = $(container).attr("name");
	// $(container).css({
	// 	"position": "relative",
	// 	"display": "flex",
	// 	"align-items": "center",
	// 	"justify-content": "center"
	// });
	//
	$(container).append("<svg viewbox='0 0 450 300' xmlns='http://www.w3.org/2000/svg'></svg>");
	// $(container).append("<h6 class='name'>" + name + "</h6>");
	// $(".name", container).css({
	// 	"color": indicatorFill,
	// 	"max-width": minRadius * 2,
	// 	"max-height": minRadius * 2,
	// 	"text-align": "center",
	// 	"position": "absolute"
	// });

	d3.select("#" + id + " svg").append("g").attr("class", "animated-pie-chart").attr("transform", "translate(150, 150)");
	var target = d3.select("#" + id + " .animated-pie-chart");

	var context = $("<canvas></canvas>")[0].getContext("2d");
	var font = context.font.split(" ");
	context.font = "69px " + font[font.length - 1];
	var textMetrics = { width: context.measureText(name).width, height: parseFloat(context.font) };

	target.append("circle").attr("r", 2).attr("cx", 0).attr("cy", 0);
	target.append("line").attr("x1", 0).attr("x2", 0).attr("y1", -minRadius).attr("y2", minRadius).attr("stroke", "#000000");
	target.append("line").attr("x1", -minRadius).attr("x2", minRadius).attr("y1", 0).attr("y2", 0).attr("stroke", "#000000");
	target.append("line").attr("x1", -minRadius).attr("x2", minRadius).attr("y1", textMetrics.height / 2).attr("y2", textMetrics.height / 2).attr("stroke", "red");
	target.append("line").attr("x1", -minRadius).attr("x2", minRadius).attr("y1", -textMetrics.height / 2).attr("y2", -textMetrics.height / 2).attr("stroke", "red");

	var path = d3.arc()
		.innerRadius(function(d) { return minRadius + 1.5 + (barWidth * d.index); })
		.outerRadius(function(d) { return minRadius - 1.5 + (barWidth * (d.index + 1)); })
		.startAngle(0)
		.endAngle(2 * Math.PI);

	var bar = d3.arc()
		.cornerRadius(barWidth)
		.innerRadius(function(d) { return minRadius + 0.5 + (barWidth * d.index); })
		.outerRadius(function(d) { return minRadius - 0.5 + (barWidth * (d.index + 1)); })
		.startAngle(Math.PI)
		.endAngle(function(d) { return Math.PI + ((d.value * Math.PI) / 50); });

	if (textMetrics.width >= minRadius * 2) {
		console.log("too long");
	}

	target.append("text")
		.attr("class", "name")
		.attr("fill", indicatorFill)
		// .attr("text-anchor", "middle")
		.attr("x", 0)
		.attr("y", textMetrics.height / 2)
		.attr("font-size", 69)
		.text(name);

	function barsTween(b) {
		var i = d3.interpolate({ value: 0 }, b);
		return function(t) {
			return bar(i(t));
		};
	}

	target.selectAll(".path").data(data).enter().append("path")
		.attr("class", "path")
		.attr("fill", pathFill)
		.attr("d", path);

	var bars = target.selectAll(".data").data(data).enter().append("path")
		.attr("class", "data")
		.attr("fill", function(d, i) { return d.fill; });

	var innerDots = target.selectAll(".dot-in").data(data).enter().append("circle")
		.attr("class", "dot-in")
		.attr("fill", indicatorFill)
		.attr("r", 0)
		.attr("cx", -8)
		.attr("cy", function(d) { return minRadius + (barWidth * d.index) + (barWidth / 2); });

	var lines = target.selectAll(".line").data(data).enter().append("line")
		.attr("class", "line")
		.attr("stroke", indicatorFill)
		.attr("x1", -8)
		.attr("x2", -8)
		.attr("y1", function(d) { return minRadius + (barWidth * d.index) + (barWidth / 2); })
		.attr("y2", function(d) { return minRadius + (barWidth * d.index) + (barWidth / 2); });

	var outerDots = target.selectAll(".dot-out").data(data).enter().append("circle")
		.attr("class", "dot-out")
		.attr("fill", indicatorFill)
		.attr("r", 0)
		.attr("cx", 150)
		.attr("cy", function(d) { return minRadius + (barWidth * d.index) + (barWidth / 2); });

	var labels = target.selectAll(".labels").data(data).enter().append("text")
		.attr("class", "label")
		.attr("fill", indicatorFill)
		.attr("font-size", 0)
		.attr("x", 160)
		.attr("y", function(d) { return minRadius - 3 + (barWidth * (d.index + 1)); })
		.text(function(d, i) { return d.label + " (" + d.value + "%)"; });

	setTimeout(function() {
		bars.transition()
			.ease(d3.easeElastic)
			.duration(1000)
			.delay(function(d, i) { return i * 100; })
			.attrTween("d", barsTween);

		innerDots.transition()
			.ease(d3.easeElastic)
			.duration(1000)
			.delay(function(d, i) { return i * 100; })
			.attr("r", 3);

		lines.transition()
			.ease(d3.easeLinear)
			.duration(150)
			.delay(function(d, i) { return i * 100; })
			.attr("x2", 150);

		outerDots.transition()
			.ease(d3.easeElastic)
			.duration(1000)
			.delay(function(d, i) { return (i * 100) + 150; })
			.attr("r", 3)
			.attr("fill", function(d, i) { return d.fill; });

		labels.transition()
			.ease(d3.easeElastic)
			.duration(1000)
			.delay(function(d, i) { return (i * 100) + 150; })
			.attr("font-size", 12);
	}, 400);
}

var data = [
	{ index: 0, value: 100, fill: "#00833e", label: "Total" },
	{ index: 1, value: 58, fill: "#3fae2a", label: "10% Above" },
	{ index: 2, value: 14, fill: "#95d600", label: "5 - 10%" },
	{ index: 3, value: 5, fill: "#c4d600", label: "2 - 5%" },
	{ index: 4, value: 23, fill: "#e0e67e", label: "Less than 2%" }
];

pieChart($("#shareholders")[0], data, 75, 15, "#e3e5e9", "#a9a9a9");