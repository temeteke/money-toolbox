<script>
  let investmentType = 'lump-sum'; // 'lump-sum' or 'accumulation'
  let initialAmount = '';
  let monthlyPayment = '';
  let annualRate = '';
  let years = '';
  let compoundFrequency = 'monthly'; // 'monthly' or 'yearly'

  // リアクティブ計算
  $: initial = parseFloat(initialAmount) || 0;
  $: monthly = investmentType === 'accumulation' ? (parseFloat(monthlyPayment) || 0) : 0;
  $: rate = parseFloat(annualRate) || 0;
  $: period = parseFloat(years) || 0;

  // 年次推移データの計算
  $: yearlyData = calculateYearlyData(initial, monthly, rate, period, compoundFrequency);

  // 最終結果（最後の年のデータ）
  $: finalData = yearlyData.length > 0 ? yearlyData[yearlyData.length - 1] : null;
  $: finalBalance = finalData ? finalData.balance : 0;
  $: totalPrincipal = finalData ? finalData.principal : 0;
  $: totalProfit = finalData ? finalData.profit : 0;
  $: profitRate = totalPrincipal > 0 ? (totalProfit / totalPrincipal * 100) : 0;

  function calculateYearlyData(initial, monthly, rate, period, frequency) {
    if (!period || !rate || (initial === 0 && monthly === 0)) {
      return [];
    }

    const yearlyData = [];
    const rateDecimal = rate / 100;

    if (frequency === 'monthly') {
      const monthlyRate = rateDecimal / 12;

      for (let year = 1; year <= period; year++) {
        const months = year * 12;

        // 初期投資の複利計算
        const futureInitial = initial * Math.pow(1 + monthlyRate, months);

        // 積立の複利計算（年金終価係数）
        let futurePayments = 0;
        if (monthly > 0) {
          if (monthlyRate > 0) {
            futurePayments = monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
          } else {
            futurePayments = monthly * months;
          }
        }

        const balance = futureInitial + futurePayments;
        const principal = initial + (monthly * months);
        const profit = balance - principal;

        yearlyData.push({ year, balance, principal, profit });
      }
    } else {
      // 年次複利
      const yearlyRate = rateDecimal;

      for (let year = 1; year <= period; year++) {
        // 初期投資の複利計算
        const futureInitial = initial * Math.pow(1 + yearlyRate, year);

        // 年間積立額
        const yearlyPayment = monthly * 12;

        // 積立の複利計算
        let futurePayments = 0;
        if (yearlyPayment > 0) {
          if (yearlyRate > 0) {
            futurePayments = yearlyPayment * (Math.pow(1 + yearlyRate, year) - 1) / yearlyRate;
          } else {
            futurePayments = yearlyPayment * year;
          }
        }

        const balance = futureInitial + futurePayments;
        const principal = initial + (yearlyPayment * year);
        const profit = balance - principal;

        yearlyData.push({ year, balance, principal, profit });
      }
    }

    return yearlyData;
  }
</script>

<div class="calculator">
  <h2>📈 投資シミュレーター</h2>
  <p class="description">複利効果を考慮した長期投資のシミュレーション</p>

  <div class="card">
    <div class="input-group">
      <label for="investmentType">投資タイプ</label>
      <select id="investmentType" bind:value={investmentType}>
        <option value="lump-sum">一括投資</option>
        <option value="accumulation">積立投資</option>
      </select>
    </div>

    <div class="input-group">
      <label for="initialAmount">
        初期投資額（円）
        {#if investmentType === 'accumulation'}
          <span class="optional">（任意）</span>
        {/if}
      </label>
      <input
        id="initialAmount"
        type="number"
        bind:value={initialAmount}
        placeholder={investmentType === 'lump-sum' ? '例: 1000000' : '例: 100000（なしの場合は0）'}
        min="0"
        step="1000"
      />
    </div>

    {#if investmentType === 'accumulation'}
      <div class="input-group">
        <label for="monthlyPayment">月々の積立額（円）</label>
        <input
          id="monthlyPayment"
          type="number"
          bind:value={monthlyPayment}
          placeholder="例: 30000"
          min="0"
          step="1000"
        />
      </div>
    {/if}

    <div class="input-group">
      <label for="annualRate">想定年利（%）</label>
      <input
        id="annualRate"
        type="number"
        bind:value={annualRate}
        placeholder="例: 5.0"
        min="0"
        step="0.1"
      />
    </div>

    <div class="input-group">
      <label for="years">運用期間（年）</label>
      <input
        id="years"
        type="number"
        bind:value={years}
        placeholder="例: 20"
        min="1"
        max="50"
        step="1"
      />
    </div>

    <div class="input-group">
      <label for="compoundFrequency">複利計算頻度</label>
      <select id="compoundFrequency" bind:value={compoundFrequency}>
        <option value="monthly">月次</option>
        <option value="yearly">年次</option>
      </select>
    </div>
  </div>

  {#if finalData}
    <div class="result">
      <div class="result-label">最終資産（{period}年後）</div>
      <div class="result-value">¥{Math.round(finalBalance).toLocaleString()}</div>
    </div>

    <div class="breakdown card">
      <h3>📈 運用結果</h3>
      <div class="breakdown-item">
        <span>元本総額</span>
        <span>¥{Math.round(totalPrincipal).toLocaleString()}</span>
      </div>
      {#if investmentType === 'accumulation' && initial > 0 && monthly > 0}
        <div class="breakdown-sub">
          <span>├─ 初期投資</span>
          <span>¥{initial.toLocaleString()}</span>
        </div>
        <div class="breakdown-sub">
          <span>└─ 積立総額</span>
          <span>¥{Math.round(monthly * period * 12).toLocaleString()}</span>
        </div>
      {/if}
      <div class="breakdown-item profit">
        <span>運用益</span>
        <span>¥{Math.round(totalProfit).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>運用益率</span>
        <span>{profitRate.toFixed(1)}%</span>
      </div>
    </div>

    <div class="yearly-table card">
      <h3>📅 年次推移</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>年数</th>
              <th>資産額</th>
              <th>元本</th>
              <th>運用益</th>
            </tr>
          </thead>
          <tbody>
            {#each yearlyData as data}
              <tr class:final={data.year === period}>
                <td>{data.year}年</td>
                <td>¥{Math.round(data.balance).toLocaleString()}</td>
                <td>¥{Math.round(data.principal).toLocaleString()}</td>
                <td class="profit">¥{Math.round(data.profit).toLocaleString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
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

  .breakdown {
    margin-bottom: 1rem;
  }

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    font-size: 1rem;
  }

  .breakdown-sub {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0 0.5rem 1rem;
    font-size: 0.95rem;
    color: var(--text-secondary);
  }

  .breakdown-item.profit {
    color: var(--success);
    font-weight: 600;
  }

  .yearly-table {
    margin-top: 1rem;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }

  thead {
    background: var(--surface);
    position: sticky;
    top: 0;
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

  td.profit {
    color: var(--success);
    font-weight: 500;
  }

  tr.final {
    background: var(--background);
    font-weight: 600;
  }

  @media (max-width: 640px) {
    table {
      font-size: 0.85rem;
    }

    th, td {
      padding: 0.5rem 0.25rem;
    }
  }
</style>
