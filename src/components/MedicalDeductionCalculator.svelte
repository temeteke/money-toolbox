<script>
  let annualIncome = '';
  let medicalExpenses = '';
  let insurancePayments = '';
  let otcMedicines = '';

  $: income = parseFloat(annualIncome) || 0;
  $: medical = parseFloat(medicalExpenses) || 0;
  $: insurance = parseFloat(insurancePayments) || 0;
  $: otc = parseFloat(otcMedicines) || 0;

  // 保険金等で補填される金額を除いた医療費
  $: netMedicalExpenses = Math.max(0, medical - insurance);

  // 通常の医療費控除の基準額（10万円 または 所得の5%の少ない方）
  $: threshold = Math.min(100000, income * 0.05);

  // 通常の医療費控除額
  $: standardDeduction = Math.max(0, netMedicalExpenses - threshold);
  $: standardDeductionCapped = Math.min(standardDeduction, 2000000); // 上限200万円

  // セルフメディケーション税制（OTC医薬品）
  $: otcThreshold = 12000;
  $: otcDeduction = Math.max(0, otc - otcThreshold);
  $: otcDeductionCapped = Math.min(otcDeduction, 88000); // 上限8.8万円

  // どちらが有利か
  $: recommendedType = standardDeductionCapped > otcDeductionCapped ? 'standard' : 'otc';
  $: maxDeduction = Math.max(standardDeductionCapped, otcDeductionCapped);

  // 還付金の概算（所得税率を簡易計算）
  $: taxRate = calculateTaxRate(income);
  $: estimatedRefund = maxDeduction * taxRate;

  // 申告すべきか
  $: shouldFile = maxDeduction > 0;

  function calculateTaxRate(income) {
    // 給与所得控除後の概算所得を計算
    let employmentDeduction = 0;
    if (income <= 1625000) {
      employmentDeduction = 550000;
    } else if (income <= 1800000) {
      employmentDeduction = income * 0.4 - 100000;
    } else if (income <= 3600000) {
      employmentDeduction = income * 0.3 + 80000;
    } else if (income <= 6600000) {
      employmentDeduction = income * 0.2 + 440000;
    } else if (income <= 8500000) {
      employmentDeduction = income * 0.1 + 1100000;
    } else {
      employmentDeduction = 1950000;
    }

    const taxableIncome = income - employmentDeduction - 480000; // 基礎控除

    // 所得税率（簡易）
    if (taxableIncome <= 1950000) return 0.05;
    if (taxableIncome <= 3300000) return 0.10;
    if (taxableIncome <= 6950000) return 0.20;
    if (taxableIncome <= 9000000) return 0.23;
    if (taxableIncome <= 18000000) return 0.33;
    return 0.40;
  }
</script>

