<script>
  let inputType = 'monthly'; // 'monthly' or 'yearly'
  let salary = '';
  let workingHours = '';
  let bonus = '';

  $: salaryAmount = parseFloat(salary) || 0;
  $: hours = parseFloat(workingHours) || 0;
  $: bonusAmount = parseFloat(bonus) || 0;

  // 月給から時給を計算
  $: hourlyWageFromMonthly = hours > 0 ? salaryAmount / hours : 0;

  // 年収から時給を計算（ボーナス含む）
  $: yearlyTotal = inputType === 'yearly' ? salaryAmount : (salaryAmount * 12 + bonusAmount);
  $: yearlyHours = hours * 12;
  $: hourlyWageFromYearly = yearlyHours > 0 ? yearlyTotal / yearlyHours : 0;

  // 最終的な時給
  $: hourlyWage = inputType === 'monthly' ? hourlyWageFromMonthly : hourlyWageFromYearly;

  // 残業代（1.25倍、1.5倍）
  $: overtimeWage125 = hourlyWage * 1.25;
  $: overtimeWage150 = hourlyWage * 1.5;

  // 月給換算（年収入力時）
  $: monthlyFromYearly = inputType === 'yearly' ? yearlyTotal / 12 : 0;
</script>

<div class="calculator">
  <h2>⏱️ 時給換算</h2>
  <p class="description">月給・年収から実質的な時給を計算</p>

  <div class="card">
    <div class="input-group">
      <label for="inputType">入力タイプ</label>
      <select id="inputType" bind:value={inputType}>
        <option value="monthly">月給</option>
        <option value="yearly">年収</option>
      </select>
    </div>

    <div class="input-group">
      <label for="salary">
        {inputType === 'monthly' ? '月給（円）' : '年収（円）'}
      </label>
      <input
        id="salary"
        type="number"
        bind:value={salary}
        placeholder={inputType === 'monthly' ? '例: 250000' : '例: 4000000'}
        min="0"
        step="1000"
      />
    </div>

    <div class="input-group">
      <label for="workingHours">
        {inputType === 'monthly' ? '月間労働時間' : '月平均労働時間'}
      </label>
      <input
        id="workingHours"
        type="number"
        bind:value={workingHours}
        placeholder="例: 160"
        min="0"
        step="1"
      />
      <small>標準的な月間労働時間: 160時間（週40時間）</small>
    </div>

    {#if inputType === 'yearly'}
      <div class="input-group">
        <label for="bonus">年間ボーナス（円）<span class="optional">（任意）</span></label>
        <input
          id="bonus"
          type="number"
          bind:value={bonus}
          placeholder="例: 500000（なしの場合は0）"
          min="0"
          step="10000"
        />
      </div>
    {/if}
  </div>

  {#if salaryAmount > 0 && hours > 0}
    <div class="result">
      <div class="result-label">実質時給</div>
      <div class="result-value">¥{Math.round(hourlyWage).toLocaleString()}</div>
      <div class="result-detail">1時間あたり</div>
    </div>

    <div class="breakdown card">
      <h3>💰 詳細情報</h3>

      {#if inputType === 'yearly'}
        <div class="breakdown-item">
          <span>年収総額</span>
          <span>¥{Math.round(yearlyTotal).toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
          <span>月収換算</span>
          <span>¥{Math.round(monthlyFromYearly).toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
          <span>年間労働時間</span>
          <span>{yearlyHours.toLocaleString()}時間</span>
        </div>
      {:else}
        <div class="breakdown-item">
          <span>月給</span>
          <span>¥{salaryAmount.toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
          <span>月間労働時間</span>
          <span>{hours}時間</span>
        </div>
      {/if}

      <div class="breakdown-item highlight">
        <span>基本時給</span>
        <span>¥{Math.round(hourlyWage).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>残業代（1.25倍）</span>
        <span>¥{Math.round(overtimeWage125).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>深夜・休日（1.5倍）</span>
        <span>¥{Math.round(overtimeWage150).toLocaleString()}</span>
      </div>
    </div>

    <div class="info-box card">
      <h3>📊 参考情報</h3>
      <div class="comparison-grid">
        <div class="comparison-item">
          <div class="comparison-label">1日8時間勤務</div>
          <div class="comparison-value">¥{Math.round(hourlyWage * 8).toLocaleString()}</div>
        </div>
        <div class="comparison-item">
          <div class="comparison-label">週40時間勤務</div>
          <div class="comparison-value">¥{Math.round(hourlyWage * 40).toLocaleString()}</div>
        </div>
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

  .info-box {
    margin-top: 1rem;
    background: var(--background);
  }

  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .comparison-item {
    text-align: center;
    padding: 1rem;
    background: var(--surface);
    border-radius: 8px;
  }

  .comparison-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .comparison-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-color);
  }
</style>
