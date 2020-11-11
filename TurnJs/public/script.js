// jshint esversion: 8

async function book(book) {
	pdfjsLib.GlobalWorkerOptions.workerSrc = "/build/pdf.worker.js";

	var url = $(book).attr("book");
	var coverUrl = $(book).attr("cover");
	var name = url.substring(url.lastIndexOf("/") + 1).split(".")[0];

	var parent = $(book).parent();
	var index = parent.children().index(book);

	var container = $("<div class='book-container thumbnail'><div class='book-viewer'><div class='book-wrapper'></div></div></div>");
	$(".book-wrapper", container).append(book);

	var pdf = window.localStorage.getItem(name);
	var saved = true;
	if (!pdf) {
		console.log("No pdf for " + name + " saved in localStorage");
		saved = false;

		var loadingTask = pdfjsLib.getDocument(url);
		pdf = await loadingTask.promise;
	}

	var getViewport = function(page, maxHeight) {
		var pageHeight = saved ? page.height : page.getViewport({ scale: 1 }).height;
		var pageWidth = saved ? page.width : page.getViewport({ scale: 1 }).width;

		var heightScale = maxHeight / pageHeight;
		var widthScale = ($(document).outerWidth(true) - 150) / (pageWidth * 2);
		var scale = Math.min(heightScale, widthScale);

		var viewport = page.getViewport({ scale: scale });
		if (saved) {
			viewport = {
				width: pageWidth * scale,
				height: pageHeight * scale
			};
		}

		return viewport;
	};

	var drawImg = async function(src, canvas) {
		return new Promise(function(resolve, reject) {
			var img = new Image();
			var dims = {};
			img.onload = function() {
				var scale = $(book).parents(".book-container").outerWidth(true) / img.width;
				dims.width = $(book).parents(".book-container").outerWidth(true);
				dims.height = img.height * scale;

				canvas.width = dims.width;
				canvas.height = dims.height;

				canvas.getContext("2d").drawImage(img, 0, 0, dims.width, dims.height);
				resolve(dims);
			};
			img.src = src;
		});
	};

	var rendered = Array(pdf.numPages).fill(false);
	var renderPage = async function(i, maxHeight) {
		rendered[i - 1] = true;

		var page = saved ? pdf.pages[i - 1] : await pdf.getPage(i);
		var viewport = getViewport(page, maxHeight);

		if (saved) {
			if (pdf.nonBlank.includes(i)) {
				$(".p" + i).addClass("non-blank");
			}
		} else {
			var objects = await page.getOperatorList();

			if ($(".p" + i).is(".hard") && objects.argsArray.length > 0) {
				$(".p" + i).addClass("non-blank");
			}
		}

		var canvas = $("canvas", ".p" + i);
		canvas.attr("width", viewport.width);
		canvas.attr("height", viewport.height);

		if (saved) {
			await drawImg(page.data, canvas[0]);
		} else {
			var context = canvas[0].getContext("2d");
			var renderContext = {
				canvasContext: context,
				viewport: viewport
			};

			page.render(renderContext);
			return viewport;
		}
	};

	if (index === 0) {
		parent.prepend(container);
	} else {
		$(parent.children()[index - 1]).after(container);
	}

	var numPages = pdf.numPages % 2 === 1 ? pdf.numPages + 1 : pdf.numPages;
	for (var i = 0; i < numPages; i++) {
		var bookPage = $("<div class='p" + (i + 1) + "'><canvas></canvas></div>");

		if (i < 2 || i > (numPages - 3)) {
			bookPage.addClass("hard");
		}

		bookPage.append("<div class='gradient'></div>");
		$(book).append(bookPage);
	}

	var cover = $(book).children(".hard").first();
	cover.addClass("non-blank");

	var coverCanvas = $("canvas", cover)[0];
	var dims = await drawImg("../covers/Annual-Report-2015-English-cover.png", coverCanvas);

	$(book).parents(".book-wrapper").css("width", dims.width * 2);
	$(book).parents(".book-container").css("height", dims.height);

	$(book).turn({
		width: dims.width * 2,
		height: dims.height,
		autoCenter: true,
		duration: 1000
	});

	var top = $(book).offset().top;
	var left = $(book).offset().left;

	$(book).parents(".thumbnail").click(async function(e) {
		$(this).off("click");
		$(this).removeClass("thumbnail");
		$(book, this).turn("page", 3);

		var padding = $(this).parent().innerHeight() - $(this).outerHeight(true);
		$(".book-wrapper", this).css({
			top: top - padding,
			left: left
		});

		var finalHeight = $(window).outerHeight(true) * 0.75;
		var scale = finalHeight / dims.height;
		var finalWidth = dims.width * scale;

		var finalTop = $(window).outerHeight(true) * 0.04;
		var finalLeft = ($(window).outerWidth(true) - (finalWidth * 2)) / 2;

		var props = {
			top: finalTop,
			left: finalLeft
		};

		var size = {
			width: finalWidth * 2,
			height: finalHeight
		};

		$(book, this).animate(size, {
			duration: 600,
			start: async function() {
				await renderPage(3, finalHeight);
				await renderPage(2, finalHeight);
				await renderPage(1, finalHeight);
			},
			progress: function() {
				$(this).turn("size", parseInt($(this).css("width")), parseInt($(this).css("height")));
			}
		});

		$(".book-wrapper", this).animate(props, 600);

		$(book).on("turning", async function(e, pageNum, view) {
			var range = $(this).turn("range");
			for (var i = range[0]; i <= range[1]; i++) {
				if (i <= pdf.numPages && !rendered[i - 1]) {
					await renderPage(i, finalHeight);
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
	});
}

$(".book").each(async function() {
	await book(this);
});