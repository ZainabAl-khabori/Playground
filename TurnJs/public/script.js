// jshint esversion: 8

pdfjsLib.GlobalWorkerOptions.workerSrc = "/build/pdf.worker.js";

async function book(book, scale) {
	var url = $(book).attr("book");

	var loadingTask = pdfjsLib.getDocument(url);
	var pdf = await loadingTask.promise;

	var numPages = pdf.numPages % 2 === 1 ? pdf.numPages + 1 : pdf.numPages;
	for (var i = 0; i < numPages; i++) {
		var bookPage = $("<div class='p" + (i + 1) + "'><canvas></canvas></div>");

		if (i < 2 || i > (numPages - 3)) {
			bookPage.addClass("hard");
		}

		bookPage.append("<div class='gradient'></div>");
		$(book).append(bookPage);
	}

	var page = await pdf.getPage(1);
	var viewport = page.getViewport({ scale: scale });

	$(book).turn({
		width: viewport.width * 2,
		height: viewport.height,
		autoCenter: true
	});

	var canvas = $("canvas", ".p1");
	var context = canvas[0].getContext("2d");
	canvas.attr("width", viewport.width);
	canvas.attr("height", viewport.height);

	var renderContext = {
		canvasContext: context,
		viewport: viewport
	};

	page.render(renderContext);

	// for (var i = 2; i <= pdf.numPages; i++) {
	// 	page = await pdf.getPage(i);
	// 	viewport = page.getViewport({ scale: scale });
	//
	// 	canvas = $("canvas", ".p" + i);
	// 	context = canvas[0].getContext("2d");
	//
	// 	canvas.attr("width", viewport.width);
	// 	canvas.attr("height", viewport.height);
	//
	// 	renderContext = {
	// 		canvasContext: context,
	// 		viewport: viewport
	// 	};
	//
	// 	// page.render(renderContext);
	// }

	var rendered = Array(pdf.numPages).fill(false);
	rendered[0] = true;

	$(book).on("turning", async function(e, pageNum, view) {
		var range = $(book).turn("range");
		for (var i = range[0]; i <= range[1]; i++) {
			if ($(book).turn("hasPage", i) && !rendered[i - 1]) {
				var page = await pdf.getPage(i);
				var viewport = page.getViewport({ scale: scale });

				var canvas = $("canvas", ".p" + i);
				var context = canvas[0].getContext("2d");

				canvas.attr("width", viewport.width);
				canvas.attr("height", viewport.height);

				var renderContext = {
					canvasContext: context,
					viewport: viewport
				};

				page.render(renderContext);
			}
		}
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