import admin from "firebase-admin";
admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or use cert() for service account
});
export default admin;
