// jshint esversion: 8

function pieChart(selector, minRadius, barWidth) {
	var data = [];
	$(".data").each(function(i) {
		data.push({
			index: i,
			value: parseFloat($(this).attr("value"))
		});
	});

	var viewbox = $(selector).parents("svg")[0].attributes[0].nodeValue;
	var viewboxW = viewbox.split(" ")[2];
	var viewboxH = viewbox.split(" ")[3];
	var target = d3.select(selector);
	target.attr("transform", "translate(" + Math.floor(viewboxW / 2) + ", " + Math.floor(viewboxH / 2) + ")");

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

	target.selectAll(".path").data(data).attr("d", path);

	function barsTween(b) {
		var i = d3.interpolate({ value: 0 }, b);
		return function(t) {
			return bar(i(t));
		};
	}

	setTimeout(function() {
		target.selectAll(".data").data(data)
			.transition()
			.ease(d3.easeElastic)
			.duration(1000)
			.delay(function(d, i) { return i * 100; })
			.attrTween("d", barsTween);
	}, 400);
}

pieChart(".animated-pie-chart", 75, 15);