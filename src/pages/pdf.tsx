import { NextPage } from "next";
import React from "react";
import { Document, Page, pdfjs } from "react-pdf";

import classes from "styles/Index.module.css";
import styles from "styles/Home.module.css";
import Image from "next/image";
import { Header } from "src/components/Header";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Pdf = () => {
	const [numPages, setNumPages] = React.useState("https://arxiv.org/pdf/quant-ph/0410100.pdf");
	const [pageNumber, setPageNumber] = React.useState(2);

	const [pdfUrl, setPdfUrl] = React.useState("");
	const [pdf, setPdf] = React.useState(null);

	const getPpdUrl = (e) => {
		const image = e.target;
		const url = "https://arxiv.org/pdf/quant-ph/0410100.pdf";
		setPdfUrl(url);
		setPdf(image.files);
		console.log(image.files);
	};
	const onDocumentLoadSuccess = ({ numPages }) => {
		setNumPages(numPages);
	};

	return (
		<div>
			<Header />
			<main className={styles.main}>
				<div className={classes.outerBox}>
					<div>
						<div className={classes.title}>
							<h2>アイデアを書いたPDFファイルをアップロードしましょう</h2>
						</div>
						<div className={classes.input_wrap}>
							<input
								className={classes.input}
								type="text"
								placeholder="アイデア名を入力してください(必須)"
								// onChange={getIdeaName}
							/>
						</div>
						<div className={classes.nftUplodeBox}>
							<div className={classes.imageLogoAndText}>
								<p>ここにドラッグ＆ドロップしてね</p>
							</div>
							<input
								className={classes.nftUploadInput}
								multiple
								name="imageURL"
								type="file"
								accept=".pdf, .png, .jpg"
								onChange={getPpdUrl}
							/>
						</div>
						<p>または</p>
						<button>
							ファイルを選択
							<input
								className={classes.nftUploadInput}
								type="file"
								accept=".pdf, .png, .jpg"
								onChange={getPpdUrl}
							/>
						</button>
					</div>
				</div>
			</main>
			{pdfUrl ? (
				<div>
					<Image src={pdf} alt="" />
				</div>
			) : (
				<div></div>
			)}
			{pdfUrl ? (
				<div className={classes.pdf}>
					<Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
						<Page pageNumber={pageNumber} />
					</Document>
					<p>
						Page {pageNumber} of {numPages}
					</p>
				</div>
			) : (
				<div></div>
			)}
		</div>
	);
};

export default Pdf;
