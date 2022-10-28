import { NextPage } from "next";
import React from "react";

import classes from "styles/Index.module.css";
import styles from "styles/Home.module.css";
import Image from "next/image";
import { Header } from "src/components/Header";
import { firebaseApp } from "src/Firebase/firebase";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import Previews from "./previews";

const Pdf = () => {
	const [pdfUrl, setPdfUrl] = React.useState("");
	const [pdf, setPdf] = React.useState(null);

	const [image, setImage] = React.useState();

	const firestorage = firebaseApp.firestorage;
	const gsReference = ref(firestorage, "gs://vote-dapp-60851.appspot.com/");

	const getImage = (name) => {
		getDownloadURL(ref(firestorage, "gs://vote-dapp-60851.appspot.com/" + name))
			.then((url) => {
				setImage(url);
			})
			.catch((err) => console.log(err));
	};

	const getPpdUrl = async (e) => {
		try {
			const image = e.target.files[0];

			const imageRef = ref(firestorage, "gs://vote-dapp-60851.appspot.com/" + image.name);

			await uploadBytes(imageRef, image).then((snapshot) => {
				console.log("Uploaded a file!", snapshot);
			});

			await getImage(image.name);
		} catch (error) {
			console.log("エラーキャッチ", error);
		}
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
			{image ? (
				<div className={classes.test}>
					<img src={image} alt="" />
					<Previews url=image/>
				</div>
			) : (
				<div className={classes.test}>まだImageはアップロードされていません</div>
			)}
		</div>
	);
};

export default Pdf;
