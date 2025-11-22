<script>
  let loanAmount = '';
  let annualRate = '';
  let loanYears = '';
  let repaymentType = 'equal-payment'; // 'equal-payment' or 'equal-principal'

  $: principal = parseFloat(loanAmount) || 0;
  $: rate = parseFloat(annualRate) || 0;
  $: years = parseFloat(loanYears) || 0;
  $: months = years * 12;

  // 元利均等返済
  $: monthlyPaymentEqualPayment = calculateEqualPayment(principal, rate, months);
  $: totalPaymentEqualPayment = monthlyPaymentEqualPayment * months;
  $: totalInterestEqualPayment = totalPaymentEqualPayment - principal;

  // 元金均等返済
  $: monthlyPrincipal = months > 0 ? principal / months : 0;
  $: firstMonthPaymentEqualPrincipal = calculateEqualPrincipalFirstMonth(principal, rate, months);
  $: lastMonthPaymentEqualPrincipal = monthlyPrincipal + (monthlyPrincipal * (rate / 100 / 12));
  $: totalInterestEqualPrincipal = calculateEqualPrincipalTotalInterest(principal, rate, months);
  $: totalPaymentEqualPrincipal = principal + totalInterestEqualPrincipal;

  // 表示用の値
  $: monthlyPayment = repaymentType === 'equal-payment' ? monthlyPaymentEqualPayment : firstMonthPaymentEqualPrincipal;
  $: totalPayment = repaymentType === 'equal-payment' ? totalPaymentEqualPayment : totalPaymentEqualPrincipal;
  $: totalInterest = repaymentType === 'equal-payment' ? totalInterestEqualPayment : totalInterestEqualPrincipal;

  // 返済計画表（最初の12ヶ月分と最後の12ヶ月分）
  $: repaymentSchedule = generateRepaymentSchedule(principal, rate, months, repaymentType);

  function calculateEqualPayment(principal, annualRate, months) {
    if (months <= 0 || principal <= 0) return 0;
    if (annualRate <= 0) return principal / months;

    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  }

  function calculateEqualPrincipalFirstMonth(principal, annualRate, months) {
    if (months <= 0 || principal <= 0) return 0;

    const monthlyPrincipal = principal / months;
    const monthlyRate = annualRate / 100 / 12;
    const firstMonthInterest = principal * monthlyRate;
    return monthlyPrincipal + firstMonthInterest;
  }

  function calculateEqualPrincipalTotalInterest(principal, annualRate, months) {
    if (months <= 0 || principal <= 0 || annualRate <= 0) return 0;

    const monthlyRate = annualRate / 100 / 12;
    const totalInterest = principal * monthlyRate * (months + 1) / 2;
    return totalInterest;
  }

  function generateRepaymentSchedule(principal, annualRate, months, type) {
    if (months <= 0 || principal <= 0) return [];

    const monthlyRate = annualRate / 100 / 12;
    const schedule = [];
    let remainingPrincipal = principal;

    for (let month = 1; month <= months; month++) {
      let payment, principalPayment, interestPayment;

      if (type === 'equal-payment') {
        const monthlyPayment = calculateEqualPayment(principal, annualRate, months);
        interestPayment = remainingPrincipal * monthlyRate;
        principalPayment = monthlyPayment - interestPayment;
        payment = monthlyPayment;
      } else {
        principalPayment = principal / months;
        interestPayment = remainingPrincipal * monthlyRate;
        payment = principalPayment + interestPayment;
      }

      remainingPrincipal -= principalPayment;

      // 最初の12ヶ月と最後の12ヶ月のみ保存
      if (month <= 12 || month > months - 12) {
        schedule.push({
          month,
          payment,
          principalPayment,
          interestPayment,
          remainingPrincipal: Math.max(0, remainingPrincipal)
        });
      }
    }

    return schedule;
  }
</script>

