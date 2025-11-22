<script>
  let inputType = 'monthly'; // 'monthly' or 'yearly'
  let grossSalary = '';
  let dependents = '0';
  let age = '';

  $: gross = parseFloat(grossSalary) || 0;
  $: numDependents = parseInt(dependents) || 0;
  $: userAge = parseInt(age) || 0;

  // 年収換算
  $: yearlyGross = inputType === 'monthly' ? gross * 12 : gross;
  $: monthlyGross = inputType === 'monthly' ? gross : gross / 12;

  // 社会保険料（概算：年収の約15%）
  $: socialInsurance = yearlyGross * 0.15;
  $: monthlySocialInsurance = socialInsurance / 12;

  // 所得税（簡易計算）
  $: incomeTax = calculateIncomeTax(yearlyGross, numDependents);
  $: monthlyIncomeTax = incomeTax / 12;

  // 住民税（簡易計算：前年所得の約10%）
  $: residentTax = calculateResidentTax(yearlyGross, numDependents);
  $: monthlyResidentTax = residentTax / 12;

  // 控除総額
  $: totalDeductions = socialInsurance + incomeTax + residentTax;
  $: monthlyTotalDeductions = totalDeductions / 12;

  // 手取り
  $: netYearly = yearlyGross - totalDeductions;
  $: netMonthly = netYearly / 12;

  // 手取り率
  $: takeHomeRate = yearlyGross > 0 ? (netYearly / yearlyGross * 100) : 0;

  function calculateIncomeTax(yearlyIncome, dependents) {
    // 給与所得控除（簡易計算）
    let employmentDeduction = 0;
    if (yearlyIncome <= 1625000) {
      employmentDeduction = 550000;
    } else if (yearlyIncome <= 1800000) {
      employmentDeduction = yearlyIncome * 0.4 - 100000;
    } else if (yearlyIncome <= 3600000) {
      employmentDeduction = yearlyIncome * 0.3 + 80000;
    } else if (yearlyIncome <= 6600000) {
      employmentDeduction = yearlyIncome * 0.2 + 440000;
    } else if (yearlyIncome <= 8500000) {
      employmentDeduction = yearlyIncome * 0.1 + 1100000;
    } else {
      employmentDeduction = 1950000;
    }

    // 基礎控除
    const baseDeduction = yearlyIncome <= 24000000 ? 480000 : 0;

    // 扶養控除（1人あたり38万円）
    const dependentDeduction = dependents * 380000;

    // 課税所得
    const taxableIncome = Math.max(0, yearlyIncome - employmentDeduction - baseDeduction - dependentDeduction);

    // 所得税（累進課税の簡易計算）
    let tax = 0;
    if (taxableIncome <= 1950000) {
      tax = taxableIncome * 0.05;
    } else if (taxableIncome <= 3300000) {
      tax = 97500 + (taxableIncome - 1950000) * 0.1;
    } else if (taxableIncome <= 6950000) {
      tax = 232500 + (taxableIncome - 3300000) * 0.2;
    } else if (taxableIncome <= 9000000) {
      tax = 962500 + (taxableIncome - 6950000) * 0.23;
    } else if (taxableIncome <= 18000000) {
      tax = 1434000 + (taxableIncome - 9000000) * 0.33;
    } else {
      tax = 4404000 + (taxableIncome - 18000000) * 0.4;
    }

    // 復興特別所得税（2.1%）
    tax = tax * 1.021;

    return Math.max(0, tax);
  }

  function calculateResidentTax(yearlyIncome, dependents) {
    // 給与所得控除（所得税と同じ）
    let employmentDeduction = 0;
    if (yearlyIncome <= 1625000) {
      employmentDeduction = 550000;
    } else if (yearlyIncome <= 1800000) {
      employmentDeduction = yearlyIncome * 0.4 - 100000;
    } else if (yearlyIncome <= 3600000) {
      employmentDeduction = yearlyIncome * 0.3 + 80000;
    } else if (yearlyIncome <= 6600000) {
      employmentDeduction = yearlyIncome * 0.2 + 440000;
    } else if (yearlyIncome <= 8500000) {
      employmentDeduction = yearlyIncome * 0.1 + 1100000;
    } else {
      employmentDeduction = 1950000;
    }

    // 基礎控除（住民税は43万円）
    const baseDeduction = 430000;

    // 扶養控除（1人あたり33万円）
    const dependentDeduction = dependents * 330000;

    // 課税所得
    const taxableIncome = Math.max(0, yearlyIncome - employmentDeduction - baseDeduction - dependentDeduction);

    // 住民税（所得割10% + 均等割5000円）
    const tax = taxableIncome * 0.1 + 5000;

    return Math.max(0, tax);
  }
</script>

