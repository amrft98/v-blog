import {initializeApp} from 'firebase/app' 
import {getStorage} from 'firebase/storage';


const firebaseConfig = {
  apiKey:"AIzaSyDK528uR6XlvtnGlSTHMtWKxT7s5-zzDpM",
  authDomain: "v-blog-3bcaf.firebaseapp.com",
  projectId: "v-blog-3bcaf",
  storageBucket:"v-blog-3bcaf.appspot.com",
  messagingSenderId: "391982404188",
  appId:"1:391982404188:web:9ad42b3ddcaaad52ab8c99"
};
const app=initializeApp(firebaseConfig)

const storage = getStorage(app);

export { storage };