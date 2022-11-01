const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const spawn = require("child-process-promise").spawn;
const path = require("path");
const os = require("os");
const fs = require("fs");

exports.generateThumbnail = functions.storage.object().onFinalize(async (object: any) => {
	const fileBucket = object.bucket; // The Storage bucket that contains the file.
	const filePath = object.name; // File path in the bucket.
	const contentType = object.contentType; // File content type.

	// Get the file name.
	const fileName = path.basename(filePath);
	// Exit if the image is already a thumbnail.
	if (fileName.startsWith("thumb_")) {
		return functions.logger.log("Already a Thumbnail.");
	}

	// Download file from bucket.
	const bucket = admin.storage().bucket(fileBucket);
	const tempFilePath = path.join(os.tmpdir(), fileName);
	const outputFile = tempFilePath.replace(".pdf", ".jpeg");
	const metadata = {
		contentType: contentType,
	};
	await bucket.file(filePath).download({ destination: tempFilePath });
	functions.logger.log("Image downloaded locally to", tempFilePath);
	// Generate a thumbnail using ImageMagick.
	// await spawn("convert", ["-thumbnail", "200x200", tempFilePath + "[0]", outputFile]);

    const test = await spawn("gs", ["-sstdout=%stderr", "-sDEVICE=jpeg", "-r300", "-o", outputFile, tempFilePath]);

    test.stderr.on("data", (data) => console.log(data.toString()));
    // resolve , rejectがどこで呼ばれてるかわからない
	test.on("close", () => resolve());
	test.on("error", reject);

	// await spawn("convert", [
	// 	"-resize",
	// 	"200x200", // 文字色の指定。白文字に設定
	// 	tempFilePath, // 入力画像のパス
	// 	outputFile,
	// ]);

	functions.logger.log("Thumbnail created at", outputFile);
	// We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
	const thumbFileName = `thumb_${outputFile}`;
	const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
	// Uploading the thumbnail.
	await bucket.upload(tempFilePath, {
		destination: thumbFilePath,
		metadata: metadata,
	});
	// Once the thumbnail has been uploaded delete the local file to free up disk space.
	return fs.unlinkSync(tempFilePath);
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
