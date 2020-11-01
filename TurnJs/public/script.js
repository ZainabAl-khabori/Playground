// jshint esversion: 8

$(document).ready(function() {
	var book = "Annual%20Report%20Arabic%202015.pdf";
	fetch("/converted/" + book)
		.then(function(res) { return res.json(); })
		.then(function(res) {
			var pages = res.data;
			var bookHeight = $(".flipbook").outerHeight(true);
			var width = res.size.width;
			var height = res.size.height;

			var factor = height / bookHeight;
			var bookWidth = width * factor;

			console.log(bookWidth);

			for (var page of pages) {
				var iframe = $("<div class='page'><iframe></iframe></div>");

				var binary = atob(page.split(",")[1]);
				var bytes = new Uint8Array(binary.length);

				for (var i = 0; i < binary.length; i++) {
					bytes[i] = binary.charCodeAt(i);
				}

				var blob = new Blob([bytes], { type: "application/pdf" });
				var uri = "/web/viewer.html?file=" + URL.createObjectURL(blob);

				// $("iframe", iframe).attr("width", res.size.width);
				// $("iframe", iframe).attr("height", res.size.height);
				$("iframe", iframe).attr("src", uri);

				$(".flipbook").append(iframe);
			}

			$(".flipbook").turn({
				width: bookWidth,
				height: bookHeight,
				autoCenter: true
			});
		});
});