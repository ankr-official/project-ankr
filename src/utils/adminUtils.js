import { isoToTime, isoToLocal, toArray } from "./eventFormUtils";

export const formatScheduleDisplay = (dateStr) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    });
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
