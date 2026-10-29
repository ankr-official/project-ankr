// 탈퇴(Auth 삭제)된 계정의 잔여 데이터 정리 스크립트.
// users/{uid}, activitySlugs/{slug} 중 Auth에 없는 uid를 가리키는 항목을 찾는다.
// 기본은 목록만 출력하고 DB를 수정하지 않는다. --apply 를 붙이면 삭제한다.
// 실행: node functions/scripts/cleanup-orphan-users.js [--apply]
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getDatabase } = require("firebase-admin/database");
const serviceAccount = require("../service-account-key.json");

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://ankr-db-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const APPLY = process.argv.includes("--apply");

// getUsers는 한 번에 최대 100개까지 조회 가능
async function findMissingUids(uids) {
  const missing = new Set();
  for (let i = 0; i < uids.length; i += 100) {
    const batch = uids.slice(i, i + 100).map((uid) => ({ uid }));
    const { notFound } = await getAuth().getUsers(batch);
    notFound.forEach(({ uid }) => missing.add(uid));
  }
  return missing;
}

async function main() {
  const db = getDatabase();

  const users = (await db.ref("users").get()).val() || {};
  const slugs = (await db.ref("activitySlugs").get()).val() || {};

  const uids = [...new Set([...Object.keys(users), ...Object.values(slugs)])];
  const missing = await findMissingUids(uids);

  const orphanUsers = Object.keys(users).filter((uid) => missing.has(uid));
  const orphanSlugs = Object.entries(slugs).filter(([, uid]) => missing.has(uid));

  console.log(`users 전체 ${Object.keys(users).length}건 중 탈퇴 계정 잔여: ${orphanUsers.length}건`);
  orphanUsers.forEach((uid) => {
    const { nickname = "-", activitySlug = "-", historyPublic = false } = users[uid] || {};
    console.log(`  users/${uid}  nickname=${nickname}  slug=${activitySlug}  public=${historyPublic}`);
  });

  console.log(`activitySlugs 전체 ${Object.keys(slugs).length}건 중 탈퇴 계정 잔여: ${orphanSlugs.length}건`);
  orphanSlugs.forEach(([slug, uid]) => console.log(`  activitySlugs/${slug} → ${uid}`));

  if (!APPLY) {
    console.log("\n(dry-run) 삭제하려면 --apply 를 붙여 다시 실행하세요.");
    return;
  }

  const updates = {};
  orphanUsers.forEach((uid) => { updates[`users/${uid}`] = null; });
  orphanSlugs.forEach(([slug]) => { updates[`activitySlugs/${slug}`] = null; });
  if (Object.keys(updates).length) await db.ref().update(updates);
  console.log(`\n✅ ${Object.keys(updates).length}개 경로 삭제 완료`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
