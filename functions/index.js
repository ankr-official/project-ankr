require("dotenv").config();
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const { onRequest, onCall } = require("firebase-functions/v2/https");
const { onValueCreated } = require("firebase-functions/v2/database");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const crypto = require("crypto");

admin.initializeApp({
  databaseURL: "https://ankr-db-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "ankr-db.firebasestorage.app",
});

const escapeHtml = (str) => {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

const safeUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  try {
    const { protocol } = new URL(url);
    return ["http:", "https:"].includes(protocol) ? escapeHtml(url) : "";
  } catch { return ""; }
};

exports.onReportCreated = onValueCreated(
  {
    ref: "/reports/{reportId}",
    instance: "ankr-db-default-rtdb",
    region: "asia-southeast1",
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
      ["이벤트명", escapeHtml(report.event_name) || "-"],
      ["날짜", formatDate(report.schedule)],
      ["장소", escapeHtml(report.location) || "-"],
      ["장르", escapeHtml(report.genre) || "-"],
      ["SNS 링크", safeUrl(report.event_url) || "-"],
      ["기타", escapeHtml(report.etc) || "-"],
      ["제보자", escapeHtml(report.submittedBy) || "-"],
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

    const eventName = escapeHtml(request.eventName || request.event_name) || "(이름 없음)";
    const metaRows = [
      ["대상 이벤트", eventName],
      ["사유", escapeHtml(request.reason) || "-"],
      ["요청자", escapeHtml(request.submittedBy) || "-"],
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
        const evtPath = `data_v3/${request.eventYear}/${request.eventId}`;
        const originalSnap = await admin.database().ref(evtPath).once("value");
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
          diffs.push(["이벤트명", escapeHtml(original.event_name) || "-", escapeHtml(request.event_name) || "-"]);
        if (toLocalDate(original.schedule) !== toLocalDate(request.schedule))
          diffs.push(["날짜", formatDate(original.schedule), formatDate(request.schedule)]);
        if ((original.location ?? "") !== (request.location ?? ""))
          diffs.push(["장소", escapeHtml(original.location) || "-", escapeHtml(request.location) || "-"]);
        const origGenre = toArray(original.genre).slice().sort().join(",");
        const reqGenre = toArray(request.genre).slice().sort().join(",");
        if (origGenre !== reqGenre)
          diffs.push(["장르", escapeHtml(toArray(original.genre).join(", ")) || "-", escapeHtml(toArray(request.genre).join(", ")) || "-"]);
        [["time_start","시작"], ["time_entrance","입장"], ["time_end","종료"]].forEach(([field, label]) => {
          if (formatTime(original[field]) !== formatTime(request[field]))
            diffs.push([`시간(${label})`, formatTime(original[field]) || "-", formatTime(request[field]) || "-"]);
        });
        if ((original.event_url ?? "") !== (request.event_url ?? ""))
          diffs.push(["SNS 링크", safeUrl(original.event_url) || "-", safeUrl(request.event_url) || "-"]);
        if ((original.etc ?? "") !== (request.etc ?? ""))
          diffs.push(["기타", escapeHtml(original.etc) || "-", escapeHtml(request.etc) || "-"]);
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


exports.weeklyBackup = onSchedule(
  {
    schedule: "0 9 * * 1",
    timeZone: "Asia/Seoul",
    region: "asia-southeast1",
  },
  async () => {
    const snapshot = await admin.database().ref("data_v3").get();
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
    const fileName = `backups/data_v3_${timestamp}.json`;

    await admin.storage().bucket().file(fileName).save(json, {
      contentType: "application/json",
    });

    console.log(`✅ Backup saved: ${fileName}`);
  },
);

const ADMIN_ALLOWED_ORIGINS = new Set([
  "https://ankr.kr",
  ...(process.env.ADMIN_EXTRA_ORIGIN ? [process.env.ADMIN_EXTRA_ORIGIN] : []),
]);

const setCors = (res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

const setAdminCors = (res, req) => {
  const origin = req.headers.origin || "";
  res.set("Access-Control-Allow-Origin", ADMIN_ALLOWED_ORIGINS.has(origin) ? origin : "null");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Vary", "Origin");
};

const verifyToken = async (req, res, allowedRoles) => {
  const authHeader = req.headers["authorization"] || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    res.status(403).send("Forbidden: missing token");
    return null;
  }
  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch {
    res.status(403).send("Forbidden: invalid token");
    return null;
  }
  if (!allowedRoles.includes(decoded.role)) {
    res.status(403).send("Forbidden: insufficient role");
    return null;
  }
  return decoded;
};

const verifyOwnerToken = (req, res) => verifyToken(req, res, ["owner"]);
const verifyAdminOrOwnerToken = (req, res) => verifyToken(req, res, ["admin", "owner"]);

exports.setUserRole = onRequest(
  {
    timeoutSeconds: 60,
    region: "asia-northeast3",
  },
  async (req, res) => {
    setAdminCors(res, req);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (!(await verifyOwnerToken(req, res))) return;

    try {
      const { uid, role } = req.body || {};
      if (!uid || typeof uid !== "string") return res.status(400).send("Invalid uid");
      if (!role || typeof role !== "string") return res.status(400).send("Invalid role");
      if (role === "owner") return res.status(400).send("Cannot assign owner role");

      const targetUser = await admin.auth().getUser(uid);
      if (targetUser.customClaims?.role === "owner") return res.status(403).send("Forbidden: cannot change owner's role");

      await admin.auth().setCustomUserClaims(uid, { role });
      console.log("✅ Custom claims set:", { uid, role });
      return res.status(200).json({ ok: true, uid, role });
    } catch (error) {
      console.error("❌ Error setting custom claims:", error);
      return res.status(500).send("Internal Server Error");
    }
  },
);

exports.listUsers = onRequest(
  {
    timeoutSeconds: 60,
    region: "asia-northeast3",
  },
  async (req, res) => {
    setAdminCors(res, req);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (!(await verifyAdminOrOwnerToken(req, res))) return;

    try {
      const listResult = await admin.auth().listUsers(1000);
      const users = listResult.users.map((u) => ({
        uid: u.uid,
        email: u.email || "",
        disabled: u.disabled,
        role: u.customClaims?.role || null,
        createdAt: u.metadata.creationTime || null,
      }));
      return res.status(200).json({ ok: true, users });
    } catch (error) {
      console.error("❌ Error listing users:", error);
      return res.status(500).send("Internal Server Error");
    }
  },
);

exports.setUserDisabled = onRequest(
  {
    timeoutSeconds: 60,
    region: "asia-northeast3",
  },
  async (req, res) => {
    setAdminCors(res, req);
    if (req.method === "OPTIONS") return res.status(204).send("");
    const caller = await verifyAdminOrOwnerToken(req, res);
    if (!caller) return;

    try {
      const { uid, disabled, reason } = req.body || {};
      if (!uid || typeof uid !== "string") return res.status(400).send("Invalid uid");
      if (typeof disabled !== "boolean") return res.status(400).send("Invalid disabled");

      const targetUser = await admin.auth().getUser(uid);
      if (targetUser.customClaims?.role === "owner") return res.status(403).send("Forbidden: cannot disable owner");

      await admin.auth().updateUser(uid, { disabled });

      const db = admin.database();
      if (disabled) {
        await db.ref(`suspensions/${uid}`).set({
          reason: reason || "",
          suspendedAt: new Date().toISOString(),
        });
      } else {
        await db.ref(`suspensions/${uid}`).remove();
      }

      await db.ref(`auditLogs`).push({
        action: disabled ? "disable" : "enable",
        targetUid: uid,
        performedBy: caller.uid,
        performedByRole: caller.role,
        reason: reason || "",
        timestamp: new Date().toISOString(),
      });

      console.log("✅ User disabled state updated:", { uid, disabled });
      return res.status(200).json({ ok: true, uid, disabled });
    } catch (error) {
      console.error("❌ Error updating user:", error);
      return res.status(500).send("Internal Server Error");
    }
  },
);


const DAILY_LIMIT = 10;

const checkAndIncrementLimit = async (db, path) => {
  const today = new Date().toISOString().slice(0, 10);
  const snap = await db.ref(path).once("value");
  const val = snap.val();
  const count = val?.date === today ? (val.count ?? 0) : 0;
  if (count >= DAILY_LIMIT) return false;
  await db.ref(path).set({ date: today, count: count + 1 });
  return true;
};

exports.submitReport = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) throw new Error("unauthenticated");
    const { event_name, schedule, location, genre, event_url, etc } = request.data || {};
    if (!event_name || !schedule || !location || !genre || !event_url)
      throw new Error("missing-required-fields");

    const db = admin.database();
    const uid = request.auth.uid;
    const token = await admin.auth().getUser(uid);
    const role = token.customClaims?.role;

    if (role !== "admin" && role !== "owner") {
      const allowed = await checkAndIncrementLimit(db, `reportLimits/${uid}`);
      if (!allowed) throw new Error("daily-limit-exceeded");
    }

    await db.ref("reports").push({
      event_name,
      schedule,
      location,
      genre,
      event_url,
      ...(etc != null && { etc }),
      submittedAt: new Date().toISOString(),
      submittedBy: request.auth.token.email || uid,
    });

    return { ok: true };
  }
);

