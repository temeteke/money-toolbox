<script>
  let revenue = '';
  let rentExpense = '';
  let utilitiesExpense = '';
  let suppliesExpense = '';
  let communicationExpense = '';
  let transportationExpense = '';
  let entertainmentExpense = '';
  let advertisingExpense = '';
  let otherExpense = '';
  let blueReturnType = '65'; // '10', '55', '65', 'white'

  $: totalRevenue = parseFloat(revenue) || 0;
  $: rent = parseFloat(rentExpense) || 0;
  $: utilities = parseFloat(utilitiesExpense) || 0;
  $: supplies = parseFloat(suppliesExpense) || 0;
  $: communication = parseFloat(communicationExpense) || 0;
  $: transportation = parseFloat(transportationExpense) || 0;
  $: entertainment = parseFloat(entertainmentExpense) || 0;
  $: advertising = parseFloat(advertisingExpense) || 0;
  $: other = parseFloat(otherExpense) || 0;

  // 経費合計
  $: totalExpenses = rent + utilities + supplies + communication +
                     transportation + entertainment + advertising + other;

  // 青色申告特別控除額
  $: blueReturnDeduction = blueReturnType === 'white' ? 0 :
                           blueReturnType === '10' ? 100000 :
                           blueReturnType === '55' ? 550000 : 650000;

  // 事業所得
  $: businessIncome = Math.max(0, totalRevenue - totalExpenses);

  // 青色申告特別控除後の所得
  $: incomeAfterBlue = Math.max(0, businessIncome - blueReturnDeduction);

  // 所得税（簡易計算）
  $: incomeTax = calculateIncomeTax(incomeAfterBlue);

  // 住民税（所得割10% + 均等割）
  $: residentTax = incomeAfterBlue > 0 ? incomeAfterBlue * 0.1 + 5000 : 0;

  // 国民健康保険料（概算：所得の約10%）
  $: healthInsurance = incomeAfterBlue * 0.10;

  // 国民年金（2024年度：月額16,980円）
  $: nationalPension = 16980 * 12;

  // 税金・社会保険料合計
  $: totalTaxAndInsurance = incomeTax + residentTax + healthInsurance + nationalPension;

  // 手取り
  $: netIncome = businessIncome - totalTaxAndInsurance;

  // 経費率
  $: expenseRate = totalRevenue > 0 ? (totalExpenses / totalRevenue * 100) : 0;

  function calculateIncomeTax(income) {
    // 基礎控除
    const baseDeduction = 480000;

    // 課税所得
    const taxableIncome = Math.max(0, income - baseDeduction);

    // 所得税（累進課税）
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
</script>

<div class="calculator">
  <h2>📊 事業所得計算</h2>
  <p class="description">個人事業主・フリーランス向けの所得と税金を計算</p>

  <div class="notice card">
    <h3>⚠️ ご注意</h3>
    <p>この計算は簡易的な概算です。実際の納税額は以下の要因により変動します：</p>
    <ul>
      <li>各種控除（配偶者控除、扶養控除、社会保険料控除など）</li>
      <li>事業税（所得290万円超の場合）</li>
      <li>消費税（課税事業者の場合）</li>
      <li>国民健康保険料率の地域差</li>
    </ul>
    <p>正確な金額は税務署や税理士にご確認ください。</p>
  </div>

  <div class="card">
    <h3>💰 収入</h3>
    <div class="input-group">
      <label for="revenue">年間収入（売上）（円）</label>
      <input
        id="revenue"
        type="number"
        bind:value={revenue}
        placeholder="例: 6000000"
        min="0"
        step="10000"
      />
      <small>事業から得た収入の合計</small>
    </div>
  </div>

  <div class="card">
    <h3>📝 経費</h3>

    <div class="input-group">
      <label for="rentExpense">地代家賃（円）</label>
      <input
        id="rentExpense"
        type="number"
        bind:value={rentExpense}
        placeholder="例: 600000"
        min="0"
        step="1000"
      />
      <small>事務所・店舗の家賃</small>
    </div>

    <div class="input-group">
      <label for="utilitiesExpense">水道光熱費（円）</label>
      <input
        id="utilitiesExpense"
        type="number"
        bind:value={utilitiesExpense}
        placeholder="例: 120000"
        min="0"
        step="1000"
      />
      <small>電気・ガス・水道代</small>
    </div>

    <div class="input-group">
      <label for="suppliesExpense">消耗品費（円）</label>
      <input
        id="suppliesExpense"
        type="number"
        bind:value={suppliesExpense}
        placeholder="例: 200000"
        min="0"
        step="1000"
      />
      <small>文房具・パソコン（10万円未満）など</small>
    </div>

    <div class="input-group">
      <label for="communicationExpense">通信費（円）</label>
      <input
        id="communicationExpense"
        type="number"
        bind:value={communicationExpense}
        placeholder="例: 100000"
        min="0"
        step="1000"
      />
      <small>携帯電話・インターネット代</small>
    </div>

    <div class="input-group">
      <label for="transportationExpense">旅費交通費（円）</label>
      <input
        id="transportationExpense"
        type="number"
        bind:value={transportationExpense}
        placeholder="例: 150000"
        min="0"
        step="1000"
      />
      <small>電車・バス・タクシー代</small>
    </div>

    <div class="input-group">
      <label for="entertainmentExpense">接待交際費（円）</label>
      <input
        id="entertainmentExpense"
        type="number"
        bind:value={entertainmentExpense}
        placeholder="例: 80000"
        min="0"
        step="1000"
      />
      <small>取引先との飲食代など</small>
    </div>

    <div class="input-group">
      <label for="advertisingExpense">広告宣伝費（円）</label>
      <input
        id="advertisingExpense"
        type="number"
        bind:value={advertisingExpense}
        placeholder="例: 100000"
        min="0"
        step="1000"
      />
      <small>Web広告・チラシなど</small>
    </div>

    <div class="input-group">
      <label for="otherExpense">その他経費（円）</label>
      <input
        id="otherExpense"
        type="number"
        bind:value={otherExpense}
        placeholder="例: 150000"
        min="0"
        step="1000"
      />
      <small>雑費・外注費など</small>
    </div>
  </div>

  <div class="card">
    <h3>📘 申告区分</h3>
    <div class="input-group">
      <label for="blueReturnType">青色申告特別控除</label>
      <select id="blueReturnType" bind:value={blueReturnType}>
        <option value="white">白色申告（控除なし）</option>
        <option value="10">青色申告 10万円控除</option>
        <option value="55">青色申告 55万円控除</option>
        <option value="65">青色申告 65万円控除（e-Tax）</option>
      </select>
      <small>
        {#if blueReturnType === '65'}
          ※ e-Tax利用 + 複式簿記が必要
        {:else if blueReturnType === '55'}
          ※ 複式簿記が必要
        {:else if blueReturnType === '10'}
          ※ 簡易帳簿でOK
        {:else}
          ※ 青色申告の承認が必要です
        {/if}
      </small>
    </div>
  </div>

  {#if totalRevenue > 0}
    <div class="result">
      <div class="result-label">事業所得</div>
      <div class="result-value">¥{Math.round(businessIncome).toLocaleString()}</div>
      <div class="result-detail">経費率: {expenseRate.toFixed(1)}%</div>
    </div>

    <div class="breakdown card">
      <h3>💰 所得の内訳</h3>
      <div class="breakdown-item">
        <span>年間収入（売上）</span>
        <span>¥{Math.round(totalRevenue).toLocaleString()}</span>
      </div>
      <div class="breakdown-item deduction">
        <span>必要経費</span>
        <span>-¥{Math.round(totalExpenses).toLocaleString()}</span>
      </div>
      <div class="breakdown-item subtotal">
        <span>事業所得（経費控除後）</span>
        <span>¥{Math.round(businessIncome).toLocaleString()}</span>
      </div>
      {#if blueReturnDeduction > 0}
        <div class="breakdown-item deduction">
          <span>青色申告特別控除</span>
          <span>-¥{blueReturnDeduction.toLocaleString()}</span>
        </div>
        <div class="breakdown-item highlight">
          <span>課税対象所得（青色控除後）</span>
          <span>¥{Math.round(incomeAfterBlue).toLocaleString()}</span>
        </div>
      {/if}
    </div>

    <div class="breakdown card">
      <h3>📋 経費の内訳</h3>
      {#if rent > 0}
        <div class="breakdown-item">
          <span>地代家賃</span>
          <span>¥{Math.round(rent).toLocaleString()}</span>
        </div>
      {/if}
      {#if utilities > 0}
        <div class="breakdown-item">
          <span>水道光熱費</span>
          <span>¥{Math.round(utilities).toLocaleString()}</span>
        </div>
      {/if}
      {#if supplies > 0}
        <div class="breakdown-item">
          <span>消耗品費</span>
          <span>¥{Math.round(supplies).toLocaleString()}</span>
        </div>
      {/if}
      {#if communication > 0}
        <div class="breakdown-item">
          <span>通信費</span>
          <span>¥{Math.round(communication).toLocaleString()}</span>
        </div>
      {/if}
      {#if transportation > 0}
        <div class="breakdown-item">
          <span>旅費交通費</span>
          <span>¥{Math.round(transportation).toLocaleString()}</span>
        </div>
      {/if}
      {#if entertainment > 0}
        <div class="breakdown-item">
          <span>接待交際費</span>
          <span>¥{Math.round(entertainment).toLocaleString()}</span>
        </div>
      {/if}
      {#if advertising > 0}
        <div class="breakdown-item">
          <span>広告宣伝費</span>
          <span>¥{Math.round(advertising).toLocaleString()}</span>
        </div>
      {/if}
      {#if other > 0}
        <div class="breakdown-item">
          <span>その他経費</span>
          <span>¥{Math.round(other).toLocaleString()}</span>
        </div>
      {/if}
      <div class="breakdown-item total">
        <span>経費合計</span>
        <span>¥{Math.round(totalExpenses).toLocaleString()}</span>
      </div>
    </div>

    <div class="breakdown card">
      <h3>💴 税金・社会保険料（概算）</h3>
      <div class="breakdown-item">
        <span>所得税</span>
        <span>¥{Math.round(incomeTax).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>住民税</span>
        <span>¥{Math.round(residentTax).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>国民健康保険料（概算）</span>
        <span>¥{Math.round(healthInsurance).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>国民年金</span>
        <span>¥{Math.round(nationalPension).toLocaleString()}</span>
      </div>
      <div class="breakdown-item total-deduction">
        <span>税金・社会保険料 合計</span>
        <span>¥{Math.round(totalTaxAndInsurance).toLocaleString()}</span>
      </div>
      <div class="breakdown-item highlight">
        <span>手取り（概算）</span>
        <span>¥{Math.round(netIncome).toLocaleString()}</span>
      </div>
    </div>

    <div class="info-box card">
      <h3>💡 青色申告のメリット</h3>
      <ul>
        <li><strong>特別控除</strong>: 最大65万円の所得控除</li>
        <li><strong>赤字の繰越</strong>: 最大3年間繰り越し可能</li>
        <li><strong>家族への給与</strong>: 専従者給与を必要経費にできる</li>
        <li><strong>30万円未満の資産</strong>: 一括経費計上が可能</li>
      </ul>
    </div>

    <div class="info-box card">
      <h3>📝 経費にできるもの・できないもの</h3>
      <div class="expense-guide">
        <div class="guide-section">
          <h4>✓ 経費にできるもの</h4>
          <ul>
            <li>事業に直接必要な支出</li>
            <li>仕事用の設備・備品</li>
            <li>取引先との交際費</li>
            <li>事業用車両の費用</li>
            <li>自宅兼事務所の家賃（按分）</li>
          </ul>
        </div>
        <div class="guide-section">
          <h4>✗ 経費にできないもの</h4>
          <ul>
            <li>私的な支出</li>
            <li>所得税・住民税</li>
            <li>生命保険料（控除対象）</li>
            <li>事業主本人の給与</li>
            <li>罰金・延滞税</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="steps card">
      <h3>📋 確定申告の手順</h3>
      <ol>
        <li>
          <strong>帳簿をつける</strong>
          <p>収入と経費を日々記録（会計ソフト推奨）</p>
        </li>
        <li>
          <strong>決算書を作成</strong>
          <p>青色申告決算書または収支内訳書</p>
        </li>
        <li>
          <strong>確定申告書を作成</strong>
          <p>e-Taxまたは税務署に提出（期限: 2月16日〜3月15日）</p>
        </li>
        <li>
          <strong>納税する</strong>
          <p>所得税を期限までに納付</p>
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

  h4 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
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

  .breakdown-item.subtotal {
    font-weight: 600;
    padding-top: 1rem;
    border-top: 2px solid var(--border-color);
  }

  .breakdown-item.total {
    font-weight: 600;
    padding-top: 1rem;
    border-top: 2px solid var(--border-color);
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

  .expense-guide {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .guide-section ul {
    margin-top: 0.5rem;
  }

  .guide-section ul li::before {
    content: '•';
    color: var(--text-secondary);
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
    .expense-guide {
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
