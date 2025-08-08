import admin from "firebase-admin";
// import fs from "fs";
// import path from "path";
import { fileURLToPath } from "url";
// This is needed because __dirname doesn't work in ES6 modules
const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// const serviceAccountPath = path.join(__dirname, "../../serviceAccountKey.json");
// const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
export default admin;