exports.submitEditRequest = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) throw new Error("unauthenticated");
    const { eventId, eventYear, eventName, reason, formData, _snap } = request.data || {};
    if (!eventId || !eventYear || !eventName || !reason || !formData)
      throw new Error("missing-required-fields");

    const db = admin.database();
    const uid = request.auth.uid;
    const token = await admin.auth().getUser(uid);
    const role = token.customClaims?.role;

    if (role !== "admin" && role !== "owner") {
      const allowed = await checkAndIncrementLimit(db, `editRequestLimits/${uid}`);
      if (!allowed) throw new Error("daily-limit-exceeded");
    }

    await db.ref("editRequests").push({
      ...formData,
      eventId,
      eventYear,
      eventName,
      reason,
      submittedAt: new Date().toISOString(),
      submittedBy: request.auth.token.email || uid,
      ...(_snap != null && { _snap }),
    });

    return { ok: true };
  }
);

exports.recordView = onCall(
  {
    region: "asia-southeast1",
    enforceAppCheck: false,
  },
  async (request) => {
    const { eventId, eventYear } = request.data || {};
    if (!eventId || !/^row\d+$/.test(eventId)) throw new Error("Invalid eventId");
    if (!Number.isInteger(eventYear) || eventYear < 2020 || eventYear > 2100) throw new Error("Invalid eventYear");

    const db = admin.database();
    const eventSnap = await db.ref(`data_v3/${eventYear}/${eventId}`).once("value");
    if (!eventSnap.exists()) return { counted: false };

    const forwarded = request.rawRequest.headers["x-forwarded-for"];
    const ip =
      (forwarded ? forwarded.split(",").at(-1).trim() : null) ||
      request.rawRequest.socket?.remoteAddress ||
      "unknown";

    const hash = crypto
      .createHash("sha256")
      .update(ip + eventId)
      .digest("hex")
      .slice(0, 16);

    const ipRef = db.ref(`viewIPs/${eventId}/${hash}`);
    const snap = await ipRef.once("value");

    const now = Date.now();
    const TTL_MS = 24 * 60 * 60 * 1000;
    if (snap.exists() && now - snap.val() < TTL_MS) return { counted: false };

    await db.ref(`data_v3/${eventYear}/${eventId}/views`)
      .transaction((current) => (current || 0) + 1);
    await ipRef.set(now);

    return { counted: true };
  }
);

