const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage'); // add this line to import getStorage
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'unfinish-373e4.appspot.com' // name of your Firebase Storage bucket
});

const db = getFirestore();
const bucket = getStorage().bucket(); // create a reference to the default bucket

// output the bucket name to verify it's working
console.log('Storage Bucket:', bucket.name);
module.exports = { db, admin, bucket };