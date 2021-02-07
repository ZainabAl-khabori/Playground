// jshint esversion: 8

function pieChart(container, data, minRadius, barWidth, pathFill, indicatorFill) {
	var id = $(container).attr("id");
	var name = $(container).attr("name");

	$(container).append("<svg viewbox='0 0 450 300' xmlns='http://www.w3.org/2000/svg'></svg>");
	d3.select("#" + id + " svg").append("g").attr("class", "animated-pie-chart").attr("transform", "translate(150, 150)");
	var target = d3.select("#" + id + " .animated-pie-chart");

	function getTextDims(text, titleFontSize) {
		var context = $("<canvas></canvas>")[0].getContext("2d");
		var font = context.font.split(" ");
		context.font = titleFontSize + "px " + font[font.length - 1];
		return { width: context.measureText(name).width, height: parseFloat(context.font) };
	}

	function barsTween(b) {
		var i = d3.interpolate({ value: 0 }, b);
		return function(t) {
			return bar(i(t));
		};
	}

	var titleFontSize = 15;
	var fontAdjust = 0.675;
	var titleMetrics = getTextDims(name, titleFontSize);

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

	var title = target.append("text")
		.attr("class", "name")
		.attr("fill", indicatorFill)
		.attr("text-anchor", "middle")
		.attr("font-size", titleFontSize)
		.attr("font-size-adjust", fontAdjust);

	if (titleMetrics.width >= minRadius * 2) {
		var words = name.split(" ");
		var dy = titleMetrics.height * 2;
		title.attr("y", (titleMetrics.height * (2 - words.length)) - (((words.length - 1) * dy) / 4));

		for (var i = 0; i < words.length; i++) {
			title.append("tspan")
				.attr("class", "title-word")
				.attr("x", 0)
				.attr("dy", i * dy)
				.text(words[i]);
		}
	} else {
		title.attr("x", 0).attr("y", titleMetrics.height / 2).text(name);
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
		.attr("cy", function(d, i) { return minRadius + (barWidth * d.index) + (barWidth / 2); });

	var lines = target.selectAll(".line").data(data).enter().append("line")
		.attr("class", "line")
		.attr("stroke", indicatorFill)
		.attr("x1", -8)
		.attr("x2", -8)
		.attr("y1", function(d, i) { return minRadius + (barWidth * d.index) + (barWidth / 2); })
		.attr("y2", function(d, i) { return minRadius + (barWidth * d.index) + (barWidth / 2); });

	var outerDots = target.selectAll(".dot-out").data(data).enter().append("circle")
		.attr("class", "dot-out")
		.attr("for", function(d, i) { return "l-" + i; })
		.attr("fill", indicatorFill)
		.attr("r", 0)
		.attr("cx", 150)
		.attr("cy", function(d, i) { return minRadius + (barWidth * d.index) + (barWidth / 2); });

	var labels = target.selectAll(".labels").data(data).enter().append("text")
		.attr("class", "label")
		.attr("id", function(d, i) { return "l-" + i; })
		.attr("fill", indicatorFill)
		.attr("font-size", 0)
		.attr("font-size-adjust", fontAdjust)
		.attr("x", 160)
		.attr("y", function(d, i) { return minRadius + (barWidth * d.index) + ((barWidth + getTextDims(d.label, 10).height) / 2); })
		.text(function(d, i) { return d.label + " (" + d.value + "%)"; });

	$(".label, .dot-out", container).css({
		"pointer-events": "none",
		"cursor": "pointer"
	});

	$(".label", container).mouseenter(function() {
		if ($(this).attr("underlined") !== "true") {
			var id = $(this).attr("id");
			var box = this.getBBox();
			var y = parseFloat($(this).attr("y")) + 2;

			var dot = $(".dot-out[for='" + id + "']", container);
			var color = dot.attr("fill");

			target.select(".dot-out[for='" + id + "']").transition()
				.ease(d3.easeLinear)
				.duration(200)
				.attr("r", 4);

			$(this).attr("underlined", "true");
			target.append("line")
				.attr("class", "underline")
				.attr("for", id)
				.attr("x1", 160)
				.attr("x2", 160 + box.width)
				.attr("y1", y)
				.attr("y2", y)
				.attr("stroke", color);
		}
	});

	$(".label", container).mouseleave(function() {
		if ($(this).attr("underlined") === "true") {
			var id = $(this).attr("id");
			$(".underline[for='" + id + "']", container).remove();

			target.select(".dot-out[for='" + id + "']").transition()
				.ease(d3.easeLinear)
				.duration(200)
				.attr("r", 3);

			$(this).attr("underlined", "false");
		}
	});

	$(".dot-out", container).mouseenter(function() {
		var id = $(this).attr("for");
		$(".label#" + id, container).trigger("mouseenter");
	});

	$(".dot-out", container).mouseleave(function() {
		var id = $(this).attr("for");
		$(".label#" + id, container).trigger("mouseleave");
	});

	return {
		startAnimation: function() {
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
					.attr("font-size", 10);

				setTimeout(function() {
					$(".label, .dot-out").css("pointer-events", "");
				}, 1000);
			}, 400);
		}
	};
}

var data = [
	{ index: 0, value: 100, fill: "#00833e", label: "Total" },
	{ index: 1, value: 58, fill: "#3fae2a", label: "10% Above" },
	{ index: 2, value: 14, fill: "#95d600", label: "5 - 10%" },
	{ index: 3, value: 5, fill: "#c4d600", label: "2 - 5%" },
	{ index: 4, value: 23, fill: "#e0e67e", label: "Less than 2%" }
];

var pie = pieChart($("#shareholders")[0], data, 75, 15, "#e3e5e9", "#a9a9a9");
pie.startAnimation();