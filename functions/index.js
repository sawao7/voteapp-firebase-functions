"use strict";
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const spawn = require("child-process-promise").spawn;
const path = require("path");
const os = require("os");
const fs = require("fs");
const gs = require("gs");

exports.generateThumbnail = functions.storage.object().onFinalize(async (object) => {
	// 無限ループ防止
	if (object.contentType !== "application/pdf") {
		return;
	}

	const fileBucket = object.bucket; // The Storage bucket that contains the file.
	const filePath = object.name; // File path in the bucket.
	const fileName = path.basename(filePath);

	// if (fileName.startsWith("thumb_")) {
	// 	return functions.logger.log("Already a Thumbnail.");
	// }
	const bucket = admin.storage().bucket(fileBucket);
	const tempFilePath = path.join(os.tmpdir(), fileName);
	// const outputFile = tempFilePath.replace(".pdf", ".jpeg");
	const outputFile = path.join(os.tmpdir(), "output.jpeg");

	console.log("filepath is ", filePath);
	console.log("filename is ", fileName);
	console.log("tmpfilepath is ", tempFilePath);
	console.log("outputfile is ", outputFile);

	await bucket.file(filePath).download({ destination: tempFilePath });

	await gs()
		.batch()
		.nopause()
		.option("-r" + 50 * 2)
		// .option("-dDownScaleFactor=2")
		.executablePath("lambda-ghostscript/bin/./gs")
		.device("jpeg")
		.output(outputFile)
		.input(tempFilePath)
		.exec(function (err, stdout, stderr) {
			if (!err) {
				console.log("gs executed w/o error");
				console.log("stdout", stdout);
				console.log("stderr", stderr);
				// destination のoutputfileを変えるのはあり
				const outputFileName = filePath.replace(".pdf", ".jpeg");

				bucket.upload(outputFile, { destination: outputFileName });
				resolve();
			} else {
				console.log("gs error:", err);
				reject(err);
			}
		});

	// // const thumbFileName = `thumb_${outputFile}`;
	// const thumbFilePath = path.join(path.dirname(filePath), outputFile);

	// // Uploading the thumbnail.
	// await bucket.upload(outputFile, {
	// 	destination: outputFile,
	// 	metadata: metadata,
	// });

	// console.log("output file is second ", outputFile);
	// console.log("thumbfilepath", thumbFilePath);
	// return fs.unlinkSync(tempFilePath);
	return;
});
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// admin.initializeApp();
// const spawn = require("child-process-promise").spawn;
// const path = require("path");
// const os = require("os");
// async function genOgp(req, res) {
// 	// **************************************************
// 	// * ImagiMagickで画像生成
// 	// **************************************************
// 	// ベースの画像
// 	const template = `img/ogp.pdf`;
// 	// 生成した画像のパス。tmpディレクトリに配置する
// 	const outFile = path.join(os.tmpdir(), `generated_ogp.png`);
// 	// ImageMagicで画像生成
//     // spawn ターミナルに入れるコマンドを実行する
//     await spawn("convert", [
// 		template, // 入力画像のパス
// 		outFile, // 出力画像のパス
// 	]);
// 	// **************************************************
// 	// * Cloud Storageへのアップロード
// 	// **************************************************
// 	const bucket = admin.storage().bucket();
// 	const uploadPath = `ogp/generate_ogp.png`; // アップロード先のパス
// 	await bucket.upload(outFile, { destination: uploadPath });
// 	// **************************************************
// 	// * アップロード画像のURLを組み立てる
// 	// **************************************************
// 	const STORAGE_ROOT = "https://firebasestorage.googleapis.com/v0/b";
// 	const bucketName = bucket.name;
// 	const dlPath = encodeURIComponent(uploadPath);
// 	const dlURL = `${STORAGE_ROOT}/${bucketName}/o/${dlPath}?alt=media`;
// 	// return Download URL
// 	res.send(dlURL);
// }
// exports.genOgp = functions.https.onRequest(genOgp);
//# sourceMappingURL=index.js.map
