require("dotenv").config();
const admin = require("firebase-admin");

const { onRequest } = require("firebase-functions/v2/https");

const serviceAccount = require("./service-account-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.ANKR_DATABASE_URL,
});

exports.syncData = onRequest({ timeoutSeconds: 60 }, async (req, res) => {
    try {
        const secret = req.headers["x-secret"];
        if (secret !== process.env.FUNCTION_SECRET) {
            console.warn("⚠️ Unauthorized request with invalid secret");
            return res.status(403).send("Forbidden: Invalid secret");
        }

        const data = req.body;

        if (!data || typeof data !== "object") {
            console.warn("⚠️ Invalid or missing data received");
            return res.status(400).send("Invalid data");
        }

        console.log("📥 Received payload:", JSON.stringify(data, null, 2));

        await admin.database().ref("data").set(data);
        console.log("✅ Data written to Firebase Realtime Database");

        res.status(200).send("✅ Data synced successfully");
    } catch (error) {
        console.error("❌ Error syncing data:", error);
        res.status(500).send("Internal Server Error");
    }
});
