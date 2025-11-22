/**
 * URLクエリパラメータを取得
 */
export function getQueryParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

/**
 * URLクエリパラメータを更新（履歴に追加せず）
 */
export function setQueryParams(params) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location);
  const searchParams = new URLSearchParams();

  // 既存のパラメータをクリアして新しいパラメータを設定
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.set(key, value);
    }
  });

  url.search = searchParams.toString();
  window.history.replaceState({}, '', url);
}

/**
 * 特定のクエリパラメータを更新
 */
export function updateQueryParam(key, value) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location);

  if (value !== null && value !== undefined && value !== '') {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }

  window.history.replaceState({}, '', url);
}

/**
 * JSON文字列をbase64エンコード
 */
export function encodeData(data) {
  try {
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error('Failed to encode data:', e);
    return null;
  }
}

/**
 * base64エンコードされた文字列をデコード
 */
export function decodeData(encoded) {
  try {
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode data:', e);
    return null;
  }
}
