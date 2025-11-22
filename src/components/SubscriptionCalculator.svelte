<script>
  let subscriptions = [
    { name: '', price: '', period: 'monthly', usagePerMonth: '' }
  ];

  function addSubscription() {
    subscriptions = [...subscriptions, { name: '', price: '', period: 'monthly', usagePerMonth: '' }];
  }

  function removeSubscription(index) {
    subscriptions = subscriptions.filter((_, i) => i !== index);
  }

  $: totalMonthly = subscriptions.reduce((sum, sub) => {
    const price = parseFloat(sub.price) || 0;
    const monthly = sub.period === 'yearly' ? price / 12 : price;
    return sum + monthly;
  }, 0);

  $: totalYearly = totalMonthly * 12;

  $: subsWithCalc = subscriptions.map(sub => {
    const price = parseFloat(sub.price) || 0;
    const usage = parseFloat(sub.usagePerMonth) || 0;
    const monthlyPrice = sub.period === 'yearly' ? price / 12 : price;
    const yearlyPrice = sub.period === 'yearly' ? price : price * 12;
    const costPerUse = usage > 0 ? monthlyPrice / usage : 0;

    return {
      ...sub,
      monthlyPrice,
      yearlyPrice,
      costPerUse
    };
  });

  $: hasValidSubs = subscriptions.some(sub => parseFloat(sub.price) > 0);
</script>

<div class="calculator">
  <h2>📱 サブスク管理・比較</h2>
  <p class="description">複数のサブスクリプションの総コストと実質単価を計算</p>

  <div class="card">
    <div class="subs-header">
      <h3>📝 サブスクリプション一覧</h3>
      <button class="add-button" on:click={addSubscription}>+ 追加</button>
    </div>

    {#each subscriptions as sub, index}
      <div class="sub-item">
        <div class="sub-header">
          <span class="sub-number">#{index + 1}</span>
          {#if subscriptions.length > 1}
            <button class="remove-button" on:click={() => removeSubscription(index)}>×</button>
          {/if}
        </div>

        <div class="input-group">
          <label for="name-{index}">サービス名<span class="optional">（任意）</span></label>
          <input
            id="name-{index}"
            type="text"
            bind:value={sub.name}
            placeholder="例: Netflix"
          />
        </div>

        <div class="input-row">
          <div class="input-group" style="flex: 2;">
            <label for="price-{index}">料金（円）</label>
            <input
              id="price-{index}"
              type="number"
              bind:value={sub.price}
              placeholder="例: 1000"
              min="0"
              step="1"
            />
          </div>

          <div class="input-group" style="flex: 1;">
            <label for="period-{index}">期間</label>
            <select id="period-{index}" bind:value={sub.period}>
              <option value="monthly">月額</option>
              <option value="yearly">年額</option>
            </select>
          </div>
        </div>

        <div class="input-group">
          <label for="usage-{index}">月間利用回数<span class="optional">（任意）</span></label>
          <input
            id="usage-{index}"
            type="number"
            bind:value={sub.usagePerMonth}
            placeholder="例: 10"
            min="0"
            step="1"
          />
          <small>入力すると1回あたりの実質単価を計算</small>
        </div>
      </div>
    {/each}
  </div>

  {#if hasValidSubs}
    <div class="result">
      <div class="result-label">月間総コスト</div>
      <div class="result-value">¥{Math.round(totalMonthly).toLocaleString()}</div>
      <div class="result-detail">年間 ¥{Math.round(totalYearly).toLocaleString()}</div>
    </div>

    <div class="breakdown card">
      <h3>📊 サブスク別詳細</h3>
      {#each subsWithCalc as sub, index}
        {@const price = parseFloat(sub.price) || 0}
        {#if price > 0}
          <div class="sub-breakdown">
            <div class="sub-breakdown-header">
              <span class="sub-name">{sub.name || `サブスク${index + 1}`}</span>
              <span class="sub-monthly">¥{Math.round(sub.monthlyPrice).toLocaleString()}/月</span>
            </div>
            <div class="sub-breakdown-details">
              <div class="detail-item">
                <span>年間コスト</span>
                <span>¥{Math.round(sub.yearlyPrice).toLocaleString()}</span>
              </div>
              {#if sub.costPerUse > 0}
                <div class="detail-item">
                  <span>1回あたり単価</span>
                  <span>¥{Math.round(sub.costPerUse).toLocaleString()}</span>
                </div>
                <div class="detail-item usage">
                  <span>月間利用回数</span>
                  <span>{sub.usagePerMonth}回</span>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      {/each}
    </div>

    <div class="info-box card">
      <h3>💡 節約のヒント</h3>
      <ul>
        <li>年額プランは通常10-20%お得です</li>
        <li>使用頻度が低いサブスクは解約を検討しましょう</li>
        <li>家族や友人とシェアできるプランがあるか確認しましょう</li>
        <li>無料トライアルの自動更新に注意しましょう</li>
      </ul>
    </div>
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

  .optional {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: normal;
  }

  small {
    display: block;
    margin-top: 0.25rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .subs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .add-button {
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .add-button:hover {
    opacity: 0.9;
  }

  .sub-item {
    padding: 1.5rem;
    margin-bottom: 1rem;
    background: var(--background);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .sub-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .sub-number {
    font-weight: 600;
    color: var(--primary-color);
  }

  .remove-button {
    width: 28px;
    height: 28px;
    padding: 0;
    background: var(--error);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .remove-button:hover {
    opacity: 0.9;
  }

  .input-row {
    display: flex;
    gap: 1rem;
  }

  .breakdown {
    margin-top: 1rem;
  }

  .sub-breakdown {
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  .sub-breakdown:last-child {
    border-bottom: none;
  }

  .sub-breakdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .sub-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .sub-monthly {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--primary-color);
  }

  .sub-breakdown-details {
    padding-left: 1rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    font-size: 0.95rem;
    color: var(--text-secondary);
  }

  .detail-item.usage {
    color: var(--text-primary);
    font-weight: 500;
  }

  .info-box {
    margin-top: 1rem;
    background: var(--background);
  }

  .info-box ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .info-box li {
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
    line-height: 1.6;
  }

  .info-box li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--success);
    font-weight: 600;
  }
</style>
