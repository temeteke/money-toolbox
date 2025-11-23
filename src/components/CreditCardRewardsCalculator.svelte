<script>
  let purchaseAmount = '';
  let cards = [
    { name: '', rewardRate: '', annualFee: '', pointValue: 1 },
    { name: '', rewardRate: '', annualFee: '', pointValue: 1 }
  ];

  // プリセット
  const presets = [
    { name: '楽天カード', rewardRate: 1.0, annualFee: 0, pointValue: 1 },
    { name: '楽天ゴールドカード', rewardRate: 1.0, annualFee: 2200, pointValue: 1 },
    { name: 'PayPayカード', rewardRate: 1.0, annualFee: 0, pointValue: 1 },
    { name: 'dカード', rewardRate: 1.0, annualFee: 0, pointValue: 1 },
    { name: 'dカードGOLD', rewardRate: 1.0, annualFee: 11000, pointValue: 1 },
    { name: '三井住友カード(NL)', rewardRate: 0.5, annualFee: 0, pointValue: 1 },
    { name: 'JCB CARD W', rewardRate: 1.0, annualFee: 0, pointValue: 1 }
  ];

  $: amount = parseFloat(purchaseAmount) || 0;
  $: validCards = cards.filter(card =>
    card.rewardRate !== '' &&
    parseFloat(card.rewardRate) > 0
  );

  // 各カードの計算結果
  $: cardResults = validCards.map(card => {
    const rate = parseFloat(card.rewardRate) || 0;
    const fee = parseFloat(card.annualFee) || 0;
    const pointVal = parseFloat(card.pointValue) || 1;

    // 獲得ポイント（円換算）
    const pointsEarned = amount * rate / 100 * pointVal;

    // 実質還元額（年間）
    const netReward = pointsEarned - fee;

    // 実質還元率
    const effectiveRate = amount > 0 ? (netReward / amount * 100) : 0;

    // 年会費の元を取るために必要な購入額
    const breakEven = rate > 0 && fee > 0 ? (fee / (rate / 100 * pointVal)) : 0;

    return {
      name: card.name || 'カード',
      rate,
      fee,
      pointVal,
      pointsEarned,
      netReward,
      effectiveRate,
      breakEven
    };
  });

  // 最もお得なカードを特定
  $: bestCard = cardResults.reduce((best, card) =>
    !best || card.netReward > best.netReward ? card : best
  , null);

  function addCard() {
    cards = [...cards, { name: '', rewardRate: '', annualFee: '', pointValue: 1 }];
  }

  function removeCard(index) {
    if (cards.length > 2) {
      cards = cards.filter((_, i) => i !== index);
    }
  }

  function applyPreset(index, preset) {
    cards[index] = { ...preset };
    cards = cards; // trigger reactivity
  }
</script>

