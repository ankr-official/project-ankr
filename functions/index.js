require("dotenv").config();
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const { onRequest } = require("firebase-functions/v2/https");
const { onValueCreated } = require("firebase-functions/v2/database");
const { defineSecret } = require("firebase-functions/params");

// Secret Manager 에 저장된 값들과 매핑되는 Secret 정의
const FUNCTION_SECRET = defineSecret("ANKR_FUNCTION_SECRET");
const GMAIL_USER = defineSecret("ANKR_GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("ANKR_GMAIL_APP_PASSWORD");

const serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // 시크릿 값은 런타임에 일반 환경변수로 주입되므로 process.env에서만 읽습니다.
  databaseURL: process.env.ANKR_DATABASE_URL,
});

exports.onReportCreated = onValueCreated(
  {
    ref: "/reports/{reportId}",
    instance: "ankr-db-default-rtdb",
    region: "asia-southeast1",
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (event) => {
    const report = event.data.val();
    if (!report) return;

    const gmailUser = process.env.ANKR_GMAIL_USER;
    const gmailPassword = process.env.ANKR_GMAIL_APP_PASSWORD;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    const formatDate = (iso) => {
      if (!iso) return "-";
      try {
        return new Date(iso).toLocaleDateString("ko-KR", {
          year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
        });
      } catch { return iso; }
    };

    const rows = [
      ["이벤트명", report.event_name || "-"],
      ["날짜", formatDate(report.schedule)],
      ["장소", report.location || "-"],
      ["장르", report.genre || "-"],
      ["SNS 링크", report.event_url || "-"],
      ["기타", report.etc || "-"],
      ["제보자", report.submittedBy || "-"],
      ["제보 시각", report.submittedAt ? new Date(report.submittedAt).toLocaleString("ko-KR") : "-"],
    ];

    const tableRows = rows
      .map(([label, value]) => `<tr><td style="padding:6px 12px;color:#6b7280;white-space:nowrap">${label}</td><td style="padding:6px 12px;color:#111827">${value}</td></tr>`)
      .join("");

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#4f46e5;margin-bottom:4px">새 행사 제보가 접수되었습니다</h2>
        <p style="color:#6b7280;font-size:14px;margin-top:0">ANKR.KR 관리자 페이지에서 승인 또는 거절해 주세요.</p>
        <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;margin-top:16px">
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `;

    await transporter.sendMail({
      from: `"ANKR.KR" <${gmailUser}>`,
      to: gmailUser,
      subject: `[ANKR] 새 제보: ${report.event_name || "(이름 없음)"}`,
      html,
    });

    console.log("✅ Report notification email sent for:", report.event_name);
  },
);

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
