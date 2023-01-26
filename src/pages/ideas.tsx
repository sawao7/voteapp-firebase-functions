import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import { Header } from "src/components/Header";
import styles from "styles/Home.module.css";
import classes from "styles/Ideas.module.css";

import { ethers } from "ethers";
import abi from "utils/VotePortal.json";
import Image from "next/image";
import Link from "next/link";

import firebaseApp from "src/Firebase/firebase";
import { getDownloadURL, uploadBytes } from "firebase/storage";
import { getDatabase, ref, onValue } from "firebase/database";

const Ideas: NextPage = () => {
	const [currentAccount, setCurrentAccount] = React.useState("");
	// URL すべて
	const [JpegNames, setJpegNames] = React.useState([]);
	// PDFの名前すべて
	const [PdfNames, setPdfNames]: any[] = React.useState([]);

	// アイデアのリスト NFTになっていないバージョンすべて
	const [ideas, setIdeas] = React.useState([]);
	console.log(typeof ideas[0]);

	// コントラクトアドレス
	const contractAddress = process.env.NEXT_PUBLIC_PRIVATE_CONTRACT_ADDRESS;
	const contractABI = abi.abi;

	// コピペ
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
	React.useEffect(() => {
		checkIfWalletIsConnected();

		const database = getDatabase(firebaseApp);
		const currentRef = ref(database, "URLs/");
		onValue(
			currentRef,
			(snapshot) => {
				const str = snapshot.val();
				const ary = str.split(",");

				setJpegNames(ary);

				// 拡張子jpegをpdfにしてpdfNamesに保存
				const pdfAry: any[] = [];
				ary.map((name: any) => {
					pdfAry.push(name.replace(".jpeg", ".pdf"));
				});
				setPdfNames(pdfAry);
			},
			(error) => {
				console.log(error);
			}
		);
		getAllIdeas();

		let voteContract: any;

		const onNewNFT = (idea: any) => {
			console.log("onNewNFT", idea);
			//openseaへのリンク
			// 正しいURLはネットワーク名も入れる必要があるもの
			// const currentIdeas = [...ideas];
			// console.log(idea);
			let currentIdea = { ...idea };
			currentIdea.message = "NFTになりました";
			// const currentIdea = currentIdeas()
			// console.log("currentidea", currentIdea);
			let currentIdeas = [...ideas];
			console.log("before curent ideas", currentIdeas);
			let count = 0;
			currentIdeas.map((ideas) => {
				if (ideas.ideaURL == currentIdea.ideaURL) {
					currentIdeas[count] = currentIdea;
				} else {
					count += 1;
				}
			});
			console.log("after currentIdeas", currentIdeas);
			// console.log("idea", idea);
			console.log("https://testnets.opensea.io/assets/goerli/0xa964f714688ad15aE0d514a5cBD04f8A34a035C1/" + 0);

			// setAllWaves((prevState) => [
			// 	...prevState,
			// 	{
			// 		address: from,
			// 		timestamp: new Date(timestamp * 1000),
			// 		message: message,
			// 	},
			// ]);
		};

		/* Newイベントがコントラクトから発信されたときに、情報を受け取ります */
		const { ethereum } = window as any;
		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();

			voteContract = new ethers.Contract(contractAddress, contractABI, signer);
			voteContract.on("NewNFT", onNewNFT);
		}
		/*メモリリークを防ぐために、NewWaveのイベントを解除します*/
		return () => {
			if (voteContract) {
				voteContract.off("NewNFT", onNewNFT);
			}
		};
	}, []);

	// 特定のアイデアにVoteする関数
	const voteIdea = async (index: any, isGood: bool) => {
		try {
			const { ethereum } = window as any;
			console.log("index", index);
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const voteContract = new ethers.Contract(contractAddress, contractABI, signer);

				// indexのアイデアに投票する
				await voteContract.voteIdea(index, isGood);

				let result = await voteContract.getIdea(0);
				console.log("voted result: ", result);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	// すべてのアイデアを取得する関数
	const getAllIdeas = async () => {
		try {
			const { ethereum } = window as any;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const voteContract = new ethers.Contract(contractAddress, contractABI, signer);

				const ideas = await voteContract.getAllIdeas();
				console.log(ideas);
				setIdeas(ideas);
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<Head>
				<title>Ideas Page</title>
				<meta name="description" content="Generated by create next app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Header />
			<main className={classes.main}>
				<h1>アイデア一覧</h1>

				<div className={classes.ideas}>
					{ideas.map((idea: any, index: any) => {
						return (
							<div key={index}>
								<div className={classes.l_wrapper_06}>
									<div className={classes.card_06}>
										<Link href={"https://" + idea.ideaURL + ".ipfs.w3s.link/" + PdfNames[index]}>
											<Image
												className={classes.card_img_06}
												src={`https://firebasestorage.googleapis.com/v0/b/vote-dapp-60851.appspot.com/o/${JpegNames[index]}?alt=media`}
												width={500}
												height={200}
												objectFit="cover"
												alt=""
												// onError={() => {
												// 	const currentNames = JpegNames;
												// 	currentNames.splice(index, 1, "loading.jpeg");
												// 	console.log(currentNames);
												// 	setJpegNames(currentNames);
												// }}
											/>
										</Link>

										<div className={classes.card_content_06}>
											<p className={classes.card_title_06}>{idea.name}</p>
											<p className={classes.card_text_06}>
												賛成数 : {idea.goodVotes.toNumber()}
												反対数 : {idea.badVotes.toNumber()}
											</p>
										</div>
										{idea.isFinished ? (
											<div className={classes.card_link_06}>
												<button className={classes.card_link_btn_06}>NFTをOpenseaで見る</button>
											</div>
										) : (
											<div className={classes.card_link_06}>
												<button
													className={classes.card_link_btn_06}
													onClick={() => voteIdea(index, true)}
												>
													賛成
												</button>
												<button
													className={classes.card_link_btn_06}
													onClick={() => voteIdea(index, false)}
												>
													反対
												</button>
											</div>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</main>
		</div>
	);
};

export default Ideas;
