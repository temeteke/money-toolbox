<script>
  // 現在のローン
  let currentBalance = '';
  let currentRate = '';
  let currentYears = '';

  // 新しいローン
  let newRate = '';
  let newYears = '';
  let refinancingFee = '';

  $: balance = parseFloat(currentBalance) || 0;
  $: oldRate = parseFloat(currentRate) || 0;
  $: oldYears = parseFloat(currentYears) || 0;
  $: oldMonths = oldYears * 12;

  $: newAnnualRate = parseFloat(newRate) || 0;
  $: newLoanYears = parseFloat(newYears) || 0;
  $: newMonths = newLoanYears * 12;
  $: fee = parseFloat(refinancingFee) || 0;

  // 現在のローンの返済額計算
  $: currentMonthlyPayment = calculateMonthlyPayment(balance, oldRate, oldMonths);
  $: currentTotalPayment = currentMonthlyPayment * oldMonths;
  $: currentTotalInterest = currentTotalPayment - balance;

  // 新しいローンの返済額計算
  $: newMonthlyPayment = calculateMonthlyPayment(balance, newAnnualRate, newMonths);
  $: newTotalPayment = newMonthlyPayment * newMonths + fee;
  $: newTotalInterest = newTotalPayment - balance;

  // 比較
  $: monthlySavings = currentMonthlyPayment - newMonthlyPayment;
  $: totalSavings = currentTotalPayment - newTotalPayment;
  $: interestSavings = currentTotalInterest - newTotalInterest;

  // 損益分岐点（何ヶ月で元が取れるか）
  $: breakEvenMonths = monthlySavings > 0 ? Math.ceil(fee / monthlySavings) : 0;
  $: isWorthwhile = totalSavings > 0;

  function calculateMonthlyPayment(principal, annualRate, months) {
    if (months <= 0 || principal <= 0) return 0;
    if (annualRate <= 0) return principal / months;

    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  }
</script>

