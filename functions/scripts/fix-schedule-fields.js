// data_v3/{year}/{eventId}의 schedule 필드 중 리터럴 UTC 자정("...T00:00:00.000Z")이
// 아닌 레코드를 kstDateStr(schedule) + "T00:00:00.000Z"로 정규화한다.
//
// 기본 동작은 dry-run(미리보기만, DB 쓰기 없음)이다.
// 실제로 DB에 쓰려면 --apply 플래그를 명시적으로 줘야 한다.
// 실행 전 자동으로 data_v3 전체를 로컬 JSON 파일로 백업한다.
//
// 사용법:
//   node functions/scripts/fix-schedule-fields.js            (dry-run, 백업만 하고 미리보기)
//   node functions/scripts/fix-schedule-fields.js --apply    (실제로 DB에 반영)
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const serviceAccount = require("../service-account-key.json");

const APPLY = process.argv.includes("--apply");

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

  // 1) 백업: data_v3 전체를 로컬 JSON으로 저장
  const backupDir = path.resolve(__dirname, "../backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(
    backupDir,
    `data_v3-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );

  const fullSnap = await db.ref("data_v3").get();
  fs.writeFileSync(backupPath, JSON.stringify(fullSnap.val(), null, 2));
  console.log(`백업 완료: ${backupPath}\n`);

  // 2) 대상 레코드 수집
  const updates = {}; // { "data_v3/{year}/{eventId}/schedule": correctedIso }
  const planned = [];

  for (const year of years) {
    const snap = await db.ref(`data_v3/${year}`).get();
    if (!snap.exists()) continue;
    const yearData = snap.val();

    for (const [eventId, event] of Object.entries(yearData)) {
      if (!event || typeof event !== "object" || !event.schedule) continue;
      if (isLiteralUtcMidnight(event.schedule)) continue;

      const corrected = `${kstDateStr(event.schedule)}T00:00:00.000Z`;
      planned.push({
        year,
        eventId,
        event_name: event.event_name,
        before: event.schedule,
        after: corrected,
      });
      updates[`data_v3/${year}/${eventId}/schedule`] = corrected;
    }
  }

  console.log(`정규화 대상: ${planned.length}건\n`);
  for (const p of planned.slice(0, 20)) {
    console.log(`- [${p.year}] ${p.eventId} "${p.event_name}": ${p.before} → ${p.after}`);
  }
  if (planned.length > 20) {
    console.log(`  ... 외 ${planned.length - 20}건 (전체 목록은 백업 파일과 대조해 확인 가능)`);
  }

  if (!APPLY) {
    console.log("\n[dry-run] DB에 아무것도 쓰지 않았습니다. 실제 반영하려면 --apply 옵션으로 다시 실행하세요.");
    process.exit(0);
  }

  console.log("\n--apply 지정됨: 실제로 DB에 반영합니다...");
  await db.ref().update(updates);
  console.log(`완료: ${planned.length}건의 schedule 필드를 정규화했습니다.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("스크립트 실행 중 오류:", err);
  process.exit(1);
});
