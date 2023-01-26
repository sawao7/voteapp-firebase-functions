import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "styles/Home.module.css";
import React, { useState } from "react";

import classes from "styles/Index.module.css";
import { Header } from "src/components/Header";

// import { ethers } from "ethers";
import { ethers } from "ethers";
import abi from "utils/VotePortal.json";

// firebase storage and realtime database
import firebaseApp from "src/Firebase/firebase";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { getDatabase, onValue, set, ref as realtime_ref } from "firebase/database";

import { Web3Storage } from "web3.storage";

// ページ遷移
import { useRouter } from "next/router";

// material ui
import { Button, Container, Stack, TextField, Box, Typography, Modal } from "@mui/material";

const style = {
	position: "absolute" as "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 600,
	bgcolor: "background.paper",
	boxShadow: 24,
	p: 4,
};

const Home: NextPage = () => {
	const [currentAccount, setCurrentAccount] = React.useState("");

	// モーダル
	const [modalOpenComfirm, setModalOpenComfirm] = React.useState(false);
	const [modalOpenUpload, setModalOpenUpload] = React.useState(false);

	// 最初にFirebaseからすべてのURLをとってくる => 更新用
	const [URLs, setURLs] = React.useState("");

	const [image, setImage] = React.useState();

	// firebase storage
	const firestorage = getStorage(firebaseApp);
	// firebase realtime database
	const database = getDatabase(firebaseApp);

	// ページ遷移 router
	const router = useRouter();

	// コントラクトアドレス
	const contractAddress = process.env.NEXT_PUBLIC_PRIVATE_CONTRACT_ADDRESS;
	const contractABI = abi.abi;

	const API_KEY: any = process.env.NEXT_PUBLIC_PRIVATE_WEBSTORAGE_KEY;

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window as any;
		if (!ethereum) {
			console.log("Make sure you have MetaMask!");
			return;
		} else {
			console.log("We have the ethereum object", ethereum);
		}

		const accounts = await ethereum.request({ method: "eth_accounts" });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setCurrentAccount(account);
		} else {
			console.log("No authorized account found");
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window as any;
			if (!ethereum) {
				alert("Get MetaMask!");
				return;
			}
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const renderNotConnectedContainer = () => (
		<button onClick={connectWallet} className="cta-button connect-wallet-button">
			Connect to Wallet
		</button>
	);

	React.useEffect(() => {
		checkIfWalletIsConnected();

		// 常にrealtime databaseに記録しているものを、URLsに記録しておく
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

	// アイデアの名前を記録する関数
	const [ideaName, setIdeaName] = React.useState("");
	const getIdeaName = (e: any) => {
		setIdeaName(e.target.value);
	};

	// ImageをCIDに変える関数
	const imageToCid = async (e: any) => {
		// モーダルを表示 "審査中"
		setModalOpenComfirm((frag) => !frag);

		const client = new Web3Storage({
			token: API_KEY,
		});
		const image = e.target.files[0];
		const name = image.name; // この時点では、~.pdfのはず

		// firebase storageにアップロード
		const imageRef = ref(firestorage, name);
		await uploadBytes(imageRef, image).then((snapshot) => {
			console.log("Uploaded a file!", snapshot);

			// firebase realtime database に記録
			// この時の名前は、拡張子をjpegに変える
			const name_jpeg = name.replace(".pdf", ".jpeg");
			set(realtime_ref(database, "/"), {
				URLs: URLs + "," + name_jpeg,
			});
		});

		let file_cid;

		const rootCid = await client.put(e.target.files, {
			name: ideaName,
			maxRetries: 3,
		});

		console.log("rootCid", rootCid);
		console.log("hello");

		setModalOpenComfirm((frag) => !frag);
		CidToIdea(rootCid);
	};

	// Cidをアイデアに変える関数
	const CidToIdea = async (file_cid: any) => {
		try {
			const { ethereum } = window as any;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const voteContract = new ethers.Contract(voteContract, contractABI, signer);

				// (アイデア名) => ideaName;
				// console.log(ideaName);

				// アイデア名が入力されていなかったら除外
				if (ideaName.length == 0) {
					return;
				}

				// アイデア 作成
				// モーダルを表示 "アップロード中"
				setModalOpenUpload((frag) => !frag);
				let IdeaTxn = await voteContract.addIdea(ideaName, file_cid);
				await IdeaTxn.wait();

				console.log("success");
				setModalOpenUpload((frag) => !frag);
				// モーダルを削除
				//idea一覧画面に遷移させたい
				router.push("/ideas");
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<Head>
				<title>Create Next App</title>
				<meta name="description" content="Generated by create next app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Header />

			<main className={styles.main}>
				<Modal
					open={modalOpenComfirm}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					<Box sx={style}>
						<Typography id="modal-modal-title" variant="h6" component="h2">
							確認中
						</Typography>
						<Typography sx={{ mt: 2 }}>
							正しいフォーマットかどうか確認しています。
							<br />
							処理が無事完了すると、Metamaskの認証画面に移行します。
						</Typography>
					</Box>
				</Modal>

				<Modal
					open={modalOpenUpload}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					<Box sx={style}>
						<Typography id="modal-modal-title" variant="h6" component="h2">
							アップロード中
						</Typography>
						<Typography sx={{ mt: 2 }}>
							IPFSにアップロード中です。
							<br />
							長い場合は数分程度お待ちいただくことがあります。画面から離れずにお待ちください。
						</Typography>
					</Box>
				</Modal>

				<div className={classes.outerBox}>
					{currentAccount === "" ? (
						renderNotConnectedContainer()
					) : (
						<div>
							<div className={classes.title}>
								<h2>アイデアを書いたPDFファイルをアップロードしましょう</h2>
							</div>
							<div className={classes.input_wrap}>
								<input
									className={classes.input}
									type="text"
									placeholder="アイデア名を入力してください(必須)"
									onChange={getIdeaName}
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
									onChange={imageToCid}
								/>
							</div>
							<p>または</p>
							<button>
								ファイルを選択
								<input
									className={classes.nftUploadInput}
									type="file"
									accept=".pdf, .png, .jpg"
									onChange={imageToCid}
								/>
							</button>
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default Home;
