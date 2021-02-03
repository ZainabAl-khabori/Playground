// jshint esversion: 8

var chartData = {
	barCircleWeb: [
		{ index: 0, value: 31588490, fill: "#00833e" },
		{ index: 1, value: 26260662, fill: "#3fae2a" },
		{ index: 2, value: 24263463, fill: "#95d600" },
		{ index: 3, value: 12795112, fill: "#c4d600" },
		{ index: 4, value: 11959167, fill: "#e0e67e" }
	]
};

function drawBarCircleChart(data, target) {
	var size = data[0].value * 1.15;
	var minRadius = 75;
	var stroke = 15;
	var target = d3.select(target);

	var arc = d3.arc()
		.innerRadius(function(d) { return minRadius + stroke * d.index; })
		.outerRadius(function(d) { return minRadius + stroke * (d.index + 1); })
		.startAngle(Math.PI)
		.endAngle(function(d) { return Math.PI + (d.value / size) * 2 * Math.PI; });

	var path = target.selectAll("path").data(data).enter().append("svg:path")
		.attr("fill", function(d) { return d.fill; })
		.transition()
		.ease(d3.easeElastic)
		.duration(1000)
		.delay(function(d, i) { return i * 100; })
		.attrTween("d", arcTween);

	function arcTween(b) {
		var i = d3.interpolate({ value: 0 }, b);
		return function(t) {
			return arc(i(t));
		};
	}
}

// Animation Queue
setTimeout(function() {
	drawBarCircleChart(chartData.barCircleWeb, "#circleBar-web-chart");
}, 500);