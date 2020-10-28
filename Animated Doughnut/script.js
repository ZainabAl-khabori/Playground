// $("button").click(function() {
// 	$(".timer").addClass("start");
// 	var timer = setInterval(function() {
// 		var s = $("text", ".timer").text();
// 		s = parseInt(s.substring(0, s.length - 1));
//
// 		s--;
// 		$("text", ".timer").text(s + "s");
//
// 		if (s === 0) {
// 			clearInterval(timer);
// 		}
// 	}, 1000);
// });

var path = $("path")[0];
var length = path.getTotalLength();

// $(path).css("stroke-dasharray", length);
// $(path).css("stroke-dashoffset", length);

console.log(length);