<div class="calculator">
  <h2>💊 医療費控除計算</h2>
  <p class="description">医療費控除額と還付金の概算を計算</p>

  <div class="notice card">
    <h3>⚠️ ご注意</h3>
    <p>この計算は簡易的な概算です。実際の控除額は以下の要因により変動します：</p>
    <ul>
      <li>生計を一にする配偶者や親族の医療費も合算できます</li>
      <li>通院のための交通費も医療費に含まれます</li>
      <li>美容目的や予防接種は対象外です</li>
      <li>所得税率は各種控除により変動します</li>
    </ul>
    <p>正確な金額は税務署や税理士にご確認ください。</p>
  </div>

  <div class="card">
    <div class="input-group">
      <label for="annualIncome">年間所得（円）</label>
      <input
        id="annualIncome"
        type="number"
        bind:value={annualIncome}
        placeholder="例: 5000000"
        min="0"
        step="10000"
      />
      <small>給与収入の方は額面年収を入力</small>
    </div>

    <div class="input-group">
      <label for="medicalExpenses">年間医療費合計（円）</label>
      <input
        id="medicalExpenses"
        type="number"
        bind:value={medicalExpenses}
        placeholder="例: 150000"
        min="0"
        step="1000"
      />
      <small>病院・薬局での支払い総額</small>
    </div>

    <div class="input-group">
      <label for="insurancePayments">保険金等で補填された金額（円）<span class="optional">（任意）</span></label>
      <input
        id="insurancePayments"
        type="number"
        bind:value={insurancePayments}
        placeholder="例: 30000"
        min="0"
        step="1000"
      />
      <small>生命保険・医療保険の給付金など</small>
    </div>

    <div class="input-group">
      <label for="otcMedicines">OTC医薬品購入費（円）<span class="optional">（任意）</span></label>
      <input
        id="otcMedicines"
        type="number"
        bind:value={otcMedicines}
        placeholder="例: 20000"
        min="0"
        step="1000"
      />
      <small>セルフメディケーション税制対象のスイッチOTC医薬品</small>
    </div>
  </div>

  {#if income > 0 && (medical > 0 || otc > 0)}
    <div class="result">
      <div class="result-label">
        {#if shouldFile}
          申告することをおすすめします
        {:else}
          申告のメリットは少ないです
        {/if}
      </div>
      <div class="result-value">¥{Math.round(maxDeduction).toLocaleString()}</div>
      <div class="result-detail">
        {#if shouldFile}
          控除額（還付金の概算: 約¥{Math.round(estimatedRefund).toLocaleString()}）
        {:else}
          控除基準額に達していません
        {/if}
      </div>
    </div>

    <div class="breakdown card">
      <h3>💰 通常の医療費控除</h3>
      <div class="breakdown-item">
        <span>医療費合計</span>
        <span>¥{Math.round(medical).toLocaleString()}</span>
      </div>
      {#if insurance > 0}
        <div class="breakdown-item deduction">
          <span>保険金等で補填</span>
          <span>-¥{Math.round(insurance).toLocaleString()}</span>
        </div>
      {/if}
      <div class="breakdown-item">
        <span>実質医療費</span>
        <span>¥{Math.round(netMedicalExpenses).toLocaleString()}</span>
      </div>
      <div class="breakdown-item deduction">
        <span>控除基準額</span>
        <span>-¥{Math.round(threshold).toLocaleString()}</span>
      </div>
      <div class="breakdown-sub">
        <span>（10万円 または 所得の5%の少ない方）</span>
      </div>
      <div class="breakdown-item {standardDeductionCapped > 0 ? 'highlight' : ''}">
        <span>医療費控除額</span>
        <span>¥{Math.round(standardDeductionCapped).toLocaleString()}</span>
      </div>
    </div>

    {#if otc > 0}
      <div class="breakdown card">
        <h3>💊 セルフメディケーション税制</h3>
        <div class="breakdown-item">
          <span>OTC医薬品購入費</span>
          <span>¥{Math.round(otc).toLocaleString()}</span>
        </div>
        <div class="breakdown-item deduction">
          <span>控除基準額</span>
          <span>-¥{otcThreshold.toLocaleString()}</span>
        </div>
        <div class="breakdown-item {otcDeductionCapped > 0 ? 'highlight' : ''}">
          <span>セルフメディケーション控除額</span>
          <span>¥{Math.round(otcDeductionCapped).toLocaleString()}</span>
        </div>
      </div>
    {/if}

    {#if shouldFile && standardDeductionCapped > 0 && otcDeductionCapped > 0}
      <div class="recommendation card">
        <h3>📋 おすすめ</h3>
        <p>
          {#if recommendedType === 'standard'}
            <strong>通常の医療費控除</strong>の方が有利です（控除額: ¥{Math.round(standardDeductionCapped).toLocaleString()}）
          {:else}
            <strong>セルフメディケーション税制</strong>の方が有利です（控除額: ¥{Math.round(otcDeductionCapped).toLocaleString()}）
          {/if}
        </p>
        <p class="note">※ 両方を同時に適用することはできません</p>
      </div>
    {/if}

    {#if shouldFile}
      <div class="info-box card">
        <h3>💡 医療費控除のポイント</h3>
        <ul>
          <li><strong>対象期間</strong>: その年の1月1日〜12月31日に支払った医療費</li>
          <li><strong>対象者</strong>: 本人・配偶者・生計を一にする親族の医療費</li>
          <li><strong>対象となる費用</strong>:
            <ul>
              <li>病院・歯科の診療費・治療費</li>
              <li>医薬品の購入費</li>
              <li>通院のための交通費（公共交通機関）</li>
              <li>介護保険サービスの一部</li>
            </ul>
          </li>
          <li><strong>対象外の費用</strong>:
            <ul>
              <li>美容整形・予防接種</li>
              <li>健康診断（異常が見つからなかった場合）</li>
              <li>自家用車のガソリン代・駐車場代</li>
            </ul>
          </li>
          <li><strong>必要書類</strong>: 医療費の領収書・明細書（5年間保存）</li>
        </ul>
      </div>

      <div class="steps card">
        <h3>📝 申告の手順</h3>
        <ol>
          <li>
            <strong>領収書を集める</strong>
            <p>1年分の医療費の領収書を整理</p>
          </li>
          <li>
            <strong>医療費控除の明細書を作成</strong>
            <p>国税庁のホームページからダウンロード可能</p>
          </li>
          <li>
            <strong>確定申告書を作成</strong>
            <p>e-Taxまたは税務署に提出</p>
          </li>
          <li>
            <strong>還付金を受け取る</strong>
            <p>申告後、1〜2ヶ月程度で振込</p>
          </li>
        </ol>
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

  .recommendation {
    margin-top: 1rem;
    background: #e7f3ff;
    border: 1px solid #2196f3;
  }

  .recommendation h3 {
    color: #1565c0;
  }

  .recommendation p {
    color: #1565c0;
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .recommendation .note {
    font-size: 0.9rem;
    color: #1976d2;
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

  .info-box ul ul {
    margin-top: 0.5rem;
    padding-left: 1rem;
  }

  .info-box ul ul li::before {
    content: '−';
  }

  .steps {
    margin-top: 1rem;
  }

  .steps ol {
    padding-left: 1.5rem;
    margin: 0;
  }

  .steps li {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .steps li:last-child {
    margin-bottom: 0;
  }

  .steps strong {
    color: var(--primary-color);
    display: block;
    margin-bottom: 0.25rem;
  }

  .steps p {
    margin: 0;
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

    .recommendation {
      background: #1a2a3a;
      border-color: #2196f3;
    }

    .recommendation h3,
    .recommendation p {
      color: #64b5f6;
    }

    .recommendation .note {
      color: #42a5f5;
    }
  }
</style>