<div class="calculator">
  <h2>🏠 住宅ローンシミュレーター</h2>
  <p class="description">借入金額、金利、返済期間から月々の返済額を計算</p>

  <div class="card">
    <div class="input-group">
      <label for="loanAmount">借入金額（円）</label>
      <input
        id="loanAmount"
        type="number"
        bind:value={loanAmount}
        placeholder="例: 30000000"
        min="0"
        step="100000"
      />
    </div>

    <div class="input-group">
      <label for="annualRate">年利（%）</label>
      <input
        id="annualRate"
        type="number"
        bind:value={annualRate}
        placeholder="例: 1.5"
        min="0"
        step="0.01"
      />
    </div>

    <div class="input-group">
      <label for="loanYears">返済期間（年）</label>
      <input
        id="loanYears"
        type="number"
        bind:value={loanYears}
        placeholder="例: 35"
        min="1"
        max="50"
        step="1"
      />
    </div>

    <div class="input-group">
      <label for="repaymentType">返済方式</label>
      <select id="repaymentType" bind:value={repaymentType}>
        <option value="equal-payment">元利均等返済（毎月の返済額が一定）</option>
        <option value="equal-principal">元金均等返済（元金の返済額が一定）</option>
      </select>
      <small>
        {#if repaymentType === 'equal-payment'}
          毎月の返済額が一定。計画が立てやすい。
        {:else}
          最初は返済額が多いが、徐々に減少。総利息が少ない。
        {/if}
      </small>
    </div>
  </div>

  {#if principal > 0 && rate >= 0 && years > 0}
    <div class="result">
      <div class="result-label">
        {repaymentType === 'equal-payment' ? '月々の返済額' : '初回返済額'}
      </div>
      <div class="result-value">¥{Math.round(monthlyPayment).toLocaleString()}</div>
      <div class="result-detail">
        {#if repaymentType === 'equal-principal'}
          最終回: ¥{Math.round(lastMonthPaymentEqualPrincipal).toLocaleString()}
        {/if}
      </div>
    </div>

    <div class="breakdown card">
      <h3>💰 返済総額</h3>
      <div class="breakdown-item">
        <span>借入金額</span>
        <span>¥{principal.toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>利息総額</span>
        <span>¥{Math.round(totalInterest).toLocaleString()}</span>
      </div>
      <div class="breakdown-item highlight">
        <span>返済総額</span>
        <span>¥{Math.round(totalPayment).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>返済期間</span>
        <span>{years}年（{months}ヶ月）</span>
      </div>
    </div>

    {#if repaymentType === 'equal-payment' && repaymentType === 'equal-principal'}
      <div class="comparison card">
        <h3>🔄 返済方式の比較</h3>
        <div class="comparison-table">
          <div class="comparison-row header">
            <div></div>
            <div>元利均等</div>
            <div>元金均等</div>
          </div>
          <div class="comparison-row">
            <div>月々の返済額</div>
            <div>¥{Math.round(monthlyPaymentEqualPayment).toLocaleString()}</div>
            <div>
              ¥{Math.round(firstMonthPaymentEqualPrincipal).toLocaleString()}
              <span class="arrow">→</span>
              ¥{Math.round(lastMonthPaymentEqualPrincipal).toLocaleString()}
            </div>
          </div>
          <div class="comparison-row">
            <div>利息総額</div>
            <div>¥{Math.round(totalInterestEqualPayment).toLocaleString()}</div>
            <div>¥{Math.round(totalInterestEqualPrincipal).toLocaleString()}</div>
          </div>
          <div class="comparison-row">
            <div>返済総額</div>
            <div>¥{Math.round(totalPaymentEqualPayment).toLocaleString()}</div>
            <div>¥{Math.round(totalPaymentEqualPrincipal).toLocaleString()}</div>
          </div>
        </div>
      </div>
    {/if}

    {#if repaymentSchedule.length > 0}
      <div class="schedule card">
        <h3>📅 返済計画表（抜粋）</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>回数</th>
                <th>返済額</th>
                <th>元金</th>
                <th>利息</th>
                <th>残高</th>
              </tr>
            </thead>
            <tbody>
              {#each repaymentSchedule as row, index}
                {#if index === 12 && months > 24}
                  <tr class="separator">
                    <td colspan="5">...</td>
                  </tr>
                {/if}
                <tr class:first={row.month === 1} class:last={row.month === months}>
                  <td>{row.month}回</td>
                  <td>¥{Math.round(row.payment).toLocaleString()}</td>
                  <td>¥{Math.round(row.principalPayment).toLocaleString()}</td>
                  <td>¥{Math.round(row.interestPayment).toLocaleString()}</td>
                  <td>¥{Math.round(row.remainingPrincipal).toLocaleString()}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
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

  .comparison {
    margin-top: 1rem;
  }

  .comparison-table {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr;
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

  .arrow {
    color: var(--text-secondary);
    margin: 0 0.25rem;
  }

  .schedule {
    margin-top: 1rem;
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
    text-align: right;
    font-weight: 600;
    border-bottom: 2px solid var(--border-color);
  }

  th:first-child {
    text-align: left;
  }

  td {
    padding: 0.75rem 0.5rem;
    text-align: right;
    border-bottom: 1px solid var(--border-color);
  }

  td:first-child {
    text-align: left;
  }

  tr.first {
    background: var(--background);
    font-weight: 600;
  }

  tr.last {
    background: var(--background);
    font-weight: 600;
  }

  tr.separator td {
    text-align: center;
    color: var(--text-secondary);
    padding: 0.5rem;
  }

  @media (max-width: 640px) {
    .comparison-table {
      font-size: 0.85rem;
    }

    table {
      font-size: 0.8rem;
    }

    th, td {
      padding: 0.5rem 0.25rem;
    }
  }
</style>
