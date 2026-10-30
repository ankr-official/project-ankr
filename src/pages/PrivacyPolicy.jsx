import { Link } from "react-router";

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

const linkClass =
  "text-indigo-600 dark:text-indigo-400 active:underline mouse:hover:underline break-all";

const codeClass = "text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded-sm";

const ExtLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
    {children}
  </a>
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
            시행일: 2026년 3월 16일 &nbsp;·&nbsp; 최종 수정일: 2026년 10월 30일
          </p>
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            ANKR.KR(이하 "서비스")는 「개인정보 보호법」 및 관련 법령에 따라
            이용자의 개인정보를 처리합니다. 본 방침은 서비스가 처리하는
            개인정보의 항목, 수집 방법, 이용 목적, 보유 기간, 위탁 및 국외 이전,
            이용자의 권리와 그 행사 방법을 안내합니다.
          </p>
        </div>

        {/* Section 1 */}
        <Section number="1" title="수집 항목">
          <p>
            서비스는 행사 정보 열람만으로는 회원 정보를 수집하지 않으며, Google
            로그인 및 각 기능 이용 시 아래 정보를 처리합니다. 아래 항목은 모두
            「개인정보 보호법」 제15조 제1항에 따라 별도 동의 없이 처리하며,
            동의를 받아 처리하는 항목은 없습니다.
          </p>
          <Table
            headers={["구분", "수집 항목", "필수 여부", "처리 근거"]}
            rows={[
              [
                "계정 식별",
                "Firebase UID, Google 계정 이메일 주소 (Google 계정 이름·프로필 사진 URL도 Firebase Authentication에 자동 저장되나 서비스에서는 사용하지 않음)",
                "필수(로그인 시)",
                "서비스 이용계약 이행 (법 제15조 제1항 제4호)",
              ],
              [
                "행사 제보 · 정보 수정 요청",
                "제보·요청 내용(행사명, 장소, 일정, 장르, SNS 링크, 기타 메모, 수정 사유 등), 제출 일시, 제출자 이메일(이메일이 없으면 UID)",
                "필수(해당 기능 이용 시)",
                "서비스 이용계약 이행 (법 제15조 제1항 제4호)",
              ],
              [
                "관심 행사 · 다녀온 행사",
                "등록한 행사 ID, 등록 유형(관심·참석), 등록 일시",
                "선택(해당 기능 이용 시)",
                "서비스 이용계약 이행 (법 제15조 제1항 제4호)",
              ],
              [
                "내 활동 페이지",
                "닉네임(표시 이름), 활동 주소(고유 URL 핸들), 공개/비공개 설정, 이벤트별 공개 여부, 공개 활동 데이터(행사 ID·참여 유형)",
                "선택(해당 기능 이용 시)",
                "서비스 이용계약 이행 (법 제15조 제1항 제4호)",
              ],
              [
                "조회수 중복 방지",
                "접속 IP 주소를 비밀값과 함께 일방향 암호화(해시)한 값, 열람 시각",
                "자동 수집(행사 상세 열람 시)",
                "정당한 이익 (법 제15조 제1항 제6호)",
              ],
              [
                "접속 기록",
                "접속 IP 주소, 접속 일시, 요청 기록 (Google Cloud·Cloudflare·GitHub 인프라가 자동 기록)",
                "자동 수집",
                "정당한 이익 (법 제15조 제1항 제6호)",
              ],
              [
                "서비스 이용 통계 (Google Analytics)",
                "방문 페이지, 체류 시간, 유입 경로, 브라우저·기기 정보, 익명화된 IP 주소",
                "자동 수집",
                "정당한 이익 (법 제15조 제1항 제6호)",
              ],
            ]}
          />
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            ※ 조회수 중복 방지 정보는 원래 IP 주소를 저장하지 않으며, 같은 행사의
            조회수가 24시간 안에 중복 집계되지 않도록 하는 데에만 사용합니다.
            로그인 여부와 연결하지 않습니다.
          </p>
        </Section>

        {/* Section 2 */}
        <Section number="2" title="수집 방법">
          <ul className="list-disc list-inside space-y-1">
            <li>
              <span className="font-medium">Google OAuth 2.0 인증:</span>{" "}
              이용자가 "Google로 로그인" 버튼을 누르면 Google이 발급한 ID 토큰을
              통해 Firebase Authentication이 계정 정보를 받습니다.
            </li>
            <li>
              <span className="font-medium">이용자 직접 입력:</span> 행사 제보·정보
              수정 요청 양식, 내 활동 페이지 설정에 이용자가 입력한 정보가
              Firebase Realtime Database에 저장됩니다.
            </li>
            <li>
              <span className="font-medium">자동 수집:</span> 서비스를 제공하는
              인프라(Google Cloud, Cloudflare, GitHub)가 서버 운영·보안을 위해
              접속 기록(IP, 일시 등)을 자동으로 남기며, 행사 상세를 열람하면
              조회수 중복 방지 정보가 저장됩니다.
            </li>
          </ul>
        </Section>

        {/* Section 3 */}
        <Section number="3" title="쿠키 및 브라우저 저장소">
          <p>
            서비스는 이용자 브라우저에 아래 정보를 저장합니다. 이 정보는 이용자
            기기에 저장되며, 로그인 정보는 서비스 요청 시 인증을 위해 서버로
            전송됩니다.
          </p>
          <Table
            headers={["저장 위치", "저장 내용", "목적"]}
            rows={[
              [
                "IndexedDB (Firebase Authentication)",
                "로그인 인증 토큰, 계정 기본 정보(UID, 이메일)",
                "로그인 상태 유지 및 서버 요청 시 본인 확인",
              ],
              [
                "localStorage",
                <>
                  화면 테마(<code className={codeClass}>ankr_theme</code>), 보기
                  방식(<code className={codeClass}>ankr_view_mode</code>), 장르
                  필터(<code className={codeClass}>ankr_selected_genres</code>),
                  닫은 안내 배너(<code className={codeClass}>dismissedBanners</code>)
                </>,
                "화면 설정 기억 (서버로 전송하지 않음)",
              ],
              [
                "쿠키 (Google Analytics)",
                <>
                  <code className={codeClass}>_ga</code>,{" "}
                  <code className={codeClass}>_ga_*</code> 등 방문자 구분값
                </>,
                "이용 통계 분석 (광고 타겟팅·Google Signals 미사용)",
              ],
            ]}
          />
          <p className="mt-3">
            <span className="font-medium">거부 방법:</span> 브라우저 설정에서
            쿠키 및 사이트 데이터 저장을 차단하거나 삭제할 수 있습니다. 로그인
            정보 저장을 차단하면 로그인이 필요한 기능(제보, 관심 행사, 내 활동
            페이지 등)을 이용할 수 없고, 화면 설정은 방문할 때마다 초기화됩니다.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Chrome: 설정 → 개인정보 보호 및 보안 → 인터넷 사용 기록 삭제(쿠키 및
              기타 사이트 데이터) / 서드 파티 쿠키
            </li>
            <li>
              Edge: 설정 → 쿠키 및 사이트 권한 → 쿠키 및 사이트 데이터 관리 및
              삭제
            </li>
            <li>
              Safari(iPhone): 설정 → 앱 → Safari → 방문 기록 및 웹 사이트 데이터
              지우기 / 모든 쿠키 차단
            </li>
            <li>
              Google Analytics만 거부:{" "}
              <ExtLink href="https://tools.google.com/dlpage/gaoptout">
                Google Analytics 차단 브라우저 부가기능
              </ExtLink>
            </li>
          </ul>
          <p>
            서비스는 이용자의 행태정보를 맞춤형 광고에 이용하지 않으며, 제3자가
            서비스에서 행태정보를 수집하도록 허용하지 않습니다.
          </p>
        </Section>

        {/* Section 4 */}
        <Section number="4" title="이용 목적">
          <Table
            headers={["이용 목적", "처리 항목"]}
            rows={[
              ["회원 식별 및 로그인 상태 유지", "Firebase UID, 이메일, 로그인 인증 토큰"],
              [
                "행사 제보·정보 수정 요청 접수 및 운영자 검토",
                "제보·요청 내용, 제출 일시, 제출자 이메일/UID",
              ],
              [
                "새 제보·수정 요청 알림 메일을 운영자에게 발송",
                "제보·요청 내용, 제출자 이메일/UID",
              ],
              [
                "관심 행사 · 다녀온 행사 등록·조회·삭제",
                "Firebase UID, 행사 ID, 등록 유형, 등록 일시",
              ],
              [
                "내 활동 페이지 생성 및 공개 공유",
                "닉네임, 활동 주소, 공개/비공개 설정, 이벤트별 공개 여부, 공개 활동 데이터",
              ],
              [
                "일일 제보·요청 횟수 제한 (남용 방지)",
                "Firebase UID, 제출 일시",
              ],
              ["행사 조회수 중복 집계 방지", "IP 해시값, 열람 시각"],
              [
                "운영자 조치 기록 (권한 변경·이용 제한·계정 삭제)",
                "대상 UID, 대상 이메일, 조치 일시, 조치한 운영자",
              ],
              ["서비스 운영·보안·장애 대응", "접속 IP, 접속 일시, 요청 기록"],
              [
                "서비스 이용 현황 파악 및 통계 분석",
                "방문 페이지, 체류 시간, 유입 경로, 브라우저·기기 정보 (Google Analytics)",
              ],
            ]}
          />
        </Section>

        {/* Section 5 */}
        <Section number="5" title="보유 기간 및 파기">
          <p>
            서비스는 보유 기간이 지나거나 처리 목적을 달성한 개인정보를 지체 없이
            파기합니다. 파기 사유가 생긴 개인정보는 회원 탈퇴 처리, 매일·매월
            실행되는 자동 정리 작업 또는 운영자의 직접 삭제로 파기하며, 다른
            곳에 옮겨 보관하지 않습니다. 정기 백업에는 공개 행사 정보만 포함되고
            회원 개인정보는 포함되지 않습니다. 전자적 파일은 복구할 수 없는
            방법으로 삭제하며, 종이
            문서로는 개인정보를 보관하지 않습니다. 항목별 보유 기간은 아래와
            같습니다.
          </p>
          <Table
            headers={["항목", "보유 기간", "근거"]}
            rows={[
              ["Firebase UID, 이메일", "회원 탈퇴 또는 계정 삭제 시까지", "서비스 운영"],
              [
                "제보·수정 요청 내용 및 제출자 이메일",
                "운영자가 승인 또는 거부 처리할 때까지 (처리 즉시 삭제)",
                "서비스 운영",
              ],
              [
                "승인되어 게시된 행사 정보",
                "서비스 운영 기간 동안 (제출자 정보는 게시하지 않음)",
                "서비스 운영",
              ],
              [
                "운영자 알림 메일",
                "처리 완료 후 30일 이내 운영자 메일함에서 삭제",
                "서비스 운영",
              ],
              [
                "관심 행사 · 다녀온 행사 데이터",
                "이용자 직접 삭제 또는 회원 탈퇴 시까지",
                "서비스 운영",
              ],
              [
                "닉네임, 활동 주소, 공개 활동 데이터",
                "이용자 직접 삭제, 활동 페이지 삭제 또는 회원 탈퇴 시까지",
                "서비스 운영",
              ],
              [
                "일일 제보·요청 횟수 기록",
                "날짜와 횟수만 저장, 다음 날 초기화, 회원 탈퇴 시 삭제",
                "남용 방지",
              ],
              [
                "조회수 중복 방지 정보 (IP 해시값)",
                "열람 후 24시간 경과 시 만료, 매일 1회 일괄 삭제",
                "중복 집계 방지",
              ],
              [
                "운영자 조치 기록",
                "조치일로부터 1년 (매월 일괄 삭제)",
                "분쟁 대응",
              ],
              [
                "이용 제한 기록 (사유, 일시)",
                "이용 제한 해제 또는 계정 삭제 시까지",
                "서비스 운영",
              ],
              [
                "인프라 접속 기록",
                "각 수탁자 정책에 따름",
                "보안·장애 대응",
              ],
            ]}
          />
        </Section>

        {/* Section 6 */}
        <Section number="6" title="제3자 제공">
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
          <p>
            내 활동 페이지를 공개로 설정하면 닉네임, 활동 주소, 공개로 선택한
            행사 기록은 누구나 볼 수 있습니다.
          </p>
        </Section>

        {/* Section 7 */}
        <Section number="7" title="처리 위탁">
          <p>
            서비스는 원활한 운영을 위해 아래와 같이 개인정보 처리 업무를
            위탁합니다.
          </p>
          <Table
            headers={["수탁자", "위탁 업무"]}
            rows={[
              ["Google LLC (Firebase Authentication)", "회원 인증 및 계정 관리"],
              [
                "Google LLC (Firebase Realtime Database)",
                "회원·제보·관심 행사·활동 페이지 데이터 저장",
              ],
              [
                "Google LLC (Cloud Functions, Google Cloud Platform)",
                "제보 접수, 조회수 집계, 회원 탈퇴 처리 등 서버 기능 실행 및 접속 기록",
              ],
              ["Google LLC (Gmail)", "운영자 알림 메일 발송·보관"],
              ["Google LLC (Google Analytics)", "서비스 이용 통계 수집·분석"],
              ["Cloudflare, Inc.", "행사 포스터 이미지 저장·전송"],
              ["GitHub, Inc. (GitHub Pages)", "웹사이트 호스팅"],
            ]}
          />
          <p className="mt-3">
            수탁자는 위탁 계약 종료 시 또는 각 수탁자의 정책에 따라 개인정보를
            파기합니다.
          </p>
        </Section>

        {/* Section 8 */}
        <Section number="8" title="국외 이전">
          <p>
            서비스는 해외 클라우드 서비스를 이용하므로, 아래와 같이 개인정보가
            국외로 이전(보관·처리 위탁)됩니다. 이는 「개인정보 보호법」 제28조의8
            제1항 제3호에 따라 처리 위탁·보관에 관한 사항을 본 방침으로 공개하여
            이전하는 경우에 해당합니다. 이전은 서비스를 이용할 때마다
            정보통신망을 통해 수시로 이루어집니다.
          </p>
          <Table
            headers={[
              "이전받는 자 (연락처)",
              "이전 국가",
              "이전 항목",
              "이용 목적",
              "보유 기간",
            ]}
            rows={[
              [
                <>
                  Google LLC
                  <br />
                  <ExtLink href="https://support.google.com/policies/contact/general_privacy_form">
                    개인정보 문의 양식
                  </ExtLink>
                </>,
                "싱가포르 (데이터베이스, 서버 기능), 대한민국 (일부 서버 기능), 미국 (인증, 메일, 이용 통계)",
                "Firebase UID, 이메일, 제보·요청 내용, 관심·다녀온 행사 데이터, 닉네임, 활동 주소, 공개 활동 데이터, IP 해시값, 운영자 조치 기록, 접속 기록, 이용 통계 정보",
                "인증, 데이터 저장, 서버 기능 실행, 알림 메일, 이용 통계",
                "제5조의 보유 기간",
              ],
              [
                <>
                  Cloudflare, Inc.
                  <br />
                  <ExtLink href="mailto:privacyquestions@cloudflare.com">
                    privacyquestions@cloudflare.com
                  </ExtLink>
                </>,
                "미국 및 Cloudflare 데이터센터 운영 국가",
                "이미지 요청 시 접속 IP 주소, 요청 일시, 브라우저 정보",
                "행사 포스터 이미지 전송",
                "Cloudflare 정책에 따름",
              ],
              [
                <>
                  GitHub, Inc.
                  <br />
                  <ExtLink href="https://support.github.com/contact/privacy">
                    개인정보 문의
                  </ExtLink>
                </>,
                "미국",
                "웹사이트 접속 시 접속 IP 주소, 요청 일시, 브라우저 정보",
                "웹사이트 호스팅",
                "GitHub 정책에 따름",
              ],
            ]}
          />
          <p className="mt-3">
            <span className="font-medium">거부 방법 및 효과:</span> 국외 이전을
            원하지 않으면 회원 탈퇴(설정 → 회원 탈퇴) 후 서비스 이용을 중단하여
            거부할 수 있습니다. 서비스는 위 해외 인프라를 통해서만 제공되므로,
            거부할 경우 서비스를 이용할 수 없습니다.
          </p>
          <p>
            각 사의 개인정보 처리에 관한 내용은{" "}
            <ExtLink href="https://policies.google.com/privacy">
              Google 개인정보처리방침
            </ExtLink>
            ,{" "}
            <ExtLink href="https://www.cloudflare.com/privacypolicy/">
              Cloudflare 개인정보처리방침
            </ExtLink>
            ,{" "}
            <ExtLink href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement">
              GitHub 개인정보처리방침
            </ExtLink>
            에서 확인할 수 있습니다.
          </p>
        </Section>

        {/* Section 9 */}
        <Section number="9" title="제보 내용에 포함된 타인의 개인정보">
          <p>
            제보의 기타 메모, 정보 수정 요청의 사유처럼 자유롭게 입력하는 항목에는
            이용자 본인 또는 타인의 개인정보(연락처, 계좌번호, 주소 등)가 포함될 수
            있습니다. 운영자는 제보·요청을 검토하는 과정에서 그 내용을 열람합니다.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              이러한 개인정보는 행사 정보 게시에 사용하지 않으며, 행사 정보로
              게시되는 항목에도 포함하지 않습니다.
            </li>
            <li>
              운영자가 이를 확인하면 지체 없이 데이터베이스와 운영자 알림
              메일에서 해당 제보·요청을 삭제합니다.
            </li>
            <li>
              본인의 정보가 포함되었다고 생각되는 경우 아래 연락처로 삭제를 요청할
              수 있습니다.
            </li>
          </ul>
        </Section>

        {/* Section 10 */}
        <Section number="10" title="안전성 확보 조치">
          <ul className="list-disc list-inside space-y-1">
            <li>
              접근 권한 관리: 데이터베이스 보안 규칙으로 이용자는 본인 데이터만
              읽고 쓸 수 있으며, 제보·수정 요청·운영자 조치 기록은 운영자 권한이
              서버에서 확인된 계정만 열람할 수 있습니다.
            </li>
            <li>
              전송 구간 암호화: 모든 통신은 HTTPS로 암호화됩니다.
            </li>
            <li>
              최소 저장: 조회수 중복 방지에는 원래 IP 주소 대신 비밀값을 더해
              일방향 암호화한 값만 저장합니다.
            </li>
            <li>
              운영자 조치 기록: 권한 변경, 이용 제한, 계정 삭제 내역을 기록합니다.
            </li>
          </ul>
        </Section>

        {/* Section 11 */}
        <Section number="11" title="이용자의 권리와 행사 방법">
          <p>
            이용자는 언제든지 자신의 개인정보 열람, 정정, 삭제, 처리정지를 요청할
            수 있습니다.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              서비스 내 설정에서 닉네임 삭제, 활동 페이지 삭제, 행사 기록 삭제,
              회원 탈퇴를 직접 할 수 있습니다. 회원 탈퇴 시 계정과 관련 데이터는
              즉시 삭제됩니다.
            </li>
            <li>
              그 밖의 요청은 아래 이메일로 보내 주시면 요청자가 본인인지 확인한
              뒤 10일 이내에 처리 결과를 안내합니다.
            </li>
            <li>
              법정대리인이나 위임을 받은 사람을 통해서도 권리를 행사할 수
              있으며, 이 경우 위임장을 함께 보내 주셔야 합니다.
            </li>
          </ul>
        </Section>

        {/* Section 12 */}
        <Section number="12" title="만 14세 미만 아동의 개인정보">
          <p>
            서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를
            수집하지 않습니다. 만 14세 미만 아동의 개인정보가 수집된 사실을
            확인하면 지체 없이 삭제합니다.
          </p>
        </Section>

        {/* Section 13 */}
        <Section number="13" title="권익침해 구제 방법">
          <p>
            개인정보 침해로 인한 구제를 받기 위해 아래 기관에 분쟁 해결이나
            상담을 신청할 수 있습니다.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              개인정보침해신고센터: (국번 없이) 118 ·{" "}
              <ExtLink href="https://privacy.kisa.or.kr">privacy.kisa.or.kr</ExtLink>
            </li>
            <li>
              개인정보분쟁조정위원회: 1833-6972 ·{" "}
              <ExtLink href="https://www.kopico.go.kr">www.kopico.go.kr</ExtLink>
            </li>
            <li>경찰청: (국번 없이) 182</li>
          </ul>
        </Section>

        {/* Section 14 */}
        <Section number="14" title="처리방침의 변경">
          <p>
            본 방침의 내용이 바뀌는 경우 시행 7일 전부터 서비스 내 공지사항 또는
            본 페이지를 통해 안내합니다. 이용자 권리에 중요한 변경이 있는 경우
            시행 30일 전부터 안내합니다.
          </p>
        </Section>

        {/* Contact */}
        <section className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            개인정보 보호책임자 및 문의
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            개인정보 처리에 관한 문의, 열람·정정·삭제·처리정지 요청, 불만 처리는
            아래로 연락 주시기 바랍니다.
          </p>
          <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-800 dark:text-gray-200">
              개인정보 보호책임자:{" "}
            </span>
            ANKR 운영자
          </p>
          <p className="text-sm mt-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">
              이메일:{" "}
            </span>
            <a href="mailto:ankr.web.official@gmail.com" className={linkClass}>
              ankr.web.official@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
