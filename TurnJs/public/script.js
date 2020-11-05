// jshint esversion: 8

async function book(book) {
	var url = $(book).attr("book");
	var name = url.substring(url.lastIndexOf("/") + 1).split(".")[0];

	console.log(name);

	pdfjsLib.GlobalWorkerOptions.workerSrc = "/build/pdf.worker.js";

	var next = $(book).next();
	var wrapper = $("<div class='book-viewer'><div class='book-wrapper'></div></div>");
	$(".book-wrapper", wrapper).append(book);
	next.before(wrapper);

	var loadingTask = pdfjsLib.getDocument(url);
	var pdf = await loadingTask.promise;

	var rendered = Array(pdf.numPages).fill(false);
	var renderPage = async function(i) {
		rendered[i - 1] = true;

		var page = await pdf.getPage(i);
		var heightScale = $(book).outerHeight(true) / page.getViewport({ scale: 1 }).height;
		var widthScale = ($(document).outerWidth(true) - 150) / (page.getViewport({ scale: 1 }).width * 2);
		var scale = Math.min(heightScale, widthScale);
		var viewport = page.getViewport({ scale: scale });
		var objects = await page.getOperatorList();

		if ($(".p" + i).is(".hard") && objects.argsArray.length > 0) {
			$(".p" + i).addClass("non-blank");
		}

		var canvas = $("canvas", ".p" + i);
		var context = canvas[0].getContext("2d");
		canvas.attr("width", viewport.width);
		canvas.attr("height", viewport.height);

		var renderContext = {
			canvasContext: context,
			viewport: viewport
		};

		page.render(renderContext);
		return viewport;
	};

	var numPages = pdf.numPages % 2 === 1 ? pdf.numPages + 1 : pdf.numPages;
	for (var i = 0; i < numPages; i++) {
		var bookPage = $("<div class='p" + (i + 1) + "'><canvas></canvas></div>");

		if (i < 2 || i > (numPages - 3)) {
			bookPage.addClass("hard");
		}

		bookPage.append("<div class='gradient'></div>");
		$(book).append(bookPage);
	}

	var viewport = await renderPage(1);
	$(book).parent().css("width", viewport.width * 2);
	$(book).turn({
		width: viewport.width * 2,
		height: viewport.height,
		autoCenter: true
	});

	$(book).on("turning", async function(e, pageNum, view) {
		var range = $(this).turn("range");
		for (var i = range[0]; i <= range[1]; i++) {
			if (i <= pdf.numPages && !rendered[i - 1]) {
				await renderPage(i);
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
	await book(this);
});