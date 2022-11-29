import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "styles/Home.module.css";
import React from "react";

import classes from "styles/Index.module.css";
import { Header } from "src/components/Header";

// import { ethers } from "ethers";
import { ethers } from "ethers";
import abi from "utils/VotePortal.json";

import { Web3Storage } from "web3.storage";

const Home: NextPage = () => {
	const [currentAccount, setCurrentAccount] = React.useState("");

	const [image, setImage] = React.useState();

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
	}, []);

	// アイデアの名前を記録する関数
	const [ideaName, setIdeaName] = React.useState("");
	const getIdeaName = (e: any) => {
		setIdeaName(e.target.value);
	};

	// ImageをCIDに変える関数
	const imageToCid = async (e: any) => {
		const client = new Web3Storage({
			token: API_KEY,
		});
		const image = e.target;
		let file_cid;
		const name = image.files.name;

		const rootCid = await client.put(image.files, {
			name: ideaName,
			maxRetries: 3,
		});

		console.log("rootCid", rootCid);
		console.log("hello");

		CidToIdea(rootCid);
	};

	// Cidをアイデアに変える関数
	const CidToIdea = async (file_cid: any) => {
		try {
			const { ethereum } = window as any;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const voteContract = new ethers.Contract(contractAddress, contractABI, signer);

				// (アイデア名) => ideaName;
				// console.log(ideaName);

				// アイデア名が入力されていなかったら除外
				if (ideaName.length == 0) {
					return;
				}

				// アイデア 作成
				let IdeaTxn = await voteContract.addIdea(ideaName, file_cid);
				await IdeaTxn.wait();

				console.log("success");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const Thumbnail = async (e) => {
		const thumbnail = e.target.files[0];
		console.log(thumbnail);
		await setImage(thumbnail);
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
				{image ? <img src={image} alt="" /> : <div></div>}

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
							<div className={classes.title}>
								<h2>サムネイルをアップロードしよう</h2>
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
									accept=".png, .jpg"
									onChange={Thumbnail}
								/>
							</div>
							<p>または</p>
							<button>
								ファイルを選択
								<input
									className={classes.nftUploadInput}
									type="file"
									accept=".png, .jpg"
									onChange={Thumbnail}
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
