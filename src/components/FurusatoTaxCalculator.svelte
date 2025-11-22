<script>
  let annualIncome = '';
  let familyType = 'single'; // 'single', 'married', 'married-dependent'
  let dependents = '0';

  $: income = parseFloat(annualIncome) || 0;
  $: numDependents = parseInt(dependents) || 0;

  // 給与所得控除
  $: employmentDeduction = calculateEmploymentDeduction(income);

  // 給与所得
  $: employmentIncome = income - employmentDeduction;

  // 所得控除
  $: deductions = calculateDeductions(familyType, numDependents);

  // 課税所得
  $: taxableIncome = Math.max(0, employmentIncome - deductions);

  // 住民税所得割額
  $: residentTaxIncome = taxableIncome * 0.1;

  // ふるさと納税上限額の計算
  $: limit = calculateFurusatoLimit(residentTaxIncome, income);

  // 実質負担2,000円で寄付できる最大額
  $: maxDonation = limit;

  // 返礼品の価値（寄付額の30%と仮定）
  $: returnGiftValue = maxDonation * 0.3;

  // 実質的な得
  $: netBenefit = returnGiftValue - 2000;

  function calculateEmploymentDeduction(income) {
    if (income <= 1625000) {
      return 550000;
    } else if (income <= 1800000) {
      return income * 0.4 - 100000;
    } else if (income <= 3600000) {
      return income * 0.3 + 80000;
    } else if (income <= 6600000) {
      return income * 0.2 + 440000;
    } else if (income <= 8500000) {
      return income * 0.1 + 1100000;
    } else {
      return 1950000;
    }
  }

  function calculateDeductions(familyType, dependents) {
    // 基礎控除（住民税）
    let baseDeduction = 430000;

    // 配偶者控除
    let spouseDeduction = 0;
    if (familyType === 'married' || familyType === 'married-dependent') {
      spouseDeduction = 330000;
    }

    // 扶養控除
    let dependentDeduction = dependents * 330000;

    return baseDeduction + spouseDeduction + dependentDeduction;
  }

  function calculateFurusatoLimit(residentTaxIncome, income) {
    // 住民税所得割額の20%が基本
    const basicLimit = residentTaxIncome * 0.2;

    // 所得税率に応じた調整（簡易計算）
    let incomeTaxRate = 0.05;
    if (income > 9500000) {
      incomeTaxRate = 0.33;
    } else if (income > 7000000) {
      incomeTaxRate = 0.23;
    } else if (income > 3300000) {
      incomeTaxRate = 0.2;
    } else if (income > 1950000) {
      incomeTaxRate = 0.1;
    }

    // ふるさと納税上限額
    const limit = (basicLimit / (1 - incomeTaxRate - 0.1)) + 2000;

    return Math.max(0, limit);
  }
</script>

