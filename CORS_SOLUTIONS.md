# GitHub PagesでのCORS問題の解決策

## 問題

GitHub Pagesは静的サイトホスティングなので、クライアントサイドから外部APIを直接呼ぶとCORS制限に引っかかる可能性があります。

## 解決策（優先順位順）

### ✅ 解決策1: CORS対応の無料APIを使う（最もシンプル）

多くの為替APIは実際にCORS対応しています：

#### おすすめAPI:

**1. Frankfurter API（完全無料、CORS対応）**
- URL: `https://api.frankfurter.app/latest?from=USD&to=JPY`
- 特徴:
  - 完全無料、利用制限なし
  - CORS完全対応
  - 欧州中央銀行(ECB)のデータ
  - レート履歴も取得可能
- 欠点: アジア通貨が少ない（JPY, CNYはあり、KRWなし）

```javascript
// 使用例
async function getExchangeRate(from, to) {
  const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
  const data = await response.json();
  return data.rates[to];
}
```

**2. ExchangeRate-API（月1,500リクエスト無料、CORS対応）**
- URL: `https://api.exchangerate-api.com/v4/latest/USD`
- 特徴:
  - 無料枠あり（月1,500リクエスト）
  - CORS対応
  - 150以上の通貨対応
  - APIキー不要（無料版）

**3. Open Exchange Rates（月1,000リクエスト無料、CORS対応）**
- URL: `https://openexchangerates.org/api/latest.json?app_id=YOUR_KEY`
- 特徴:
  - APIキー必要（無料登録）
  - CORS対応
  - 信頼性が高い

### ✅ 解決策2: GitHub Actionsで定期的にデータ取得（推奨）

既存のGitHub Actionsワークフローを活用し、サーバーサイドでデータを取得してJSONファイルとしてコミット。

#### メリット:
- CORS問題が完全に解消
- オフラインでも最新のキャッシュが使える
- API呼び出し回数を大幅に削減
- 完全無料で実装可能

#### 実装方法:

**1. ワークフローファイルを作成**

`.github/workflows/update-exchange-rates.yml`:

```yaml
name: Update Exchange Rates

on:
  schedule:
    # 毎日日本時間9:00（UTC 0:00）に実行
    - cron: '0 0 * * *'
  workflow_dispatch: # 手動実行も可能

jobs:
  update-rates:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Fetch Exchange Rates
        run: |
          curl -s https://api.frankfurter.app/latest?from=JPY \
            > public/data/exchange-rates.json

          # タイムスタンプを追加
          echo "{\"lastUpdated\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
            > public/data/last-updated.json

      - name: Commit and Push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add public/data/*.json
          git diff --quiet && git diff --staged --quiet || \
            (git commit -m "Update exchange rates [skip ci]" && git push)
```

**2. データディレクトリを作成**

```bash
mkdir -p public/data
echo '{}' > public/data/exchange-rates.json
```

**3. アプリ側でJSONを読み込む**

```javascript
// src/components/CurrencyConverter.svelte
async function loadExchangeRates() {
  try {
    // GitHub Actionsで更新されたJSONを読み込む
    const response = await fetch('/money-toolbox/data/exchange-rates.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load exchange rates:', error);
    // フォールバック: 直接APIを呼ぶ（CORSエラーの可能性あり）
    const response = await fetch('https://api.frankfurter.app/latest?from=JPY');
    return await response.json();
  }
}
```

### ✅ 解決策3: Cloudflare Workers（より高度な要件向け）

無料でサーバーレス関数を使ってプロキシを構築。

#### メリット:
- リアルタイムのデータ取得が可能
- 複数のAPIを組み合わせ可能
- キャッシュ制御が柔軟

#### デメリット:
- 追加のサービス登録が必要
- 設定がやや複雑

#### 実装例:

```javascript
// Cloudflare Workers
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const from = url.searchParams.get('from') || 'JPY';
    const to = url.searchParams.get('to') || 'USD';

    // 外部APIを呼び出す
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`
    );
    const data = await response.json();

    // CORS対応のレスポンスを返す
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'max-age=3600' // 1時間キャッシュ
      }
    });
  }
};
```

### ✅ 解決策4: Service Workerでキャッシュ + フォールバック

既存のPWA Service Workerを拡張してキャッシュ戦略を実装。

vite.config.jsに追加:

```javascript
workbox: {
  runtimeCaching: [
    // ... 既存の設定 ...
    {
      // 為替APIのキャッシュ
      urlPattern: /^https:\/\/api\.frankfurter\.app\/.*/i,
      handler: 'NetworkFirst', // ネットワーク優先、失敗時はキャッシュ
      options: {
        cacheName: 'exchange-rates-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 // 24時間
        },
        networkTimeoutSeconds: 5 // 5秒でタイムアウト
      }
    }
  ]
}
```

## 推奨アプローチ

### 為替レート計算機の場合:

**方法A: GitHub Actions（最も確実）**
- 毎日1回更新で十分
- 完全無料
- CORS問題なし
- オフライン対応

**方法B: CORS対応API + Service Workerキャッシュ**
- リアルタイム性が必要な場合
- Frankfurter APIを使用（無料・CORS対応）
- Service Workerでキャッシュしてオフライン対応

### その他のAPI利用が必要な機能の場合:

- **電気代比較**: GitHub Actionsで料金データを定期更新（料金改定は稀）
- **携帯料金比較**: GitHub Actionsで料金データを定期更新（料金改定は稀）
- **株価・投資データ**: CORS対応の無料API（Alpha Vantage等）+ Service Workerキャッシュ

## まとめ

1. **まずはCORS対応APIを探す**（Frankfurterなど多くが対応済み）
2. **頻繁に更新不要ならGitHub Actions**で定期更新（推奨）
3. **リアルタイム性が必要ならService Worker**でキャッシュ
4. **どうしても解決しない場合のみCloudflare Workers**等を検討

Money Toolboxの用途では、**GitHub Actions + CORS対応API + Service Workerキャッシュ**の組み合わせが最適です。
