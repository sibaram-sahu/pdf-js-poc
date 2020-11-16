
var url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'http://mozilla.github.io/pdf.js/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1,
    pages = [],
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

let pdf = {
    renderPage: (num) => {
        pageRendering = true;
        if (pageNum <= pdfDoc.numPages) {
            pages[pageNum] = canvas;
            pdf.renderOnePage(pageNum);
        } else {
            for (var i = 1; i < pages.length; i++) {
                document.getElementById('canvas').appendChild(pages[i]);
            }
        }

        document.getElementById('page_num').textContent = num;
    },
    renderOnePage: (num) => {
        pdfDoc.getPage(num).then(function (page) {
            var viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            var renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);

            renderTask.promise.then(function () {
                pageRendering = false;
                if (pageNumPending !== null) {
                    pdf.renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });
    },
    queueRenderPage : (num) => {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            pdf.renderPage(num);
        }
    },
    onPrevPage: () => {
        if (pageNum <= 1) {
            return;
        }
        pageNum--;
        pdf.queueRenderPage(pageNum);
    },
    onNextPage: () => {
        if (pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        pdf.queueRenderPage(pageNum);
    }
}


document.getElementById('prev').addEventListener('click', pdf.onPrevPage);
document.getElementById('next').addEventListener('click', pdf.onNextPage);


pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
  pdfDoc = pdfDoc_;
  document.getElementById('page_count').textContent = pdfDoc.numPages;
  pdf.renderPage(pageNum);
});