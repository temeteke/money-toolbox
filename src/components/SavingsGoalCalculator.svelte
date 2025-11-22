<script>
  let targetAmount = '';
  let months = '';
  let currentSavings = '';
  let interestRate = '';

  $: target = parseFloat(targetAmount) || 0;
  $: period = parseFloat(months) || 0;
  $: current = parseFloat(currentSavings) || 0;
  $: rate = parseFloat(interestRate) || 0;

  // 必要な貯金額（残り）
  $: remainingAmount = target - current;

  // 利息なしの場合の月々の必要額
  $: monthlyWithoutInterest = period > 0 ? remainingAmount / period : 0;

  // 利息ありの場合の月々の必要額（年金現価係数を使用）
  $: monthlyWithInterest = calculateMonthlyPayment(remainingAmount, rate, period);

  // 最終的な月々の必要額
  $: monthlySavings = rate > 0 ? monthlyWithInterest : monthlyWithoutInterest;

  // 総積立額
  $: totalSavings = monthlySavings * period;

  // 利息収入
  $: interestIncome = rate > 0 ? remainingAmount - totalSavings : 0;

  // 達成予定日
  $: achievementDate = period > 0 ? calculateAchievementDate(period) : null;

  function calculateMonthlyPayment(remaining, annualRate, months) {
    if (months <= 0 || remaining <= 0) return 0;
    if (annualRate <= 0) return remaining / months;

    const monthlyRate = annualRate / 100 / 12;
    // 年金現価係数の逆数を使用
    const payment = remaining * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
    return payment;
  }

  function calculateAchievementDate(months) {
    const now = new Date();
    const future = new Date(now);
    future.setMonth(future.getMonth() + months);
    return future;
  }

  function formatDate(date) {
    if (!date) return '';
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  }
</script>

<div class="calculator">
  <h2>💰 貯金目標達成計算</h2>
  <p class="description">目標金額と期限から必要な月々の貯金額を計算</p>

  <div class="card">
    <div class="input-group">
      <label for="targetAmount">目標金額（円）</label>
      <input
        id="targetAmount"
        type="number"
        bind:value={targetAmount}
        placeholder="例: 1000000"
        min="0"
        step="10000"
      />
    </div>

    <div class="input-group">
      <label for="months">達成期間（月）</label>
      <input
        id="months"
        type="number"
        bind:value={months}
        placeholder="例: 24"
        min="1"
        step="1"
      />
    </div>

    <div class="input-group">
      <label for="currentSavings">現在の貯金額（円）<span class="optional">（任意）</span></label>
      <input
        id="currentSavings"
        type="number"
        bind:value={currentSavings}
        placeholder="例: 100000（なしの場合は0）"
        min="0"
        step="10000"
      />
    </div>

    <div class="input-group">
      <label for="interestRate">想定年利（%）<span class="optional">（任意）</span></label>
      <input
        id="interestRate"
        type="number"
        bind:value={interestRate}
        placeholder="例: 3.0（なしの場合は0）"
        min="0"
        max="20"
        step="0.1"
      />
      <small>普通預金の場合は0、積立投資の場合は想定利回りを入力</small>
    </div>
  </div>

  {#if target > 0 && period > 0}
    <div class="result">
      <div class="result-label">月々の必要貯金額</div>
      <div class="result-value">¥{Math.ceil(monthlySavings).toLocaleString()}</div>
      <div class="result-detail">{period}ヶ月間</div>
    </div>

    <div class="breakdown card">
      <h3>📊 達成プラン</h3>
      <div class="breakdown-item">
        <span>目標金額</span>
        <span>¥{target.toLocaleString()}</span>
      </div>
      {#if current > 0}
        <div class="breakdown-item">
          <span>現在の貯金額</span>
          <span>¥{current.toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
          <span>必要な貯金額</span>
          <span>¥{Math.round(remainingAmount).toLocaleString()}</span>
        </div>
      {/if}
      <div class="breakdown-item highlight">
        <span>月々の貯金額</span>
        <span>¥{Math.ceil(monthlySavings).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>総積立額</span>
        <span>¥{Math.ceil(totalSavings).toLocaleString()}</span>
      </div>
      {#if rate > 0}
        <div class="breakdown-item success">
          <span>利息収入</span>
          <span>¥{Math.round(interestIncome).toLocaleString()}</span>
        </div>
      {/if}
      {#if achievementDate}
        <div class="breakdown-item">
          <span>達成予定</span>
          <span>{formatDate(achievementDate)}</span>
        </div>
      {/if}
    </div>

    {#if rate > 0}
      <div class="info-box card">
        <h3>💡 ポイント</h3>
        <p>
          年利{rate}%で運用すると、月々¥{Math.ceil(monthlySavings).toLocaleString()}の積立で目標達成できます。
        </p>
        <p>
          利息なしの場合は月々¥{Math.ceil(monthlyWithoutInterest).toLocaleString()}必要なので、
          <strong>¥{Math.ceil(monthlyWithoutInterest - monthlySavings).toLocaleString()}</strong>
          お得になります。
        </p>
      </div>
    {/if}

    <div class="milestone card">
      <h3>📅 進捗マイルストーン</h3>
      <div class="milestone-grid">
        {#each [3, 6, 12, 18, 24] as month}
          {#if month <= period}
            {@const saved = current + (monthlySavings * month)}
            {@const progress = (saved / target) * 100}
            <div class="milestone-item">
              <div class="milestone-month">{month}ヶ月後</div>
              <div class="milestone-amount">¥{Math.round(saved).toLocaleString()}</div>
              <div class="milestone-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: {Math.min(progress, 100)}%"></div>
                </div>
                <span class="progress-text">{progress.toFixed(0)}%</span>
              </div>
            </div>
          {/if}
        {/each}
      </div>
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

  .breakdown {
    margin-top: 1rem;
  }

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    font-size: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .breakdown-item:last-child {
    border-bottom: none;
  }

  .breakdown-item.highlight {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1.1rem;
  }

  .breakdown-item.success {
    color: var(--success);
    font-weight: 600;
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
    color: var(--success);
    font-size: 1.1rem;
  }

  .milestone {
    margin-top: 1rem;
  }

  .milestone-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .milestone-item {
    padding: 1rem;
    background: var(--background);
    border-radius: 8px;
  }

  .milestone-month {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }

  .milestone-amount {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }

  .milestone-progress {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: var(--border-color);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 40px;
    text-align: right;
  }
</style>
