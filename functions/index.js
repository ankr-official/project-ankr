require("dotenv").config();
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const { onRequest } = require("firebase-functions/v2/https");
const { onValueCreated } = require("firebase-functions/v2/database");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");

// Secret Manager 에 저장된 값들과 매핑되는 Secret 정의
const FUNCTION_SECRET = defineSecret("ANKR_FUNCTION_SECRET");
const GMAIL_USER = defineSecret("ANKR_GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("ANKR_GMAIL_APP_PASSWORD");

const serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ankr-db-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "ankr-db.firebasestorage.app",
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
        const d = new Date(iso);
        if (isNaN(d)) return iso;
        const seoulDate = new Date(d.getTime() + 9 * 60 * 60 * 1000);
        const y = seoulDate.getUTCFullYear();
        const m = String(seoulDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(seoulDate.getUTCDate()).padStart(2, "0");
        const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
        const wd = weekdays[seoulDate.getUTCDay()];
        return `${y}. ${m}. ${day}. (${wd})`;
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
      ["제보 시각", report.submittedAt ? new Date(report.submittedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) : "-"],
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

exports.onEditRequestCreated = onValueCreated(
  {
    ref: "/editRequests/{requestId}",
    instance: "ankr-db-default-rtdb",
    region: "asia-southeast1",
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (event) => {
    const request = event.data.val();
    if (!request) return;

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
        const d = new Date(iso);
        if (isNaN(d)) return iso;
        const seoulDate = new Date(d.getTime() + 9 * 60 * 60 * 1000);
        const y = seoulDate.getUTCFullYear();
        const m = String(seoulDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(seoulDate.getUTCDate()).padStart(2, "0");
        const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
        const wd = weekdays[seoulDate.getUTCDay()];
        return `${y}. ${m}. ${day}. (${wd})`;
      } catch { return iso; }
    };

    const formatTime = (iso) => {
      if (!iso) return "-";
      try {
        const d = new Date(iso);
        if (isNaN(d)) return iso; // "HH:MM" 문자열 그대로 반환
        const seoulDate = new Date(d.getTime() + 9 * 60 * 60 * 1000);
        const h = String(seoulDate.getUTCHours()).padStart(2, "0");
        const m = String(seoulDate.getUTCMinutes()).padStart(2, "0");
        return `${h}:${m}`;
      } catch { return iso; }
    };

    const eventName = request.eventName || request.event_name || "(이름 없음)";
    const metaRows = [
      ["대상 이벤트", eventName],
      ["사유", request.reason || "-"],
      ["요청자", request.submittedBy || "-"],
      ["요청 시각", request.submittedAt ? new Date(request.submittedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) : "-"],
    ];
    const metaTableRows = metaRows
      .map(([label, value]) => `<tr><td style="padding:6px 12px;color:#6b7280;white-space:nowrap">${label}</td><td style="padding:6px 12px;color:#111827">${value}</td></tr>`)
      .join("");

    let html;
    let subject;

    if (request.deleteRequest) {
      // 삭제 요청 메일
      subject = `[ANKR] 삭제요청: ${eventName}`;
      html = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#dc2626;margin-bottom:4px">이벤트 삭제 요청이 접수되었습니다</h2>
          <p style="color:#6b7280;font-size:14px;margin-top:0">ANKR.KR 관리자 페이지에서 승인 또는 거절해 주세요.</p>
          <table style="width:100%;border-collapse:collapse;background:#fef2f2;border-radius:8px;overflow:hidden;margin-top:16px">
            <tbody>${metaTableRows}</tbody>
          </table>
          <p style="color:#dc2626;font-size:13px;margin-top:16px;font-weight:600">⚠️ 승인 시 이 이벤트가 영구 삭제됩니다.</p>
        </div>
      `;
    } else {
      // 수정 요청 메일 — diff 계산
      // _snap: 요청 제출 시점의 원본 값 스냅샷 (브라우저에서 저장). 없으면 DB에서 읽음.
      let original = request._snap ?? null;
      if (!original) {
        const originalSnap = await admin.database().ref(`data_v2/${request.eventId}`).once("value");
        original = originalSnap.val();
      }

      const toLocalDate = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        if (isNaN(d)) return iso.slice(0, 10);
        const seoulDate = new Date(d.getTime() + 9 * 60 * 60 * 1000);
        const y = seoulDate.getUTCFullYear();
        const m = String(seoulDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(seoulDate.getUTCDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };
      const toArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "string") return val.split(",").map(s => s.trim()).filter(Boolean);
        return Object.values(val);
      };

      const diffs = [];
      if (original) {
        if ((original.event_name ?? "") !== (request.event_name ?? ""))
          diffs.push(["이벤트명", original.event_name || "-", request.event_name || "-"]);
        if (toLocalDate(original.schedule) !== toLocalDate(request.schedule))
          diffs.push(["날짜", formatDate(original.schedule), formatDate(request.schedule)]);
        if ((original.location ?? "") !== (request.location ?? ""))
          diffs.push(["장소", original.location || "-", request.location || "-"]);
        const origGenre = toArray(original.genre).slice().sort().join(",");
        const reqGenre = toArray(request.genre).slice().sort().join(",");
        if (origGenre !== reqGenre)
          diffs.push(["장르", toArray(original.genre).join(", ") || "-", toArray(request.genre).join(", ") || "-"]);
        [["time_start","시작"], ["time_entrance","입장"], ["time_end","종료"]].forEach(([field, label]) => {
          if (formatTime(original[field]) !== formatTime(request[field]))
            diffs.push([`시간(${label})`, formatTime(original[field]) || "-", formatTime(request[field]) || "-"]);
        });
        if ((original.event_url ?? "") !== (request.event_url ?? ""))
          diffs.push(["SNS 링크", original.event_url || "-", request.event_url || "-"]);
        if ((original.etc ?? "") !== (request.etc ?? ""))
          diffs.push(["기타", original.etc || "-", request.etc || "-"]);
      }

      const diffTableRows = diffs.length > 0
        ? diffs.map(([label, from, to]) =>
            `<tr>
              <td style="padding:6px 12px;color:#6b7280;white-space:nowrap">${label}</td>
              <td style="padding:6px 12px;color:#9ca3af;text-decoration:line-through">${from}</td>
              <td style="padding:6px 12px;color:#111827;font-weight:600">${to}</td>
            </tr>`
          ).join("")
        : `<tr><td colspan="3" style="padding:6px 12px;color:#9ca3af">변경된 항목 없음</td></tr>`;

      subject = `[ANKR] 수정요청: ${eventName}`;
      html = `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="color:#d97706;margin-bottom:4px">수정 요청이 접수되었습니다</h2>
          <p style="color:#6b7280;font-size:14px;margin-top:0">ANKR.KR 관리자 페이지에서 승인 또는 거절해 주세요.</p>
          <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;margin-top:16px">
            <tbody>${metaTableRows}</tbody>
          </table>
          <p style="color:#6b7280;font-size:13px;margin-top:16px;margin-bottom:4px">변경 항목 (${diffs.length}개)</p>
          <table style="width:100%;border-collapse:collapse;background:#fffbeb;border-radius:8px;overflow:hidden">
            <thead>
              <tr style="background:#fef3c7">
                <th style="padding:6px 12px;color:#92400e;text-align:left;font-size:12px">항목</th>
                <th style="padding:6px 12px;color:#92400e;text-align:left;font-size:12px">기존</th>
                <th style="padding:6px 12px;color:#92400e;text-align:left;font-size:12px">변경</th>
              </tr>
            </thead>
            <tbody>${diffTableRows}</tbody>
          </table>
        </div>
      `;
    }

    await transporter.sendMail({
      from: `"ANKR.KR" <${gmailUser}>`,
      to: gmailUser,
      subject,
      html,
    });

    console.log("✅ Edit request notification email sent:", subject);
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

exports.weeklyBackup = onSchedule(
  {
    schedule: "0 9 * * 1",
    timeZone: "Asia/Seoul",
    region: "asia-southeast1",
  },
  async () => {
    const snapshot = await admin.database().ref("data_v2").get();
    const json = JSON.stringify(snapshot.val(), null, 2);

    // 서울 시간 기준 파일명 생성
    const now = new Date();
    const seoul = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    const timestamp = [
      seoul.getUTCFullYear(),
      pad(seoul.getUTCMonth() + 1),
      pad(seoul.getUTCDate()),
      "-",
      pad(seoul.getUTCHours()),
      pad(seoul.getUTCMinutes()),
    ].join("");
    const fileName = `backups/data_v2_${timestamp}.json`;

    await admin.storage().bucket().file(fileName).save(json, {
      contentType: "application/json",
    });

    console.log(`✅ Backup saved: ${fileName}`);
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
