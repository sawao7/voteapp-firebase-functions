import { initializeApp } from "firebase/app";

const firebaseConfig = {
	apiKey: "AIzaSyC8kVkXpcKOQfekHc8kOifDaBbRFP-9nMU",
	authDomain: "vote-dapp-60851.firebaseapp.com",
	databaseURL: "https://vote-dapp-60851-default-rtdb.firebaseio.com",
	projectId: "vote-dapp-60851",
	storageBucket: "vote-dapp-60851.appspot.com",
	messagingSenderId: "357973271138",
	appId: "1:357973271138:web:ddd82f673ff2b569c4673b",
};

const firebaseApp = initializeApp(firebaseConfig);

// Initialize firebase
// firebase.initializeApp(firebaseConfig);
// export const storage = firebase.storage();
// export default firebase;

export default firebaseApp;
