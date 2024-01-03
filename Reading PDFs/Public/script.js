pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/build/pdf.worker.js";

$(document).ready(async function() {
  var url = "http://localhost:8080/Pdfs/2018/en/balance-sheet-2018.pdf";
  var pdf = await pdfjsLib.getDocument(url).promise;
  var page = await pdf.getPage(1);
  var text = await page.getTextContent();

  console.log(text);
});
