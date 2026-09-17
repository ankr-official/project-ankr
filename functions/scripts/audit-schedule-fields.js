// 읽기 전용 감사 스크립트: data_v3/{year}/{eventId}의 schedule 필드가
// 리터럴 UTC 자정("...T00:00:00.000Z")이 아닌 레코드를 찾아 보고한다.
// DB에는 아무것도 쓰지 않는다. 실행: node functions/scripts/audit-schedule-fields.js
const admin = require("firebase-admin");
const serviceAccount = require("../service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ankr-db-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const toKSTDate = (d) => new Date(new Date(d).getTime() + 9 * 60 * 60 * 1000);
const kstDateStr = (d) => toKSTDate(d).toISOString().slice(0, 10);
const isLiteralUtcMidnight = (s) => /T00:00:00\.000Z$/.test(String(s));

async function main() {
  const db = admin.database();

  const yearsSnap = await db.ref("data_v3/meta/years").get();
  const years = yearsSnap.exists() ? yearsSnap.val() : [];
  if (!Array.isArray(years) || years.length === 0) {
    console.log("data_v3/meta/years 에서 연도 목록을 찾지 못했습니다.");
    process.exit(1);
  }

  console.log(`대상 연도: ${years.join(", ")}`);

  const mismatches = [];
  let total = 0;

  for (const year of years) {
    const snap = await db.ref(`data_v3/${year}`).get();
    if (!snap.exists()) continue;
    const yearData = snap.val();

    for (const [eventId, event] of Object.entries(yearData)) {
      if (!event || typeof event !== "object" || !event.schedule) continue;
      total += 1;

      if (isLiteralUtcMidnight(event.schedule)) continue;

      const rawSlice = String(event.schedule).slice(0, 10);
      const corrected = kstDateStr(event.schedule);

      mismatches.push({
        year,
        eventId,
        event_name: event.event_name,
        schedule: event.schedule,
        rawSlice,
        corrected,
        wouldShift: rawSlice !== corrected,
      });
    }
  }

  console.log(`\n총 검사한 이벤트 수: ${total}`);
  console.log(`리터럴 UTC 자정이 아닌 레코드 수: ${mismatches.length}`);

  const shifting = mismatches.filter((m) => m.wouldShift);
  console.log(`그중 실제로 그리드 배치일이 하루 이상 밀리는 레코드 수: ${shifting.length}\n`);

  if (mismatches.length > 0) {
    console.log("상세 목록:");
    for (const m of mismatches) {
      console.log(
        `- [${m.year}] ${m.eventId} "${m.event_name}" schedule=${m.schedule} ` +
          `rawSlice=${m.rawSlice} kstCorrected=${m.corrected}` +
          (m.wouldShift ? "  ← 하루 밀림" : "  (밀림 없음)"),
      );
    }
  } else {
    console.log("모든 이벤트의 schedule 값이 리터럴 UTC 자정 규약을 따르고 있습니다.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("감사 스크립트 실행 중 오류:", err);
  process.exit(1);
});