<div class="calculator">
  <h2>🎁 ふるさと納税シミュレーター</h2>
  <p class="description">年収から控除上限額を計算</p>

  <div class="notice card">
    <h3>⚠️ ご注意</h3>
    <p>この計算は簡易的な概算です。実際の控除上限額は以下の要因により変動します：</p>
    <ul>
      <li>医療費控除、住宅ローン控除などの各種控除</li>
      <li>前年の所得や社会保険料</li>
      <li>iDeCoなどの個人年金掛金</li>
    </ul>
    <p>正確な金額はふるさと納税ポータルサイトのシミュレーターや税理士にご確認ください。</p>
  </div>

  <div class="card">
    <div class="input-group">
      <label for="annualIncome">年収（給与収入）（円）</label>
      <input
        id="annualIncome"
        type="number"
        bind:value={annualIncome}
        placeholder="例: 5000000"
        min="0"
        step="10000"
      />
      <small>額面年収を入力してください</small>
    </div>

    <div class="input-group">
      <label for="familyType">家族構成</label>
      <select id="familyType" bind:value={familyType}>
        <option value="single">独身・共働き</option>
        <option value="married">夫婦（配偶者控除なし）</option>
        <option value="married-dependent">夫婦（配偶者控除あり）</option>
      </select>
    </div>

    <div class="input-group">
      <label for="dependents">扶養家族の人数<span class="optional">（任意）</span></label>
      <input
        id="dependents"
        type="number"
        bind:value={dependents}
        placeholder="例: 0"
        min="0"
        step="1"
      />
      <small>16歳以上の扶養家族（配偶者を除く）</small>
    </div>
  </div>

  {#if income > 0}
    <div class="result">
      <div class="result-label">控除上限額（目安）</div>
      <div class="result-value">¥{Math.round(maxDonation).toLocaleString()}</div>
      <div class="result-detail">実質負担2,000円</div>
    </div>

    <div class="breakdown card">
      <h3>💰 ふるさと納税の効果</h3>
      <div class="breakdown-item">
        <span>寄付上限額</span>
        <span>¥{Math.round(maxDonation).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>自己負担額</span>
        <span>¥2,000</span>
      </div>
      <div class="breakdown-item">
        <span>税金控除額</span>
        <span>¥{Math.round(maxDonation - 2000).toLocaleString()}</span>
      </div>
      <div class="breakdown-item success">
        <span>返礼品の価値（30%換算）</span>
        <span>約¥{Math.round(returnGiftValue).toLocaleString()}</span>
      </div>
      <div class="breakdown-item highlight">
        <span>実質的な得</span>
        <span>約¥{Math.round(netBenefit).toLocaleString()}</span>
      </div>
    </div>

    <div class="examples card">
      <h3>📊 寄付額の例</h3>
      <div class="example-grid">
        {#each [0.25, 0.5, 0.75, 1.0] as ratio}
          {@const amount = maxDonation * ratio}
          {@const giftValue = amount * 0.3}
          <div class="example-item">
            <div class="example-amount">¥{Math.round(amount).toLocaleString()}</div>
            <div class="example-label">寄付額（{(ratio * 100).toFixed(0)}%）</div>
            <div class="example-gift">返礼品: 約¥{Math.round(giftValue).toLocaleString()}</div>
          </div>
        {/each}
      </div>
    </div>

    <div class="info-box card">
      <h3>💡 ふるさと納税のポイント</h3>
      <ul>
        <li><strong>ワンストップ特例制度</strong>: 5自治体以内なら確定申告不要</li>
        <li><strong>申込期限</strong>: その年の12月31日まで（支払い完了が必要）</li>
        <li><strong>控除の時期</strong>:
          <ul>
            <li>所得税: 確定申告後に還付</li>
            <li>住民税: 翌年6月から控除</li>
          </ul>
        </li>
        <li><strong>返礼品</strong>: 寄付額の30%以内が基準</li>
        <li><strong>おすすめ</strong>: 複数の自治体に分散して寄付すると、様々な返礼品が楽しめます</li>
      </ul>
    </div>

    <div class="steps card">
      <h3>📝 ふるさと納税の手順</h3>
      <ol>
        <li>
          <strong>控除上限額を確認</strong>
          <p>このシミュレーターで目安を確認</p>
        </li>
        <li>
          <strong>寄付先を選ぶ</strong>
          <p>ふるさと納税サイトで自治体と返礼品を選択</p>
        </li>
        <li>
          <strong>寄付を申し込む</strong>
          <p>クレジットカードや銀行振込で支払い</p>
        </li>
        <li>
          <strong>控除手続き</strong>
          <p>ワンストップ特例申請または確定申告</p>
        </li>
        <li>
          <strong>返礼品を受け取る</strong>
          <p>寄付後、数週間〜数ヶ月で到着</p>
        </li>
      </ol>
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

  .breakdown-item.success {
    color: var(--success);
    font-weight: 600;
  }

  .breakdown-item.highlight {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1.1rem;
    padding-top: 1rem;
    border-top: 2px solid var(--border-color);
  }

  .examples {
    margin-top: 1rem;
  }

  .example-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .example-item {
    padding: 1rem;
    background: var(--background);
    border-radius: 8px;
    text-align: center;
  }

  .example-amount {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: 0.25rem;
  }

  .example-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .example-gift {
    font-size: 0.9rem;
    color: var(--success);
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

  @media (max-width: 640px) {
    .example-grid {
      grid-template-columns: 1fr;
    }
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
