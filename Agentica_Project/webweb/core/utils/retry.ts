// core/utils/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 5,
  delay = 2000
): Promise<T> {
  let attempt = 0;
  let lastError: any;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      lastError = err;
      if (attempt >= retries) break;

     // 수정: 에러 상태코드 확인
      const status = err?.response?.status;
      let wait = delay * Math.pow(2, attempt - 1); // 기본 exponential backoff

     if (status === 429) {
       // Rate limit → 대기시간을 더 늘려줌
       wait *= 2;
        console.warn(
         `⏳ [429 Too Many Requests] ${attempt}/${retries}회 시도 실패. ${wait}ms 대기 후 재시도...`
        );
      } else {
        console.warn(
         `⚠️ [${status ?? "Unknown"}] 실패 (${attempt}/${retries}), ${wait}ms 후 재시도...`,
         err?.message || err
       );
     }

     await new Promise((res) => setTimeout(res, wait));
    }
  }

  throw new Error(
    `❌ 모든 재시도(${retries}) 실패: ${lastError?.message || lastError}`
  );
}
