import { writable } from 'svelte/store';

const STORAGE_KEY = 'money-toolbox-recent-tabs';
const MAX_HISTORY = 5;

function createHistoryStore() {
  // LocalStorageから履歴を読み込み
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  const initial = stored ? JSON.parse(stored) : [];

  const { subscribe, set, update } = writable(initial);

  return {
    subscribe,
    addTab: (tabId) => {
      update(history => {
        // 既存の履歴から同じタブを削除
        const filtered = history.filter(id => id !== tabId);
        // 最新のタブを先頭に追加
        const newHistory = [tabId, ...filtered].slice(0, MAX_HISTORY);

        // LocalStorageに保存
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        }

        return newHistory;
      });
    },
    clear: () => {
      set([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };
}

export const recentTabs = createHistoryStore();
