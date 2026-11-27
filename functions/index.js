require("dotenv").config();
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getDatabase } = require("firebase-admin/database");
const { getStorage } = require("firebase-admin/storage");
const nodemailer = require("nodemailer");

const { onRequest, onCall } = require("firebase-functions/v2/https");
const { onValueCreated } = require("firebase-functions/v2/database");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const crypto = require("crypto");

const R2_ACCOUNT_ID = defineSecret("R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = defineSecret("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = defineSecret("R2_SECRET_ACCESS_KEY");
const R2_BUCKET = "ankr-assets";
const ASSETS_BASE_URL = "https://ankr-assets.ankr-web-official.workers.dev";

initializeApp({
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
        const originalSnap = await getDatabase().ref(evtPath).once("value");
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
    const snapshot = await getDatabase().ref("data_v3").get();
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

    await getStorage().bucket().file(fileName).save(json, {
      contentType: "application/json",
    });

    console.log(`✅ Backup saved: ${fileName}`);
  },
);

// 관리자 조치 기록(대상 이메일 포함)은 1년 보관 후 삭제 — 개인정보처리방침 보유기간과 일치시킬 것
const AUDIT_LOG_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;

exports.cleanupAuditLogs = onSchedule(
  {
    schedule: "0 5 1 * *",
    timeZone: "Asia/Seoul",
    region: "asia-southeast1",
  },
  async () => {
    const db = getDatabase();
    const logs = (await db.ref("auditLogs").get()).val() || {};
    const cutoff = Date.now() - AUDIT_LOG_RETENTION_MS;

    const updates = {};
    for (const [key, log] of Object.entries(logs)) {
      const ts = Date.parse(log?.timestamp);
      if (!Number.isNaN(ts) && ts < cutoff) updates[key] = null;
    }

    if (Object.keys(updates).length) await db.ref("auditLogs").update(updates);
    console.log(`✅ auditLogs cleanup: removed ${Object.keys(updates).length}`);
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
    decoded = await getAuth().verifyIdToken(idToken);
  } catch (error) {
    console.error("❌ verifyIdToken failed:", error);
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
    const caller = await verifyOwnerToken(req, res);
    if (!caller) return;

    try {
      const { uid, role } = req.body || {};
      if (!uid || typeof uid !== "string") return res.status(400).send("Invalid uid");
      if (!role || typeof role !== "string") return res.status(400).send("Invalid role");
      if (role === "owner") return res.status(400).send("Cannot assign owner role");

      const targetUser = await getAuth().getUser(uid);
      if (targetUser.customClaims?.role === "owner") return res.status(403).send("Forbidden: cannot change owner's role");

      await getAuth().setCustomUserClaims(uid, { role });

      const db = getDatabase();
      await db.ref("auditLogs").push({
        action: "setRole",
        targetUid: uid,
        targetEmail: targetUser.email || "",
        newRole: role,
        performedBy: caller.uid,
        performedByRole: caller.role,
        timestamp: new Date().toISOString(),
      });

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
      const listResult = await getAuth().listUsers(1000);
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

      const targetUser = await getAuth().getUser(uid);
      if (targetUser.customClaims?.role === "owner") return res.status(403).send("Forbidden: cannot disable owner");

      await getAuth().updateUser(uid, { disabled });

      const db = getDatabase();
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

    const db = getDatabase();
    const uid = request.auth.uid;
    const token = await getAuth().getUser(uid);
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

const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const isIsoDateTime = (v) => typeof v === "string" && ISO_DATETIME_RE.test(v) && !Number.isNaN(Date.parse(v));
const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";
const kstDate = (iso) => new Date(Date.parse(iso) + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
const isHttpUrl = (v) => {
  try {
    return ["http:", "https:"].includes(new URL(v).protocol);
  } catch { return false; }
};

// 수정 요청은 승인 시 이벤트에 반영되므로 허용 필드만 형식을 확인해 저장한다. 형식이 맞지 않으면 null.
const sanitizeEditFormData = (formData) => {
  if (!formData || typeof formData !== "object" || Array.isArray(formData)) return null;
  if (formData.deleteRequest === true) return { deleteRequest: true };

  const { event_name, schedule, location, genre, event_url, time_start, time_entrance, time_end, etc } = formData;
  if (!isNonEmptyString(event_name) || !isNonEmptyString(location) || !isNonEmptyString(genre)) return null;
  if (!isIsoDateTime(schedule)) return null;

  const data = { event_name, schedule, location, genre };
  if (event_url != null) {
    if (typeof event_url !== "string" || (event_url !== "" && !isHttpUrl(event_url))) return null;
    data.event_url = event_url;
  }
  for (const [field, value] of Object.entries({ time_start, time_entrance, time_end })) {
    if (value == null) continue;
    // 관리자 비교표는 시각만 보여 주므로 날짜는 일정과 같아야 한다
    if (!isIsoDateTime(value) || kstDate(value) !== kstDate(schedule)) return null;
    data[field] = value;
  }
  if (etc != null) {
    if (typeof etc !== "string") return null;
    data.etc = etc;
  }
  return data;
};

exports.submitEditRequest = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) throw new Error("unauthenticated");
    const { eventId, eventYear, reason, formData, _snap } = request.data || {};
    if (!eventId || !eventYear || !reason || !formData)
      throw new Error("missing-required-fields");
    if (typeof eventId !== "string" || !/^row\d+$/.test(eventId)) throw new Error("invalid-event-id");
    if (!Number.isInteger(eventYear)) throw new Error("invalid-event-year");
    if (!isNonEmptyString(reason)) throw new Error("invalid-reason");
    const editData = sanitizeEditFormData(formData);
    if (!editData) throw new Error("invalid-form-data");

    const db = getDatabase();
    // 대상 이벤트가 실제로 있는지 확인하고, 이벤트명은 요청 값이 아닌 DB 값을 쓴다
    const eventSnap = await db.ref(`data_v3/${eventYear}/${eventId}`).once("value");
    if (!eventSnap.exists()) throw new Error("event-not-found");
    const eventName = String(eventSnap.val().event_name ?? "");

    const uid = request.auth.uid;
    const token = await getAuth().getUser(uid);
    const role = token.customClaims?.role;

    if (role !== "admin" && role !== "owner") {
      const allowed = await checkAndIncrementLimit(db, `editRequestLimits/${uid}`);
      if (!allowed) throw new Error("daily-limit-exceeded");
    }

    await db.ref("editRequests").push({
      ...editData,
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

const VIEW_IP_TTL_MS = 24 * 60 * 60 * 1000;

// 조회수 중복 방지용 IP 해시는 24시간만 필요하므로 매일 만료분 삭제
exports.cleanupViewIPs = onSchedule(
  {
    schedule: "0 4 * * *",
    timeZone: "Asia/Seoul",
    region: "asia-southeast1",
  },
  async () => {
    const db = getDatabase();
    const all = (await db.ref("viewIPs").get()).val() || {};
    const cutoff = Date.now() - VIEW_IP_TTL_MS;

    const updates = {};
    for (const [eventId, hashes] of Object.entries(all)) {
      for (const [hash, ts] of Object.entries(hashes || {})) {
        if (typeof ts !== "number" || ts < cutoff) updates[`${eventId}/${hash}`] = null;
      }
    }

    const paths = Object.keys(updates);
    for (let i = 0; i < paths.length; i += 1000) {
      const chunk = Object.fromEntries(paths.slice(i, i + 1000).map((p) => [p, null]));
      await db.ref("viewIPs").update(chunk);
    }

    console.log(`✅ viewIPs cleanup: removed ${paths.length}`);
  },
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

    // 솔트 없이 해시하면 IPv4 전수 대입으로 원래 IP 복원이 가능하므로 fail-closed
    const salt = process.env.VIEW_IP_SALT;
    if (!salt) {
      console.error("❌ VIEW_IP_SALT is not set; view not counted");
      return { counted: false };
    }

    const db = getDatabase();
    const eventSnap = await db.ref(`data_v3/${eventYear}/${eventId}`).once("value");
    if (!eventSnap.exists()) return { counted: false };

    const forwarded = request.rawRequest.headers["x-forwarded-for"];
    const ip =
      (forwarded ? forwarded.split(",").at(-1).trim() : null) ||
      request.rawRequest.socket?.remoteAddress ||
      "unknown";

    const hash = crypto
      .createHash("sha256")
      .update(salt + ip + eventId)
      .digest("hex")
      .slice(0, 16);

    const ipRef = db.ref(`viewIPs/${eventId}/${hash}`);
    const snap = await ipRef.once("value");

    const now = Date.now();
    if (snap.exists() && now - snap.val() < VIEW_IP_TTL_MS) return { counted: false };

    await db.ref(`data_v3/${eventYear}/${eventId}/views`)
      .transaction((current) => (current || 0) + 1);
    await ipRef.set(now);

    return { counted: true };
  }
);

// 회원 탈퇴·삭제 시 uid에 연결된 RTDB 데이터 정리 (공개 활동 페이지 포함)
const cleanupUserData = async (db, uid) => {
  const slug = (await db.ref(`users/${uid}/activitySlug`).get()).val();
  const slugRef = slug ? db.ref(`activitySlugs/${slug}`) : null;
  const slugOwned = slugRef && (await slugRef.get()).val() === uid;

  await Promise.all([
    db.ref(`reportLimits/${uid}`).remove(),
    db.ref(`editRequestLimits/${uid}`).remove(),
    db.ref(`likes/${uid}`).remove(),
    db.ref(`suspensions/${uid}`).remove(),
    db.ref(`users/${uid}`).remove(),
    ...(slugOwned ? [slugRef.remove()] : []),
  ]);
};

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
      decoded = await getAuth().verifyIdToken(idToken);
    } catch (error) {
      console.error("❌ verifyIdToken failed:", error);
      return res.status(403).send("Forbidden: invalid token");
    }

    const uid = decoded.uid;
    try {
      await getAuth().deleteUser(uid);
    } catch (error) {
      console.error("❌ Error deleting auth user in deleteSelf:", error);
      return res.status(500).send("Internal Server Error");
    }

    const db = getDatabase();
    try {
      await cleanupUserData(db, uid);
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

      const targetUser = await getAuth().getUser(uid);
      if (targetUser.customClaims?.role === "owner") return res.status(403).send("Forbidden: cannot delete owner");

      const db = getDatabase();
      await db.ref(`auditLogs`).push({
        action: "delete",
        targetUid: uid,
        targetEmail: targetUser.email || "",
        performedBy: caller.uid,
        performedByRole: caller.role,
        timestamp: new Date().toISOString(),
      });

      await getAuth().deleteUser(uid);

      await cleanupUserData(db, uid);

      console.log("✅ User deleted:", uid);
      return res.status(200).json({ ok: true, uid });
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      return res.status(500).send("Internal Server Error");
    }
  },
);

const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const detectImageType = (buf) => {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  return null;
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// admin 전용이지만 내부망 접근(SSRF) 최소 방어: https + 공개 호스트명만 허용
const assertPublicHttpsUrl = (raw) => {
  let u;
  try { u = new URL(raw); } catch { throw new HttpError(400, "Invalid sourceUrl"); }
  const host = u.hostname.toLowerCase();
  if (
    u.protocol !== "https:" ||
    u.username || u.password ||
    host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") ||
    /^[\d.]+$/.test(host) || host.includes(":") || host.startsWith("[")
  ) {
    throw new HttpError(400, "Invalid sourceUrl");
  }
  return u;
};

// 기존 표출 로직(Modal/EventSeoHelmet)과 동일하게 Twitter 이미지는 name=large로 받음
const toLargeTwitterUrl = (u) => {
  if (u.hostname !== "pbs.twimg.com") return u.toString();
  u.searchParams.set("name", "large");
  return u.toString();
};

const fetchSourceImage = async (sourceUrl) => {
  const url = toLargeTwitterUrl(assertPublicHttpsUrl(sourceUrl));
  let res;
  try {
    res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
  } catch (error) {
    console.error("❌ Source fetch error:", error);
    throw new HttpError(502, "Source fetch failed");
  }
  assertPublicHttpsUrl(res.url);
  if (!res.ok || !res.body) throw new HttpError(502, `Source fetch failed (${res.status})`);
  if (Number(res.headers.get("content-length") || 0) > MAX_IMAGE_BYTES) throw new HttpError(400, "Invalid image size");

  const chunks = [];
  let total = 0;
  for await (const chunk of res.body) {
    total += chunk.length;
    if (total > MAX_IMAGE_BYTES) throw new HttpError(400, "Invalid image size");
    chunks.push(chunk);
  }
  return { buf: Buffer.concat(chunks), fetchedUrl: url };
};

// 자사 Worker URL → R2 원본 키. 원본 이미지 경로만 허용 (썸네일·임의 키 차단)
const R2_ORIGINAL_KEY = /^event\/\d{4}\/row\d+\/image(_\d+)?\.(jpg|jpeg|png|webp|gif)$/;

const readR2Image = async (s3, sourceUrl) => {
  const key = sourceUrl.slice(ASSETS_BASE_URL.length + 1);
  if (!R2_ORIGINAL_KEY.test(key)) throw new HttpError(400, "Invalid sourceUrl");
  let obj;
  try {
    obj = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch (error) {
    if (error?.name === "NoSuchKey") throw new HttpError(404, "Source not found");
    throw error;
  }
  if (Number(obj.ContentLength || 0) > MAX_IMAGE_BYTES) throw new HttpError(400, "Invalid image size");
  return Buffer.from(await obj.Body.transformToByteArray());
};

// 목록용 썸네일: 가로 400px WebP. 키 규칙은 ankr-assets/scripts/generate-thumbs.mjs와 동일
// (event/2026/row1/image_2.jpg → event/2026/row1/image_2_thumb.webp)
const THUMB_WIDTH = 400;
const thumbKeyOf = (key) => key.replace(/\.\w+$/, "_thumb.webp");
const makeThumbnail = (buf) =>
  sharp(buf).rotate().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();

exports.uploadEventImage = onRequest(
  {
    timeoutSeconds: 60,
    memory: "512MiB", // sharp 썸네일 생성 (원본 최대 8MB)
    region: "asia-northeast3",
    secrets: [R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY],
  },
  async (req, res) => {
    setAdminCors(res, req);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    const caller = await verifyAdminOrOwnerToken(req, res);
    if (!caller) return;

    const accountId = R2_ACCOUNT_ID.value();
    const accessKeyId = R2_ACCESS_KEY_ID.value();
    const secretAccessKey = R2_SECRET_ACCESS_KEY.value();
    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.error("❌ R2 secrets missing");
      return res.status(500).send("Server misconfigured");
    }

    try {
      const { year, rowId, contentType, data, sourceUrl } = req.body || {};
      const maxYear = new Date(Date.now() + 9 * 60 * 60 * 1000).getUTCFullYear() + 1;
      if (!Number.isInteger(year) || year < 2012 || year > maxYear) return res.status(400).send("Invalid year");
      if (typeof rowId !== "string" || !/^row\d+$/.test(rowId)) return res.status(400).send("Invalid rowId");

      const s3 = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });

      // 파일 업로드(base64 data) 또는 URL 복사(sourceUrl) 중 정확히 하나
      let buf;
      let fetchedUrl = null;
      if (typeof sourceUrl === "string" && sourceUrl.startsWith(`${ASSETS_BASE_URL}/`) && data == null) {
        // 자사 Worker URL(이벤트 복제) — Worker는 Referer 없으면 403이므로 R2에서 직접 읽음
        buf = await readR2Image(s3, sourceUrl);
        fetchedUrl = sourceUrl;
      } else if (typeof sourceUrl === "string" && sourceUrl && data == null) {
        ({ buf, fetchedUrl } = await fetchSourceImage(sourceUrl));
      } else if (typeof data === "string" && data && sourceUrl == null) {
        if (!IMAGE_TYPES[contentType]) return res.status(400).send("Unsupported image type");
        buf = Buffer.from(data, "base64");
      } else {
        return res.status(400).send("Provide either data or sourceUrl");
      }

      if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) return res.status(400).send("Invalid image size");
      const detected = detectImageType(buf);
      if (!detected) return res.status(400).send("Not an image");

      const ext = IMAGE_TYPES[detected];
      const prefix = `event/${year}/${rowId}/`;

      // 기존 버전 확인: image.ext → 1, image_N.ext → N (Worker 캐시가 immutable이라 덮어쓰지 않음)
      const listed = await s3.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefix }));
      const maxVersion = (listed.Contents || []).reduce((m, obj) => {
        const match = obj.Key.slice(prefix.length).match(/^image(?:_(\d+))?\.\w+$/);
        if (!match) return m;
        return Math.max(m, match[1] ? parseInt(match[1], 10) : 1);
      }, 0);
      const fileName = maxVersion === 0 ? `image.${ext}` : `image_${maxVersion + 1}.${ext}`;
      const key = `${prefix}${fileName}`;

      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buf,
        ContentType: detected,
      }));

      // 썸네일 실패는 업로드 실패로 보지 않음 — 프론트가 썸네일 404 시 원본으로 폴백
      try {
        await s3.send(new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: thumbKeyOf(key),
          Body: await makeThumbnail(buf),
          ContentType: "image/webp",
        }));
      } catch (error) {
        console.error("⚠️ Thumbnail generation failed:", key, error);
      }

      await getDatabase().ref("auditLogs").push({
        action: "uploadEventImage",
        key,
        size: buf.length,
        ...(fetchedUrl && { sourceUrl: fetchedUrl }),
        performedBy: caller.uid,
        performedByRole: caller.role,
        timestamp: new Date().toISOString(),
      });

      console.log("✅ Event image uploaded:", key);
      return res.status(200).json({ ok: true, url: `${ASSETS_BASE_URL}/${key}` });
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.status).send(error.message);
      console.error("❌ Error uploading event image:", error);
      return res.status(500).send("Internal Server Error");
    }
  },
);
