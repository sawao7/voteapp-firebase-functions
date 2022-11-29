import { NextPage } from "next";
import React from "react";

import classes from "styles/Index.module.css";
import styles from "styles/Home.module.css";
import Image from "next/image";
import { Header } from "src/components/Header";
import firebaseApp from "src/Firebase/firebase";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { getDatabase, onValue, set, ref as realtime_ref } from "firebase/database";

import Previews from "./previews";

// import { call } from "wasm-imagemagick";

const Pdf = () => {
	// 最初にFirebaseからすべてのURLをとってくる => 更新用
	const [URLs, setURLs] = React.useState("");

	const [pdfUrl, setPdfUrl] = React.useState("");
	const [pdf, setPdf] = React.useState(null);

	const [image, setImage] = React.useState();

	const firestorage = getStorage(firebaseApp);

	const database = getDatabase(firebaseApp);

	const gsReference = ref(firestorage, "gs://vote-dapp-60851.appspot.com/");

	const getImage = (name) => {
		//vote-dapp-60851.appspot.com/thumb_/tmp/1-C_インタビュー.jpeg
		getDownloadURL(ref(firestorage, "gs://vote-dapp-60851.appspot.com/" + "thumb_/tmp/1-C_インタビュー.jpeg"))
			.then((url) => {
				setImage(url);
			})
			.catch((err) => console.log(err));
	};

	const getPpdUrl = async (e) => {
		try {
			const image = e.target.files[0];

			// const imageRef = ref(firestorage, "gs:/vote-dapp-60851.appspot.com/" + image.name);

			const imageRef = ref(firestorage, image.name);
			const name = image.name;

			await uploadBytes(imageRef, image).then((snapshot) => {
				console.log("Uploaded a file!", snapshot);

				set(realtime_ref(database, "/"), {
					URLs: URLs + "," + name,
				});
			});

			// await getImage(image.name);
		} catch (error) {
			console.log("エラーキャッチ", error);
		}
	};

	// const test = async (e) => {
	// 	const fetchedSourceImage = e.target.files[0];
	// 	const content = new Uint8Array(await fetchedSourceImage.arrayBuffer());
	// 	const image = { name: "srcFile.png", content };

	// 	const command = ["convert", "srcFile.png", "-rotate", "90", "-resize", "200%", "out.png"];
	// 	// const result = await call([image], command);
	// 	// console.log(result);
	// };

	React.useEffect(() => {
		getDownloadURL(ref(firestorage, "gs://vote-dapp-60851.appspot.com/" + "thumb_/tmp/1-C_インタビュー.jpeg"))
			.then((url) => {
				setImage(url);
				console.log(url);
			})
			.catch((err) => console.log(err));

		const database = getDatabase(firebaseApp);
		const currentRef = realtime_ref(database, "URLs/");
		onValue(
			currentRef,
			(snapshot) => {
				const str = snapshot.val();
				setURLs(str);
			},
			(error) => {
				console.log(error);
			}
		);
	}, []);
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
				</div>
			) : (
				<div className={classes.test}>まだImageはアップロードされていません</div>
			)}
		</div>
	);
};

export default Pdf;
