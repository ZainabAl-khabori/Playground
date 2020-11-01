// jshint esversion: 8

pdfjsLib.GlobalWorkerOptions.workerSrc = "/build/pdf.worker.js";

async function book(book, scale) {
	var url = $(book).attr("book");

	var loadingTask = pdfjsLib.getDocument(url);
	var pdf = await loadingTask.promise;

	for (var i = 1; i <= pdf.numPages; i++) {
		var page = await pdf.getPage(i);
		var pageDiv = $("<div class='page'></div>");

		var canvas = $("<canvas></canvas>");
		var context = canvas[0].getContext("2d");
		var viewport = page.getViewport({ scale: scale });

		canvas.attr("width", viewport.width);
		canvas.attr("height", viewport.height);
		$(book).append(pageDiv);
		$(pageDiv).append(canvas);

		var renderContext = {
			canvasContext: context,
			viewport: viewport
		};

		page.render(renderContext);
	}

	$(".flipbook").turn({
		width: viewport.width * 2,
		height: viewport.height,
		autoCenter: true
	});

	// var textContent = await page.getTextContent();
	// var div = $("<div class='textLayer'></div>");
	// $(book).append(div);
	//
	// console.log(textContent);
	//
	// var textLayer = pdfjsLib.renderTextLayer({
	// 	textContent: textContent,
	// 	container: div[0],
	// 	viewport: viewport
	// });
	//
	// textLayer._render();
}

$(".book").each(async function() {
	await book(this, 1);
});

// $(document).ready(function() {
// 	var book = "Annual%20Report%20Arabic%202015.pdf";
// 	fetch("/converted/" + book)
// 		.then(function(res) { return res.json(); })
// 		.then(function(res) {
// 			var pages = res.data;
// 			var bookHeight = $(".flipbook").outerHeight(true);
// 			var width = res.size.width;
// 			var height = res.size.height;
//
// 			var factor = bookHeight / height;
// 			var bookWidth = width * factor;
//
// 			// console.log("bookHeight = ", bookHeight);
// 			// console.log("height = ", height);
// 			// console.log("factor = ", factor);
// 			console.log("width = ", width);
// 			console.log("bookWidth = ", bookWidth);
//
// 			for (var page of pages) {
// 				var iframe = $("<div class='page'><iframe></iframe></div>");
//
// 				var binary = atob(page.split(",")[1]);
// 				var bytes = new Uint8Array(binary.length);
//
// 				for (var i = 0; i < binary.length; i++) {
// 					bytes[i] = binary.charCodeAt(i);
// 				}
//
// 				var blob = new Blob([bytes], { type: "application/pdf" });
// 				var uri = "/web/viewer.html?file=" + URL.createObjectURL(blob);
//
// 				$("iframe", iframe).attr("width", bookWidth);
// 				// $("iframe", iframe).attr("height", bookHeight);
// 				$("iframe", iframe).attr("src", uri);
//
// 				$(".flipbook").append(iframe);
// 			}
//
// 			$(".flipbook").turn({
// 				width: bookWidth * 2,
// 				height: bookHeight,
// 				autoCenter: true
// 			});
// 		});
// });