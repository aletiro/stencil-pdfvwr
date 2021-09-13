import { Component, Prop, Element, Event, EventEmitter, Host, h, Method } from '@stencil/core';
import { PDFDocumentProxy } from 'pdfjs-dist';
// import { format } from '../../utils/utils';

import pdf from 'pdfjs-dist/build/pdf';
// import 'pdfjs-dist/web/pdf_viewer';

pdf.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.5.207/pdf.worker.min.js';

/**
 * PDF Viewing component
 */
@Component({
  tag: 'jh-pdf-viewer',
  styleUrl: 'jh-pdf-viewer.css',
  shadow: true
})

export class StencilPdfJs {
  @Element() component: HTMLElement;

  private canvasContainer: HTMLDivElement;
  private scale: number = 1; // hardcoded to scale the document to full canvas size
  private pdfDoc: PDFDocumentProxy;
  //
  // --- Properties / Inputs --- //
  //

  /**
   * Rotate the PDF in degrees
   * {number}
   */
  @Prop() rotation: 0 | 90 | 180 | 270 | 360 = 0;

  /**
   * Src of the PDF to load and render
   * {number}
   */
  @Prop() src: string;

  @Method()
  async zoomIn() {
    this.scale += 0.25
    this.canvasContainer.innerHTML = '';

    this.renderPages(this.pdfDoc)
  }

  @Method()
  async zoomOut() {
    if (this.scale > 0.5){
      this.scale -= 0.25
      this.canvasContainer.innerHTML = '';

      this.renderPages(this.pdfDoc)
    }
  }

  //
  // --- Event Emitters --- //
  //
  @Event() pageRendered: EventEmitter<number>;

  componentDidLoad(): void {
    if (this.src) {
      this.loadAndRender(this.src);
    }
  }

  private renderPage(page) {
    var viewport = page.getViewport({ scale: this.scale });
    var wrapper = document.createElement("div");
    wrapper.className = "canvas-wrapper";
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    wrapper.appendChild(canvas)
    this.canvasContainer.appendChild(wrapper);

    page.render(renderContext);
  }

  private renderPages(pdfDoc) {
    for (var num = 1; num <= pdfDoc.numPages; num++)
      pdfDoc.getPage(num).then(this.renderPage.bind(this));
  }


  private loadAndRender(src: string): void {
    pdf.getDocument(src).promise
      .then((pdfDocument: PDFDocumentProxy) =>{
        this.pdfDoc = pdfDocument
        this.renderPages.call(this, pdfDocument);
      });
  }

  render() {
    return (
      <Host>
        <button onClick={this.zoomIn.bind(this)}>+</button>
        <button onClick={this.zoomOut.bind(this)}>-</button>
        <div id="holder" ref={el => this.canvasContainer = el}></div>
      </Host>
    );
  }
}