<div class="calculator">
  <h2>🔄 ローン借り換えシミュレーター</h2>
  <p class="description">現在のローンと借り換え後のローンを比較して、借り換えのメリットを試算</p>

  <div class="section">
    <h3>🏦 現在のローン情報</h3>
    <div class="card">
      <div class="input-group">
        <label for="currentBalance">残高（円）</label>
        <input
          id="currentBalance"
          type="number"
          bind:value={currentBalance}
          placeholder="例: 25000000"
          min="0"
          step="100000"
        />
      </div>

      <div class="input-row">
        <div class="input-group">
          <label for="currentRate">現在の年利（%）</label>
          <input
            id="currentRate"
            type="number"
            bind:value={currentRate}
            placeholder="例: 1.5"
            min="0"
            step="0.01"
          />
        </div>

        <div class="input-group">
          <label for="currentYears">残り返済期間（年）</label>
          <input
            id="currentYears"
            type="number"
            bind:value={currentYears}
            placeholder="例: 25"
            min="1"
            max="50"
            step="1"
          />
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h3>✨ 借り換え後のローン情報</h3>
    <div class="card">
      <div class="input-row">
        <div class="input-group">
          <label for="newRate">新しい年利（%）</label>
          <input
            id="newRate"
            type="number"
            bind:value={newRate}
            placeholder="例: 0.8"
            min="0"
            step="0.01"
          />
        </div>

        <div class="input-group">
          <label for="newYears">新しい返済期間（年）</label>
          <input
            id="newYears"
            type="number"
            bind:value={newYears}
            placeholder="例: 25"
            min="1"
            max="50"
            step="1"
          />
        </div>
      </div>

      <div class="input-group">
        <label for="refinancingFee">借り換え手数料（円）</label>
        <input
          id="refinancingFee"
          type="number"
          bind:value={refinancingFee}
          placeholder="例: 500000"
          min="0"
          step="10000"
        />
        <small>諸費用（保証料、事務手数料、抵当権設定費用等）の合計</small>
      </div>
    </div>
  </div>

  {#if balance > 0 && oldRate >= 0 && oldYears > 0 && newAnnualRate >= 0 && newLoanYears > 0}
    <div class="comparison-section">
      <div class="comparison card">
        <h3>📊 返済額の比較</h3>
        <div class="comparison-table">
          <div class="comparison-row header">
            <div></div>
            <div>現在のローン</div>
            <div>借り換え後</div>
            <div>差額</div>
          </div>

          <div class="comparison-row">
            <div>月々の返済額</div>
            <div>¥{Math.round(currentMonthlyPayment).toLocaleString()}</div>
            <div>¥{Math.round(newMonthlyPayment).toLocaleString()}</div>
            <div class:positive={monthlySavings > 0} class:negative={monthlySavings < 0}>
              {monthlySavings > 0 ? '-' : '+'}¥{Math.abs(Math.round(monthlySavings)).toLocaleString()}
            </div>
          </div>

          <div class="comparison-row">
            <div>利息総額</div>
            <div>¥{Math.round(currentTotalInterest).toLocaleString()}</div>
            <div>¥{Math.round(newTotalInterest).toLocaleString()}</div>
            <div class:positive={interestSavings > 0} class:negative={interestSavings < 0}>
              {interestSavings > 0 ? '-' : '+'}¥{Math.abs(Math.round(interestSavings)).toLocaleString()}
            </div>
          </div>

          <div class="comparison-row">
            <div>返済総額</div>
            <div>¥{Math.round(currentTotalPayment).toLocaleString()}</div>
            <div>¥{Math.round(newTotalPayment).toLocaleString()}</div>
            <div class:positive={totalSavings > 0} class:negative={totalSavings < 0}>
              {totalSavings > 0 ? '-' : '+'}¥{Math.abs(Math.round(totalSavings)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {#if isWorthwhile}
        <div class="result success-result">
          <div class="result-icon">✓</div>
          <div class="result-content">
            <div class="result-label">借り換えメリット</div>
            <div class="result-value">¥{Math.round(totalSavings).toLocaleString()}</div>
            <div class="result-detail">
              月々 ¥{Math.round(monthlySavings).toLocaleString()} の削減
            </div>
          </div>
        </div>

        {#if breakEvenMonths > 0 && breakEvenMonths <= newMonths}
          <div class="info-box card">
            <h3>💡 損益分岐点</h3>
            <p>
              借り換え手数料（¥{fee.toLocaleString()}）は、
              <strong>{breakEvenMonths}ヶ月（約{Math.ceil(breakEvenMonths/12)}年）</strong>
              で回収できます
            </p>
            <p class="info-note">
              それ以降は毎月 ¥{Math.round(monthlySavings).toLocaleString()} ずつお得になります
            </p>
          </div>
        {/if}
      {:else}
        <div class="result warning-result">
          <div class="result-icon">⚠</div>
          <div class="result-content">
            <div class="result-label">借り換え非推奨</div>
            <div class="result-value">
              {#if totalSavings < 0}
                ¥{Math.abs(Math.round(totalSavings)).toLocaleString()} 損失
              {:else}
                メリットなし
              {/if}
            </div>
            <div class="result-detail">
              現在のローンを継続する方がお得です
            </div>
          </div>
        </div>

        <div class="info-box card warning-box">
          <h3>💡 アドバイス</h3>
          <p>以下の条件で借り換えメリットが出る可能性があります：</p>
          <ul>
            <li>金利差が0.5%以上ある</li>
            <li>残高が1,000万円以上ある</li>
            <li>残り返済期間が10年以上ある</li>
          </ul>
          <p class="info-note">
            金利や返済期間を調整して、再度シミュレーションしてみてください
          </p>
        </div>
      {/if}

      <div class="breakdown card">
        <h3>📝 詳細内訳</h3>
        <div class="breakdown-item">
          <span>現在のローン残高</span>
          <span>¥{balance.toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
          <span>借り換え手数料</span>
          <span>¥{fee.toLocaleString()}</span>
        </div>
        <div class="breakdown-separator"></div>
        <div class="breakdown-item">
          <span>現在の金利</span>
          <span>{oldRate}%（残り{oldYears}年）</span>
        </div>
        <div class="breakdown-item">
          <span>借り換え後の金利</span>
          <span>{newAnnualRate}%（{newLoanYears}年）</span>
        </div>
        <div class="breakdown-item">
          <span>金利差</span>
          <span class:positive={oldRate > newAnnualRate} class:negative={oldRate < newAnnualRate}>
            {(oldRate - newAnnualRate).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .calculator {
    max-width: 700px;
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

  .section {
    margin-bottom: 1.5rem;
  }

  .input-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .comparison-section {
    margin-top: 2rem;
  }

  .comparison {
    margin-bottom: 1.5rem;
  }

  .comparison-table {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    gap: 0.5rem;
  }

  .comparison-row {
    display: contents;
  }

  .comparison-row.header > div {
    font-weight: 600;
    padding: 0.75rem;
    background: var(--surface);
    border-radius: 4px;
    text-align: center;
    font-size: 0.9rem;
  }

  .comparison-row:not(.header) > div {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-color);
  }

  .comparison-row > div:first-child {
    font-weight: 500;
  }

  .comparison-row > div:not(:first-child) {
    text-align: right;
  }

  .positive {
    color: var(--success);
    font-weight: 600;
  }

  .negative {
    color: var(--error);
  }

  .success-result {
    border: 2px solid var(--success);
    background: var(--background);
  }

  .warning-result {
    border: 2px solid var(--error);
    background: var(--background);
  }

  .success-result .result-icon,
  .warning-result .result-icon {
    font-size: 2.5rem;
  }

  .success-result .result-icon {
    color: var(--success);
  }

  .warning-result .result-icon {
    color: var(--error);
  }

  .success-result .result-value {
    color: var(--success);
  }

  .warning-result .result-value {
    color: var(--error);
  }

  .result {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .result-content {
    flex: 1;
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

  .info-box ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .info-box li {
    margin-bottom: 0.5rem;
  }

  .info-box strong {
    color: var(--primary-color);
    font-size: 1.1rem;
  }

  .info-note {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .warning-box {
    background: var(--background);
    border: 1px solid var(--error);
  }

  .breakdown {
    margin-top: 1rem;
  }

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    font-size: 1rem;
  }

  .breakdown-separator {
    height: 1px;
    background: var(--border-color);
    margin: 0.5rem 0;
  }

  @media (max-width: 640px) {
    .input-row {
      grid-template-columns: 1fr;
    }

    .comparison-table {
      grid-template-columns: 1.2fr 0.9fr 0.9fr 0.9fr;
      font-size: 0.85rem;
    }

    .comparison-row.header > div {
      font-size: 0.8rem;
      padding: 0.5rem 0.25rem;
    }

    .comparison-row:not(.header) > div {
      padding: 0.5rem 0.25rem;
    }

    .result {
      flex-direction: column;
      text-align: center;
    }
  }
</style>