// data_v2 → data_v3/{year}/{id} 마이그레이션 (1회 실행용, owner만 호출 가능)

exports.deleteSelf = onRequest(
  {
    timeoutSeconds: 60,
    region: "asia-northeast3",
  },
  async (req, res) => {
    setCors(res);
    if (req.method === "OPTIONS") return res.status(204).send("");

    const authHeader = req.headers["authorization"] || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) return res.status(403).send("Forbidden: missing token");

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(403).send("Forbidden: invalid token");
    }

    const uid = decoded.uid;
    try {
      await admin.auth().deleteUser(uid);
    } catch (error) {
      console.error("❌ Error deleting auth user in deleteSelf:", error);
      return res.status(500).send("Internal Server Error");
    }

    const db = admin.database();
    try {
      await Promise.all([
        db.ref(`reportLimits/${uid}`).remove(),
        db.ref(`editRequestLimits/${uid}`).remove(),
        db.ref(`likes/${uid}`).remove(),
        db.ref(`suspensions/${uid}`).remove(),
      ]);
    } catch (error) {
      console.error("❌ RTDB cleanup failed after self-delete. uid:", uid, error);
      try {
        const gmailUser = process.env.ANKR_GMAIL_USER;
        const gmailPassword = process.env.ANKR_GMAIL_APP_PASSWORD;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPassword },
        });
        await transporter.sendMail({
          from: `"ANKR.KR" <${gmailUser}>`,
          to: gmailUser,
          subject: `[ANKR] 회원 탈퇴 후 RTDB 정리 실패`,
          text: `Auth 삭제는 완료됐으나 RTDB 정리에 실패했습니다.\n\nuid: ${uid}\n\n오류: ${error.message}`,
        });
      } catch (mailError) {
        console.error("❌ Failed to send cleanup failure report:", mailError);
      }
    }

    console.log("✅ Self-deleted:", uid);
    return res.status(200).json({ ok: true });
  },
);

exports.deleteUser = onRequest(
  {
    timeoutSeconds: 60,
    region: "asia-northeast3",
  },
  async (req, res) => {
    setAdminCors(res, req);
    if (req.method === "OPTIONS") return res.status(204).send("");
    const caller = await verifyOwnerToken(req, res);
    if (!caller) return;

    try {
      const { uid } = req.body || {};
      if (!uid || typeof uid !== "string") return res.status(400).send("Invalid uid");

      const targetUser = await admin.auth().getUser(uid);
      if (targetUser.customClaims?.role === "owner") return res.status(403).send("Forbidden: cannot delete owner");

      const db = admin.database();
      await db.ref(`auditLogs`).push({
        action: "delete",
        targetUid: uid,
        targetEmail: targetUser.email || "",
        performedBy: caller.uid,
        performedByRole: caller.role,
        timestamp: new Date().toISOString(),
      });

      await admin.auth().deleteUser(uid);

      await Promise.all([
        db.ref(`reportLimits/${uid}`).remove(),
        db.ref(`editRequestLimits/${uid}`).remove(),
        db.ref(`likes/${uid}`).remove(),
        db.ref(`suspensions/${uid}`).remove(),
      ]);

      console.log("✅ User deleted:", uid);
      return res.status(200).json({ ok: true, uid });
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      return res.status(500).send("Internal Server Error");
    }
  },
);
