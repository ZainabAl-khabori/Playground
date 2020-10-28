$(document).ready(function() {
	var maxItems = 1;
	var target = $(".scroller", ".home-infographic");

	scroller(target, maxItems);
});

function scroller(target, maxItems) {
	var set = $(".infographic-col", target);
	var center = Math.ceil(maxItems / 2);
	var colWidth = maxItems > 1 ? 100 / (maxItems - 1) : 100;
	var mid = Math.ceil(set.length / 2);

	var moveDir = $("html").attr("lang") === "ar" ? "right" : "left";

	set.css({
		"flex": "0 0 " + colWidth + "%",
		"max-width": colWidth + "%",
	});

	if (maxItems <= 1) {
		set.css("transform", "translateX(0)");
	}

	var inner = $(".scroller-inner", target);
	for (var i = set.length - 1; i >= mid; i--) {
		inner.prepend(set[i]);
	}

	var width = set.first().outerWidth(true);
	var diff = set.length % 2 === 0 ? mid - center + 1 : mid - center;
	set.css(moveDir, -(width * diff) + "px");

	var currentSet = $(".infographic-col", target);
	var active = currentSet.index($(".active", target));

	for (var i = 1; i < center; i++) {
		$(currentSet[active - i]).addClass("lv-" + (i + 1));
		$(currentSet[active + i]).addClass("lv-" + (i + 1));
	}

	$(".scroll-prev", target).click(function() {
		var btn = $(this);
		btn.prop("disabled", true);

		var currentSet = $(".infographic-col", target);
		var last = currentSet.last();

		inner.prepend(last.clone());
		currentSet = $(".infographic-col", target);
		currentSet.css(moveDir, -(width * (diff + 1)) + "px");

		var property = {};
		property[moveDir] = -(width * diff) + "px";

		var activeIndex = currentSet.length % 2 === 0 ? mid - 1 : mid;

		$(".active", target).removeClass("active");
		for (var i = 1; i < center; i++) {
			var lv = "lv-" + (i + 1);
			$("." + lv, target).removeClass(lv);
		}

		$(currentSet[activeIndex]).addClass("active");
		for (var i = 1; i < center; i++) {
			$(currentSet[activeIndex - i]).addClass("lv-" + (i + 1));
			$(currentSet[activeIndex + i]).addClass("lv-" + (i + 1));
		}

		currentSet.animate(property, 600, function() {
			last.remove();
			btn.prop("disabled", false);
		});
	});

	$(".scroll-next").click(function() {
		var btn = $(this);
		btn.prop("disabled", true);

		var currentSet = $(".infographic-col", target);
		var first = currentSet.first();

		inner.append(first.clone());
		currentSet = $(".infographic-col", target);

		var property = {};
		property[moveDir] = -(width * (diff + 1)) + "px";

		var activeIndex = currentSet.length % 2 === 0 ? mid : mid + 1;

		$(".active", target).removeClass("active");
		for (var i = 1; i < center; i++) {
			var lv = "lv-" + (i + 1);
			$("." + lv, target).removeClass(lv);
		}

		$(currentSet[activeIndex]).addClass("active");
		for (var i = 1; i < center; i++) {
			$(currentSet[activeIndex - i]).addClass("lv-" + (i + 1));
			$(currentSet[activeIndex + i]).addClass("lv-" + (i + 1));
		}

		currentSet = $(".infographic-col", target);
		currentSet.animate(property, 600, function() {
			first.remove();
			currentSet.css(moveDir, -(width * diff) + "px");
			btn.prop("disabled", false);
		});
	});
}