<div class="calculator">
  <h2>💳 クレジットカード還元率比較</h2>
  <p class="description">複数のカードを比較して最もお得な支払い方法を見つける</p>

  <div class="card">
    <div class="input-group">
      <label for="purchaseAmount">年間利用額（円）</label>
      <input
        id="purchaseAmount"
        type="number"
        bind:value={purchaseAmount}
        placeholder="例: 1200000"
        min="0"
        step="10000"
      />
      <small>年間でどのくらいこのカードで支払うかを入力してください</small>
    </div>
  </div>

  <div class="cards-section">
    <h3>💳 カード情報</h3>
    {#each cards as card, index}
      <div class="card card-input">
        <div class="card-header">
          <span class="card-number">カード {index + 1}</span>
          {#if cards.length > 2}
            <button class="remove-btn" on:click={() => removeCard(index)}>✕</button>
          {/if}
        </div>

        <div class="preset-select">
          <label>プリセット（任意）</label>
          <select on:change={(e) => e.target.value && applyPreset(index, presets[e.target.value])}>
            <option value="">カスタム入力</option>
            {#each presets as preset, pIndex}
              <option value={pIndex}>{preset.name}</option>
            {/each}
          </select>
        </div>

        <div class="input-group">
          <label>カード名（任意）</label>
          <input
            type="text"
            bind:value={card.name}
            placeholder="例: 楽天カード"
          />
        </div>

        <div class="input-row">
          <div class="input-group">
            <label>還元率（%）</label>
            <input
              type="number"
              bind:value={card.rewardRate}
              placeholder="例: 1.0"
              min="0"
              step="0.1"
            />
          </div>

          <div class="input-group">
            <label>年会費（円）</label>
            <input
              type="number"
              bind:value={card.annualFee}
              placeholder="例: 0"
              min="0"
              step="100"
            />
          </div>
        </div>

        <div class="input-group">
          <label>ポイント価値（1pt=?円）</label>
          <input
            type="number"
            bind:value={card.pointValue}
            placeholder="例: 1"
            min="0"
            step="0.1"
          />
          <small>通常は1ptあたり1円相当。マイル等の場合は調整してください</small>
        </div>
      </div>
    {/each}

    <button class="add-card-btn" on:click={addCard}>
      ＋ カードを追加
    </button>
  </div>

  {#if amount > 0 && cardResults.length > 0}
    <div class="comparison card">
      <h3>📊 比較結果</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>カード名</th>
              <th>還元率</th>
              <th>年会費</th>
              <th>獲得ポイント</th>
              <th>実質還元額</th>
              <th>実質還元率</th>
            </tr>
          </thead>
          <tbody>
            {#each cardResults as result}
              <tr class:best={result === bestCard}>
                <td class="card-name">
                  {result.name}
                  {#if result === bestCard}
                    <span class="best-badge">最もお得</span>
                  {/if}
                </td>
                <td>{result.rate}%</td>
                <td>¥{result.fee.toLocaleString()}</td>
                <td>¥{Math.round(result.pointsEarned).toLocaleString()}</td>
                <td class:negative={result.netReward < 0}>
                  ¥{Math.round(result.netReward).toLocaleString()}
                </td>
                <td class:negative={result.effectiveRate < 0}>
                  {result.effectiveRate.toFixed(2)}%
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    {#if bestCard}
      <div class="result">
        <div class="result-label">最もお得なカード</div>
        <div class="result-value">{bestCard.name}</div>
        <div class="result-detail">
          年間 ¥{Math.round(bestCard.netReward).toLocaleString()} お得（実質還元率 {bestCard.effectiveRate.toFixed(2)}%）
        </div>
      </div>
    {/if}

    <div class="info-box card">
      <h3>💡 年会費の損益分岐点</h3>
      {#each cardResults.filter(r => r.fee > 0) as result}
        <p>
          <strong>{result.name}</strong>:
          年間 <strong>¥{Math.round(result.breakEven).toLocaleString()}</strong> 以上の利用で年会費の元が取れます
          {#if amount >= result.breakEven}
            <span class="success">✓ 達成</span>
          {:else}
            <span class="warning">⚠ 未達成（¥{Math.round(result.breakEven - amount).toLocaleString()} 不足）</span>
          {/if}
        </p>
      {/each}
      {#if cardResults.filter(r => r.fee > 0).length === 0}
        <p class="no-data">年会費がかかるカードがありません</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .calculator {
    max-width: 800px;
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

  .cards-section {
    margin: 1.5rem 0;
  }

  .card-input {
    margin-bottom: 1rem;
    position: relative;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .card-number {
    font-weight: 600;
    color: var(--primary-color);
  }

  .remove-btn {
    background: var(--error);
    color: white;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
  }

  .remove-btn:hover {
    opacity: 0.8;
  }

  .preset-select {
    margin-bottom: 1rem;
  }

  .preset-select label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .preset-select select {
    width: 100%;
    padding: 0.625rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--background);
    color: var(--text-primary);
    font-size: 1rem;
  }

  .input-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .add-card-btn {
    width: 100%;
    padding: 0.75rem;
    border: 2px dashed var(--border-color);
    background: transparent;
    color: var(--text-secondary);
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .add-card-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--background);
  }

  .comparison {
    margin-top: 1.5rem;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  thead {
    background: var(--surface);
  }

  th {
    padding: 0.75rem 0.5rem;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid var(--border-color);
  }

  th:not(:first-child) {
    text-align: right;
  }

  td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  td:not(:first-child) {
    text-align: right;
  }

  .card-name {
    font-weight: 500;
  }

  tr.best {
    background: var(--background);
  }

  tr.best .card-name {
    color: var(--primary-color);
    font-weight: 600;
  }

  .best-badge {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    font-size: 0.7rem;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    margin-left: 0.5rem;
    font-weight: 600;
  }

  .negative {
    color: var(--error);
  }

  .info-box {
    margin-top: 1rem;
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
  }

  .success {
    color: var(--success);
    font-weight: 600;
    margin-left: 0.5rem;
  }

  .warning {
    color: var(--error);
    font-size: 0.9rem;
    margin-left: 0.5rem;
  }

  .no-data {
    color: var(--text-secondary);
    font-style: italic;
  }

  @media (max-width: 640px) {
    .input-row {
      grid-template-columns: 1fr;
    }

    table {
      font-size: 0.8rem;
    }

    th, td {
      padding: 0.5rem 0.25rem;
    }

    .best-badge {
      display: block;
      margin-left: 0;
      margin-top: 0.25rem;
      width: fit-content;
    }
  }
</style>
