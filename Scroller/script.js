// $(document).ready(function() {
//     var maxItems = 5;
//     var target = $(".scroller", ".home-infographic");

//     scroller(target, maxItems);
// });

var maxItems = 5;
var target = $(".scroller", ".home-infographic");

scroller(target, maxItems);

function scroller(target, maxItems) {
	var set = $(".infographic-col", target);
	var center = Math.ceil(maxItems / 2);
	var colWidth = 100 / (maxItems - 1);
	var mid = Math.ceil(set.length / 2);

	set.css({
		"flex": "0 0 " + colWidth + "%",
		"max-width": colWidth + "%"
	});

	var inner = $(".scroller-inner", target);
	for (var i = set.length - 1; i >= mid; i--) {
		inner.prepend(set[i]);
	}

	var width = set.first().outerWidth(true);
	var diff = mid - center + 1;

	set.css("left", -(width * diff) + "px");

	$(".scroll-prev", target).click(function() {
		var currentSet = $(".infographic-col", target);
		var last = currentSet.last();

		inner.prepend(last.clone());
		currentSet.css("left", -(width * (diff + 1)) + "px");

		currentSet.animate({ left: -(width * diff) + "px" }, 600, function() {
			last.remove();
		});
	});

	$(".scroll-next").click(function() {
		console.log("click");
	});
}

// $(".scroll-prev", target).click(function() {
// 	var currentSet = $(".infographic-col", target);
// 	var last = currentSet.last();
//
// 	inner.prepend(last.clone());
// });

// $(".scroll-next").click(function() {
// 	console.log("click");
// });