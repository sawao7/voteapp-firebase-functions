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
import { Web3Auth } from "@web3auth/modal";

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

// web3auth.initModal();

const Home: NextPage = () => {
	//Initialize within your constructor

	const [currentAccount, setCurrentAccount] = React.useState("");
	const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
	console.log("current", currentAccount);

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
	const contractAddress: any = process.env.NEXT_PUBLIC_PRIVATE_CONTRACT_ADDRESS;
	const contractABI = abi.abi;

	const API_KEY: any = process.env.NEXT_PUBLIC_PRIVATE_WEBSTORAGE_KEY;

	const checkIfWalletIsConnected = async () => {
		try {
			const web3auth = new Web3Auth({
				uiConfig: {
					appName: "W3A", // <-- Your dApp Name
					appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg", // Your dApp Logo URL
					theme: "light", // "light" | "dark" | "auto"
					loginMethodsOrder: ["apple", "google", "twitter"],
					defaultLanguage: "ja", // en, de, ja, ko, zh, es, fr, pt, nl
					loginGridCol: 3, // 2 | 3
					primaryButton: "externalLogin", // "externalLogin" | "socialLogin" | "emailLogin"
				},
				clientId: "BJGFBlJG9JpTya-vbj6sVow_k40-EHuvHLzUlxchVGkNTAcWgCnsehzbd2uNmwayP0palt3nMhzdOFHtCqH_wFE", // Get your Client ID from Web3Auth Dashboard
				chainConfig: {
					chainNamespace: "eip155",
					// rpcTarget: "https://rpc.ankr.com/eth_goerli",
					// rpcTarget: "https://eth-goerli.g.alchemy.com/v2/l6HvZ4wkSqFBVANW0EKTjFxXZ1ZEuJEu",
					chainId: "0x5", // Please use 0x5 for Goerli Testnet
					displayName: "Goerli Testnet",
				},
			});
			setWeb3auth(web3auth);

			await web3auth.initModal();
		} catch (error) {
			console.error(error);
		}
	};

	const connectWallet = async () => {
		console.log("hello");
		try {
			if (!web3auth) {
				console.log("web3auth not initialized yet");
				return;
			}
			console.log("test");

			const web3authProvider = await web3auth.connect();
			console.log("auth", web3authProvider);
			setCurrentAccount(web3authProvider);

			getUserInfo();
		} catch (error) {
			console.log(error);
		}
	};

	const getUserInfo = async () => {
		if (!web3auth) {
			console.log("web3auth not initialized yet");
			return;
		}
		const user = await web3auth.getUserInfo();
		console.log(user);
	};

	const logout = async () => {
		if (!web3auth) {
			console.log("web3auth not initialized yet");
			return;
		}
		await web3auth.logout();
		setCurrentAccount(null);
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

		const name_original = name.replace(".pdf", "");
		CidToIdea(rootCid, name_original);
	};

	// Cidをアイデアに変える関数
	const CidToIdea = async (file_cid: any, name_original: any) => {
		try {
			// const { ethereum } = window as any;
			if (currentAccount) {
				// ethereumに、web3authのproviderを入れる
				console.log(currentAccount);
				getUserInfo();
				const provider = new ethers.providers.Web3Provider(currentAccount);
				const signer = provider.getSigner();
				console.log(signer.getAddress());
				const voteContract = new ethers.Contract(contractAddress, contractABI, signer);

				// (アイデア名) => ideaName;
				// console.log(ideaName);

				// アイデア名が入力されていなかったら除外
				if (ideaName.length == 0) {
					return;
				}

				// アイデア 作成
				// モーダルを表示 "アップロード中"
				setModalOpenUpload((frag) => !frag);
				let IdeaTxn = await voteContract.addIdea(ideaName, file_cid, name_original);
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
