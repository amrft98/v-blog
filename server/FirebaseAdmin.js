import admin from 'firebase-admin';
import serviceAccount from './v-blog-3bcaf-firebase-adminsdk-hxu7i-ccc42dfa9b.json' assert {type:'json'};
import env from "dotenv";
import assert from 'assert';

env.config();
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

export { bucket };