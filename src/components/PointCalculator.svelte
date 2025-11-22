<script>
  let purchaseAmount = '';
  let pointRate = '';
  let pointLimit = '';

  $: amount = parseFloat(purchaseAmount) || 0;
  $: rate = parseFloat(pointRate) || 0;
  $: limit = parseFloat(pointLimit) || 0;

  // 基本計算
  $: pointsUnlimited = amount * rate / 100;
  $: actualPoints = limit > 0 ? Math.min(pointsUnlimited, limit) : pointsUnlimited;
  $: effectivePrice = amount - actualPoints;
  $: effectiveDiscountRate = amount > 0 ? (actualPoints / amount * 100) : 0;

  // 上限到達判定
  $: isLimitReached = limit > 0 && pointsUnlimited > limit;

  // 満額還元される最大購入金額
  $: maxPurchaseForFullPoints = limit > 0 && rate > 0 ? limit / rate * 100 : 0;
</script>

<div class="calculator">
  <h2>💳 ポイント還元計算</h2>
  <p class="description">購入金額とポイント還元率から実質価格を計算</p>

  <div class="card">
    <div class="input-group">
      <label for="purchaseAmount">購入金額（円）</label>
      <input
        id="purchaseAmount"
        type="number"
        bind:value={purchaseAmount}
        placeholder="例: 50000"
        min="0"
        step="1"
      />
    </div>

    <div class="input-group">
      <label for="pointRate">ポイント還元率（%）</label>
      <input
        id="pointRate"
        type="number"
        bind:value={pointRate}
        placeholder="例: 1.5"
        min="0"
        step="0.1"
      />
    </div>

    <div class="input-group">
      <label for="pointLimit">ポイント還元上限（円）</label>
      <input
        id="pointLimit"
        type="number"
        bind:value={pointLimit}
        placeholder="例: 500（なしの場合は0）"
        min="0"
        step="1"
      />
      <small>上限がない場合は0または空欄にしてください</small>
    </div>
  </div>

  {#if amount > 0 && rate > 0}
    <div class="breakdown card">
      <h3>💡 計算結果</h3>
      <div class="breakdown-item">
        <span>購入金額</span>
        <span>¥{amount.toLocaleString()}</span>
      </div>
      <div class="breakdown-item points">
        <span>獲得ポイント</span>
        <span>
          {actualPoints.toLocaleString()}pt
          {#if isLimitReached}
            <span class="limit-badge">上限適用</span>
          {/if}
        </span>
      </div>
      <div class="breakdown-item">
        <span>実質割引率</span>
        <span>{effectiveDiscountRate.toFixed(2)}%</span>
      </div>
    </div>

    <div class="result">
      <div class="result-label">実質価格</div>
      <div class="result-value">¥{Math.round(effectivePrice).toLocaleString()}</div>
      <div class="result-detail">
        {actualPoints.toLocaleString()}ポイント還元
      </div>
    </div>

    {#if limit > 0 && rate > 0}
      <div class="info-box card">
        <h3>💰 ポイント還元の上限情報</h3>
        <p>
          この還元率（{rate}%）で上限（{limit.toLocaleString()}円）まで貯まる購入金額：
          <strong>¥{Math.round(maxPurchaseForFullPoints).toLocaleString()}</strong>
        </p>
        <p class="info-note">
          それ以上購入してもポイントは増えません
        </p>
        {#if amount > maxPurchaseForFullPoints}
          <p class="warning">
            ⚠️ 現在の購入金額は上限を超えています
          </p>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .calculator {
    max-width: 600px;
    margin: 0 auto;
  }

  h2 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }

  .description {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  small {
    display: block;
    margin-top: 0.25rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .breakdown {
    margin-bottom: 1rem;
  }

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    font-size: 1rem;
  }

  .breakdown-item.points {
    color: var(--success);
    font-weight: 600;
  }

  .limit-badge {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    margin-left: 0.5rem;
  }

  .info-box {
    margin-top: 1rem;
    background: var(--background);
  }

  .info-box p {
    margin-bottom: 0.75rem;
    line-height: 1.6;
  }

  .info-box p:last-child {
    margin-bottom: 0;
  }

  .info-box strong {
    color: var(--primary-color);
    font-size: 1.1rem;
  }

  .info-note {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .warning {
    color: var(--error);
    font-weight: 600;
  }
</style>
