import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// workerの読み込み設定 (Vite用)
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// バージョンに合わせてworkerを指定
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ file }) => {
    const [numPages, setNumPages] = useState(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div style={{ padding: 20 }}>読み込み中...</div>}
                error={<div style={{ padding: 20 }}>PDFの読み込みに失敗しました</div>}
            >
                {Array.from(new Array(numPages), (el, index) => (
                    <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderTextLayer={false} // スマホで見やすくするため軽量化
                        renderAnnotationLayer={false}
                        width={window.innerWidth > 600 ? 600 : window.innerWidth} // 画面幅に合わせる
                        className="mb-4"
                    />
                ))}
            </Document>
        </div>
    );
};

export default PDFViewer;