<div class="calculator">
  <h2>💴 手取り給与計算</h2>
  <p class="description">額面給与から税金・社会保険料を引いた手取り額を計算</p>

  <div class="notice card">
    <h3>⚠️ ご注意</h3>
    <p>この計算は簡易的な概算です。実際の手取り額は以下の要因により変動します：</p>
    <ul>
      <li>各種控除（配偶者控除、医療費控除、住宅ローン控除など）</li>
      <li>社会保険料率の地域差</li>
      <li>賞与の有無と金額</li>
      <li>前年の所得（住民税に影響）</li>
    </ul>
    <p>正確な金額は給与明細や税理士にご確認ください。</p>
  </div>

  <div class="card">
    <div class="input-group">
      <label for="inputType">入力タイプ</label>
      <select id="inputType" bind:value={inputType}>
        <option value="monthly">月給</option>
        <option value="yearly">年収</option>
      </select>
    </div>

    <div class="input-group">
      <label for="grossSalary">
        {inputType === 'monthly' ? '額面月給（円）' : '額面年収（円）'}
      </label>
      <input
        id="grossSalary"
        type="number"
        bind:value={grossSalary}
        placeholder={inputType === 'monthly' ? '例: 300000' : '例: 5000000'}
        min="0"
        step="1000"
      />
    </div>

    <div class="input-group">
      <label for="dependents">扶養人数<span class="optional">（任意）</span></label>
      <input
        id="dependents"
        type="number"
        bind:value={dependents}
        placeholder="例: 0"
        min="0"
        step="1"
      />
      <small>配偶者や子供など</small>
    </div>

    <div class="input-group">
      <label for="age">年齢<span class="optional">（任意）</span></label>
      <input
        id="age"
        type="number"
        bind:value={age}
        placeholder="例: 30"
        min="18"
        max="100"
        step="1"
      />
      <small>65歳以上は控除額が異なります</small>
    </div>
  </div>

  {#if gross > 0}
    <div class="result">
      <div class="result-label">手取り月収</div>
      <div class="result-value">¥{Math.round(netMonthly).toLocaleString()}</div>
      <div class="result-detail">手取り率: {takeHomeRate.toFixed(1)}%</div>
    </div>

    <div class="breakdown card">
      <h3>💰 詳細内訳（月額）</h3>
      <div class="breakdown-item">
        <span>額面給与</span>
        <span>¥{Math.round(monthlyGross).toLocaleString()}</span>
      </div>
      <div class="breakdown-item deduction">
        <span>社会保険料</span>
        <span>-¥{Math.round(monthlySocialInsurance).toLocaleString()}</span>
      </div>
      <div class="breakdown-sub">
        <span>（健康保険・厚生年金・雇用保険）</span>
        <span>約{(socialInsurance / yearlyGross * 100).toFixed(1)}%</span>
      </div>
      <div class="breakdown-item deduction">
        <span>所得税</span>
        <span>-¥{Math.round(monthlyIncomeTax).toLocaleString()}</span>
      </div>
      <div class="breakdown-item deduction">
        <span>住民税</span>
        <span>-¥{Math.round(monthlyResidentTax).toLocaleString()}</span>
      </div>
      <div class="breakdown-item total-deduction">
        <span>控除合計</span>
        <span>-¥{Math.round(monthlyTotalDeductions).toLocaleString()}</span>
      </div>
      <div class="breakdown-item highlight">
        <span>手取り月収</span>
        <span>¥{Math.round(netMonthly).toLocaleString()}</span>
      </div>
    </div>

    <div class="breakdown card">
      <h3>📊 年間集計</h3>
      <div class="breakdown-item">
        <span>額面年収</span>
        <span>¥{Math.round(yearlyGross).toLocaleString()}</span>
      </div>
      <div class="breakdown-item deduction">
        <span>社会保険料（年間）</span>
        <span>-¥{Math.round(socialInsurance).toLocaleString()}</span>
      </div>
      <div class="breakdown-item deduction">
        <span>所得税（年間）</span>
        <span>-¥{Math.round(incomeTax).toLocaleString()}</span>
      </div>
      <div class="breakdown-item deduction">
        <span>住民税（年間）</span>
        <span>-¥{Math.round(residentTax).toLocaleString()}</span>
      </div>
      <div class="breakdown-item total-deduction">
        <span>控除合計（年間）</span>
        <span>-¥{Math.round(totalDeductions).toLocaleString()}</span>
      </div>
      <div class="breakdown-item highlight">
        <span>手取り年収</span>
        <span>¥{Math.round(netYearly).toLocaleString()}</span>
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

  .notice {
    background: #fff3cd;
    border: 1px solid #ffc107;
    margin-bottom: 1.5rem;
  }

  .notice h3 {
    color: #856404;
    margin-bottom: 0.75rem;
  }

  .notice p {
    color: #856404;
    margin-bottom: 0.75rem;
    line-height: 1.6;
  }

  .notice ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #856404;
  }

  .notice li {
    margin-bottom: 0.25rem;
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

  .breakdown-item.deduction {
    color: var(--error);
  }

  .breakdown-item.total-deduction {
    color: var(--error);
    font-weight: 600;
    padding-top: 1rem;
    border-top: 2px solid var(--border-color);
  }

  .breakdown-item.highlight {
    color: var(--success);
    font-weight: 600;
    font-size: 1.1rem;
    padding-top: 1rem;
    border-top: 2px solid var(--border-color);
  }

  .breakdown-sub {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0 0.5rem 1rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  @media (prefers-color-scheme: dark) {
    .notice {
      background: #4a3f1a;
      border-color: #6b5b1f;
    }

    .notice h3,
    .notice p,
    .notice ul {
      color: #ffc107;
    }
  }
</style>
