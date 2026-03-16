require("dotenv").config();
const admin = require("firebase-admin");

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

// Secret Manager 에 저장된 값들과 매핑되는 Secret 정의
// 비밀 값(요청 검증용 토큰)만 Secret 으로 관리
const FUNCTION_SECRET = defineSecret("ANKR_FUNCTION_SECRET");

const serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // 시크릿 값은 런타임에 일반 환경변수로 주입되므로 process.env에서만 읽습니다.
  databaseURL: process.env.ANKR_DATABASE_URL,
});

exports.syncData = onRequest(
  {
    timeoutSeconds: 60,
    secrets: [FUNCTION_SECRET],
  },
  async (req, res) => {
    try {
      const secret = req.headers["x-secret"];
      const expectedSecret = process.env.ANKR_FUNCTION_SECRET;
      if (secret !== expectedSecret) {
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
  },
);

exports.setUserRole = onRequest(
  {
    timeoutSeconds: 60,
    secrets: [FUNCTION_SECRET],
  },
  async (req, res) => {
    try {
      const secret = req.headers["x-secret"];
      const expectedSecret = process.env.ANKR_FUNCTION_SECRET;
      if (secret !== expectedSecret) {
        console.warn("⚠️ Unauthorized request with invalid secret");
        return res.status(403).send("Forbidden: Invalid secret");
      }

      const { uid, role } = req.body || {};
      if (!uid || typeof uid !== "string") {
        return res.status(400).send("Invalid uid");
      }
      if (!role || typeof role !== "string") {
        return res.status(400).send("Invalid role");
      }

      await admin.auth().setCustomUserClaims(uid, { role });
      console.log("✅ Custom claims set:", { uid, role });

      return res.status(200).json({ ok: true, uid, role });
    } catch (error) {
      console.error("❌ Error setting custom claims:", error);
      return res.status(500).send("Internal Server Error");
    }
  },
);
