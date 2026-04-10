import { Link } from "react-router-dom";

const Section = ({ number, title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
      제{number}조 {title}
    </h2>
    <div className="text-gray-700 dark:text-gray-300 space-y-2 text-sm leading-relaxed">
      {children}
    </div>
  </section>
);

const Table = ({ headers, rows }) => (
  <div className="overflow-x-auto mt-3">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-800">
          {headers.map((h) => (
            <th
              key={h}
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-800/50">
            {row.map((cell, j) => (
              <td
                key={j}
                className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-700 dark:text-gray-300 align-top"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-left">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/"
            className="text-sm text-indigo-600 dark:text-indigo-400 active:underline mouse:hover:underline mb-6 inline-block"
          >
            ← 홈으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            개인정보처리방침
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            시행일: 2026년 3월 16일 &nbsp;·&nbsp; 최종 수정일: 2026년 4월 10일
          </p>
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            ANKR.KR(이하 "서비스")는 이용자의 개인정보를 중요하게 여기며,
            「개인정보 보호법」 및 관련 법령을 준수합니다. 본 방침은 서비스가
            수집하는 개인정보의 항목, 수집 방법, 이용 목적, 보유 기간, 제3자
            제공 및 국외 이전에 관한 사항을 안내합니다.
          </p>
        </div>

        {/* Section 1 */}
        <Section number="1" title="수집 항목">
          <p>
            서비스는 Google OAuth 로그인 시 아래 정보를 수집하며, 이용자는
            언제든지 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.
          </p>
          <Table
            headers={["구분", "수집 항목", "필수 여부"]}
            rows={[
              ["계정 식별", "Firebase UID, Google 계정 이메일 주소", "필수"],
              [
                "서비스 이용 기록",
                "행사 제보 내용(행사명, 장소, 일정, 장르, SNS 링크 등), 제보 일시",
                "필수(제보 기능 이용 시)",
              ],
              [
                "관심 행사 · 다녀온 행사",
                "등록한 행사 ID, 등록 유형(관심·참석), 등록 일시",
                "선택(관심/다녀온 행사 기능 이용 시)",
              ],
              [
                "접속 기록",
                "접속 IP 주소, 접속 일시, 서비스 이용 기록 (Firebase·Google Cloud 인프라 자동 수집)",
                "자동 수집",
              ],
              [
                "서비스 이용 통계 (Google Analytics)",
                "방문 페이지, 체류 시간, 유입 경로, 브라우저·기기 정보, 익명화된 IP 주소",
                "자동 수집",
              ],
            ]}
          />
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            ※ 서비스는 비로그인 이용자의 행사 열람 기록을 별도로 식별·저장하지
            않습니다.
          </p>
        </Section>

        {/* Section 2 */}
        <Section number="2" title="수집 방법">
          <ul className="list-disc list-inside space-y-1">
            <li>
              <span className="font-medium">Google OAuth 2.0 인증:</span>{" "}
              이용자가 "Google로 로그인" 버튼을 클릭할 때 Google이 발급한 ID
              토큰을 통해 Firebase Authentication이 계정 정보를 수집합니다.
            </li>
            <li>
              <span className="font-medium">이용자 직접 입력:</span> 행사 제보
              양식 작성 시 이용자가 직접 입력한 정보가 Firebase Realtime
              Database에 저장됩니다.
            </li>
            <li>
              <span className="font-medium">자동 수집:</span> Firebase 및 Google
              Cloud Platform 인프라가 서버 운영·보안을 위해 접속 로그(IP,
              타임스탬프 등)를 자동으로 기록합니다.
            </li>
            <li>
              <span className="font-medium">쿠키(Cookie):</span> 서비스는 로그인
              상태 유지를 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저
              설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 로그인이 필요한
              일부 기능 이용이 제한될 수 있습니다.
            </li>
            <li>
              <span className="font-medium">Google Analytics 자동 수집:</span>{" "}
              서비스는 이용 현황 파악을 위해 Google Analytics를 사용합니다.
              Google Analytics는 쿠키(<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">_ga</code>,{" "}
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">_gid</code> 등)를 통해
              방문 페이지, 체류 시간, 유입 경로, 브라우저·기기 정보를 자동으로
              수집합니다. IP 주소는 수집 시 익명화 처리되며, 광고 타겟팅 및
              Google Signals에는 사용되지 않습니다.
            </li>
          </ul>
        </Section>

        {/* Section 3 */}
        <Section number="3" title="이용 목적">
          <Table
            headers={["이용 목적", "수집 항목"]}
            rows={[
              ["회원 식별 및 로그인 상태 유지", "Firebase UID, 이메일"],
              [
                "행사 제보 접수 및 관리자 검토·승인",
                "제보 내용, 제보 일시, 이메일/UID",
              ],
              [
                "관심 행사 · 다녀온 행사 등록·조회·삭제",
                "Firebase UID, 행사 ID, 등록 유형, 등록 일시",
              ],
              [
                "일일 제보 횟수 제한 적용 (남용 방지)",
                "Firebase UID, 제보 일시",
              ],
              ["서비스 운영·보안·장애 대응", "접속 IP, 접속 일시, 이용 기록"],
              [
                "서비스 이용 현황 파악 및 통계 분석",
                "방문 페이지, 체류 시간, 유입 경로, 브라우저·기기 정보 (Google Analytics)",
              ],
            ]}
          />
        </Section>

        {/* Section 4 */}
        <Section number="4" title="보유 기간">
          <p>
            서비스는 이용 목적 달성 후 지체 없이 개인정보를 파기합니다.(전자적
            파일 형태의 개인정보는 복구 불가능한 방법으로 삭제합니다. 종이에
            출력된 개인정보는 분쇄하거나 소각합니다.) 단, 아래 경우에는 해당
            기간 동안 보관합니다.
          </p>
          <Table
            headers={["항목", "보유 기간", "근거"]}
            rows={[
              ["Firebase UID, 이메일", "회원 탈퇴 또는 계정 삭제 요청 시까지", "서비스 운영"],
              [
                "행사 제보 내용 (승인 전)",
                "관리자 승인 또는 거부 처리 시까지",
                "서비스 운영",
              ],
              [
                "행사 제보 내용 (승인 후)",
                "서비스 운영 기간 동안",
                "서비스 운영",
              ],
              [
                "관심 행사 · 다녀온 행사 데이터",
                "이용자 직접 삭제 또는 회원 탈퇴 시까지",
                "서비스 운영",
              ],
              [
                "일일 제보 횟수 기록",
                "해당일 종료 후 자동 초기화",
                "남용 방지",
              ],
              [
                "접속 로그 (Firebase·Google Cloud)",
                "Google Cloud 정책에 따름 (최대 30일~1년)",
                "보안·장애 대응",
              ],
            ]}
          />
        </Section>

        {/* Section 5 */}
        <Section number="5" title="제3자 제공">
          <p>
            서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
            다만, 아래의 경우는 예외로 합니다.
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>
              법령의 규정에 따르거나 수사 목적으로 법령에 정해진 절차와 방법에
              따라 수사기관이 요청하는 경우
            </li>
          </ul>
        </Section>

        {/* Section 6 */}
        <Section number="6" title="처리 위탁">
          <p>
            서비스는 원활한 운영을 위해 아래와 같이 개인정보 처리를 위탁합니다.
          </p>
          <Table
            headers={["수탁자", "위탁 업무", "보유 기간"]}
            rows={[
              [
                "Google LLC (Firebase Authentication)",
                "회원 인증 및 계정 관리",
                "위탁 계약 종료 시",
              ],
              [
                "Google LLC (Firebase Realtime Database)",
                "행사 제보 데이터 저장·관리",
                "위탁 계약 종료 시",
              ],
              [
                "Google LLC (Google Cloud Platform)",
                "서버 인프라 운영, 접속 로그 수집",
                "위탁 계약 종료 시",
              ],
              [
                "Google LLC (Cloud Functions)",
                "이벤트 트리거 처리 및 관리자 알림 이메일 발송",
                "위탁 계약 종료 시",
              ],
              [
                "Google LLC (Google Analytics)",
                "서비스 이용 통계 수집·분석",
                "위탁 계약 종료 시",
              ],
            ]}
          />
        </Section>

        {/* Section 7 */}
        <Section number="7" title="국외 이전">
          <p>
            서비스는 Google LLC의 클라우드 인프라를 활용하므로, 이용자의
            개인정보가 대한민국 외부로 이전될 수 있습니다.
          </p>
          <Table
            headers={[
              "이전 받는 자",
              "국가",
              "이전 항목",
              "이전 목적",
              "보호 조치",
            ]}
            rows={[
              [
                "Google LLC",
                "미국 및 Google 데이터센터 운영 국가",
                "Firebase UID, 이메일, 제보 내용, 접속 로그",
                "인증, 데이터 저장, 서버 운영, 알림 발송",
                "EU 표준 계약 조항(SCC) 준용, Google 개인정보처리방침 적용",
              ],
            ]}
          />
          <p className="mt-3">
            Google LLC의 개인정보 처리에 관한 상세 내용은{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 active:underline mouse:hover:underline"
            >
              Google 개인정보처리방침
            </a>
            을 참고하시기 바랍니다.
          </p>
        </Section>

        {/* Contact */}
        <section className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            개인정보 관련 문의
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            개인정보 처리에 관한 문의, 열람·정정·삭제·처리정지 요청은 아래로
            연락주시기 바랍니다.
          </p>
          <p className="text-sm mt-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">
              운영자:{" "}
            </span>
            ANKR
          </p>
          <p className="text-sm mt-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">
              이메일:{" "}
            </span>
            <a
              href="mailto:ankr.web.official@gmail.com"
              className="text-indigo-600 dark:text-indigo-400 active:underline mouse:hover:underline"
            >
              ankr.web.official@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
