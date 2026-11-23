import { isoToTime, isoToLocal, toArray, isValidUrl } from "./eventFormUtils";
import { toKSTDate } from "./dateUtils";

const EDITABLE_FIELDS = ["event_name", "schedule", "location", "genre", "event_url", "time_start", "time_entrance", "time_end", "etc"];
const DATETIME_FIELDS = ["schedule", "time_start", "time_entrance", "time_end"];
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/** 수정요청에서 이벤트에 반영할 필드만 골라 반환합니다. 형식이 맞지 않으면 null을 반환합니다. */
export const pickEditableFields = (request) => {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    const value = request[field];
    if (value == null) continue;
    if (typeof value !== "string") return null;
    if (DATETIME_FIELDS.includes(field) && (!ISO_DATETIME_RE.test(value) || isNaN(new Date(value)))) return null;
    // 비교표는 시각만 보여 주므로 날짜는 일정과 같아야 한다
    if (field.startsWith("time_") && isoToLocal(value) !== isoToLocal(request.schedule)) return null;
    if (field === "event_url" && value !== "" && !isValidUrl(value)) return null;
    data[field] = value;
  }
  return data;
};

export const formatScheduleDisplay = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const kst = toKSTDate(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const pad = (n) => String(n).padStart(2, "0");
    return `${kst.getUTCFullYear()}. ${pad(kst.getUTCMonth() + 1)}. ${pad(kst.getUTCDate())}. ${days[kst.getUTCDay()]}`;
  } catch {
    return dateStr;
  }
};

/** 원본 이벤트와 수정요청 간의 diff 배열을 반환합니다. */
export const getChangedFields = (original, request) => {
  if (!original) return null;
  const diffs = [];

  if ((original.event_name ?? "") !== (request.event_name ?? ""))
    diffs.push({ label: "이벤트명", from: original.event_name, to: request.event_name });

  if (isoToLocal(original.schedule) !== isoToLocal(request.schedule))
    diffs.push({
      label: "날짜",
      from: formatScheduleDisplay(original.schedule),
      to: formatScheduleDisplay(request.schedule),
    });

  if ((original.location ?? "") !== (request.location ?? ""))
    diffs.push({ label: "장소", from: original.location || "-", to: request.location || "-" });

  const origGenre = toArray(original.genre).slice().sort().join(",");
  const reqGenre = toArray(request.genre).slice().sort().join(",");
  if (origGenre !== reqGenre)
    diffs.push({
      label: "장르",
      from: toArray(original.genre),
      to: toArray(request.genre),
      isGenre: true,
    });

  const timeFields = [
    ["time_start", "시작"],
    ["time_entrance", "입장"],
    ["time_end", "종료"],
  ];
  timeFields.forEach(([field, timeLabel]) => {
    const origT = isoToTime(original[field]);
    const reqT = isoToTime(request[field]);
    if (origT !== reqT)
      diffs.push({ label: `시간(${timeLabel})`, from: origT || "-", to: reqT || "-" });
  });

  if ((original.event_url ?? "") !== (request.event_url ?? ""))
    diffs.push({
      label: "SNS",
      from: original.event_url || "-",
      to: request.event_url || "-",
      isUrl: true,
    });

  if ((original.etc ?? "") !== (request.etc ?? ""))
    diffs.push({ label: "기타", from: original.etc || "-", to: request.etc || "-" });

  return diffs;
};
