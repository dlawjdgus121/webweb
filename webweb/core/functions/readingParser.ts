export function parsePageAndReview(input: string, note?: string) {
  // 1) 정확 패턴: "<n>쪽(까지) 읽었을 때 <감상>"
  const exact = /(?:^|[\s,])(\d{1,5})\s*(?:쪽|페이지|p\.?|pg\.?)(?:\s*까지)?\s*읽었을\s*때[\s\.\,\-\:\;\)\]]*(.+)$/i;
  let m = input.match(exact);
  if (m) {
    const page = Number(m[1]) || 1;
    let content = (m[2] || "");
    content = cleanupContent(content);
    if (!content) content = `${page}쪽까지 읽음`;
    return { page, content };
  }

  // 2) 느슨한 패턴: "<n>쪽(까지) (읽었어/읽음/읽었습니다) .? <감상>"
  const loose = /(?:^|[\s,])(\d{1,5})\s*(?:쪽|페이지|p\.?|pg\.?)(?:\s*까지)?\s*(?:읽(?:었(?:어|습니다)?|음))?[\s\.\,\-\:\;\)\]]*(.+)$/i;
  m = input.match(loose);
  if (m) {
    const page = Number(m[1]) || 1;
    let content = (m[2] || "");
    content = cleanupContent(content);
    if (!content) content = `${page}쪽까지 읽음`;
    return { page, content };
  }

  // 3) 아무 것도 못 잡으면 note 우선, 없으면 원문
  return { page: 1, content: cleanupContent(note?.trim() || input.trim() || "1쪽까지 읽음") };
}

function cleanupContent(text: string) {
  return text
    // "나의 감상은", "감상은", "내 생각은" → 잘라내기
    .replace(/^(나의\s*)?감상은\s*/i, "")
    .replace(/^내\s*생각은\s*/i, "")

    // 맨 앞 구두점/공백 정리
    .replace(/^[\s\.\,\-\:\;\~\|\)\]]+/, "")

    // 공백 압축
    .replace(/\s{2,}/g, " ")
    .trim();
}

