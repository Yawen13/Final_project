const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin'); // 
const serviceAccount = require('./serviceAccountKey.json');


initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
module.exports = { db, admin };