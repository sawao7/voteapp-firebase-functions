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
	const outputFile = tempFilePath.replace(".pdf", ".jpeg");
	// const outputFile = path.join(os.tmpdir(), "output.jpeg");

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
				fs.unlinkSync(tempFilePath);
				resolve();
			} else {
				console.log("gs error:", err);
				reject(err);
			}
		});

	return;
});
