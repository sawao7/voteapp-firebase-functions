import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyB2TNHiuTsVUOcJuysR2zPnKpWky_ozK9c",
	authDomain: "growp-84484.firebaseapp.com",
	projectId: "growp-84484",
	storageBucket: "growp-84484.appspot.com",
	messagingSenderId: "37382778657",
	appId: "1:37382778657:web:0d3dbf2332bd75448c1860",
};

const firebase = initializeApp(firebaseConfig);
const firestorage = getStorage(firebase);

// Initialize firebase
// firebase.initializeApp(firebaseConfig);
// export const storage = firebase.storage();
// export default firebase;

export const firebaseApp = {
	firestorage,
};
