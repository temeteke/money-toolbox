<script>
  // 現在の状況
  let currentAssets = '';
  let annualIncome = '';
  let annualExpenses = '';
  let monthlySavings = '';

  // FIRE目標
  let targetAnnualExpenses = '';
  let withdrawalRate = '4.0'; // 4%ルール
  let expectedReturn = '5.0'; // 想定リターン
  let inflationRate = '2.0'; // インフレ率

  $: assets = parseFloat(currentAssets) || 0;
  $: income = parseFloat(annualIncome) || 0;
  $: expenses = parseFloat(annualExpenses) || 0;
  $: savings = parseFloat(monthlySavings) || 0;
  $: annualSavings = savings * 12;

  $: targetExpenses = parseFloat(targetAnnualExpenses) || expenses;
  $: withdrawal = parseFloat(withdrawalRate) || 4.0;
  $: returnRate = parseFloat(expectedReturn) || 5.0;
  $: inflation = parseFloat(inflationRate) || 2.0;

  // FIRE達成に必要な資産額（4%ルール）
  $: targetAssets = withdrawal > 0 ? (targetExpenses / (withdrawal / 100)) : 0;

  // 不足額
  $: shortfall = targetAssets - assets;

  // 実質リターン（インフレ調整後）
  $: realReturn = returnRate - inflation;

  // 達成までの年数計算（積立投資の複利計算）
  $: yearsToFIRE = calculateYearsToFIRE(assets, annualSavings, targetAssets, realReturn);

  // 現在の貯蓄率
  $: savingsRate = income > 0 ? ((annualSavings / income) * 100) : 0;

  // FIRE後の年数（資産寿命）
  $: sustainableYears = withdrawal > 0 ? Math.floor(100 / withdrawal) : 0;

  function calculateYearsToFIRE(currentAssets, annualSavings, targetAssets, returnRate) {
    if (currentAssets >= targetAssets) return 0;
    if (annualSavings <= 0) return Infinity;
    if (returnRate <= 0) {
      // リターンがない場合は単純計算
      return (targetAssets - currentAssets) / annualSavings;
    }

    // 複利計算で逆算
    const rate = returnRate / 100;
    let years = 0;
    let balance = currentAssets;

    while (balance < targetAssets && years < 100) {
      balance = balance * (1 + rate) + annualSavings;
      years++;
    }

    return years;
  }

  // FIREタイプの判定
  $: fireType = savingsRate >= 75 ? 'Lean FIRE（極限の節約）'
    : savingsRate >= 50 ? 'FIRE（標準的な経済的自立）'
    : savingsRate >= 25 ? 'Barista FIRE（セミリタイア）'
    : 'Coast FIRE（ゆるい自立）';
</script>

<div class="calculator">
  <h2>🔥 FIRE計算機</h2>
  <p class="description">経済的自立（Financial Independence, Retire Early）達成までの道のりをシミュレーション</p>

  <div class="section">
    <h3>💰 現在の状況</h3>
    <div class="card">
      <div class="input-group">
        <label for="currentAssets">現在の資産（円）</label>
        <input
          id="currentAssets"
          type="number"
          bind:value={currentAssets}
          placeholder="例: 5000000"
          min="0"
          step="100000"
        />
      </div>

      <div class="input-row">
        <div class="input-group">
          <label for="annualIncome">年収（円）</label>
          <input
            id="annualIncome"
            type="number"
            bind:value={annualIncome}
            placeholder="例: 6000000"
            min="0"
            step="100000"
          />
        </div>

        <div class="input-group">
          <label for="annualExpenses">年間支出（円）</label>
          <input
            id="annualExpenses"
            type="number"
            bind:value={annualExpenses}
            placeholder="例: 3000000"
            min="0"
            step="100000"
          />
        </div>
      </div>

      <div class="input-group">
        <label for="monthlySavings">月間貯蓄額（円）</label>
        <input
          id="monthlySavings"
          type="number"
          bind:value={monthlySavings}
          placeholder="例: 200000"
          min="0"
          step="10000"
        />
        <small>投資・貯金に回せる金額（年間 {annualSavings.toLocaleString()}円）</small>
      </div>
    </div>
  </div>

  <div class="section">
    <h3>🎯 FIRE目標設定</h3>
    <div class="card">
      <div class="input-group">
        <label for="targetAnnualExpenses">FIRE後の年間生活費（円）</label>
        <input
          id="targetAnnualExpenses"
          type="number"
          bind:value={targetAnnualExpenses}
          placeholder="例: 3000000"
          min="0"
          step="100000"
        />
        <small>リタイア後に必要な年間支出額</small>
      </div>

      <div class="input-row">
        <div class="input-group">
          <label for="withdrawalRate">引き出し率（%）</label>
          <input
            id="withdrawalRate"
            type="number"
            bind:value={withdrawalRate}
            placeholder="4.0"
            min="0"
            step="0.1"
          />
          <small>通常4%（25年分の資産）</small>
        </div>

        <div class="input-group">
          <label for="expectedReturn">想定リターン（%）</label>
          <input
            id="expectedReturn"
            type="number"
            bind:value={expectedReturn}
            placeholder="5.0"
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <div class="input-group">
        <label for="inflationRate">インフレ率（%）</label>
        <input
          id="inflationRate"
          type="number"
          bind:value={inflationRate}
          placeholder="2.0"
          min="0"
          step="0.1"
        />
        <small>実質リターン: {realReturn.toFixed(1)}%</small>
      </div>
    </div>
  </div>

  {#if targetAssets > 0}
    <div class="result">
      <div class="result-label">FIRE達成に必要な資産</div>
      <div class="result-value">¥{Math.round(targetAssets).toLocaleString()}</div>
      <div class="result-detail">
        年間 ¥{targetExpenses.toLocaleString()} の生活費 × {(100 / withdrawal).toFixed(0)}年分
      </div>
    </div>

    {#if shortfall > 0}
      <div class="progress-card card">
        <h3>📊 達成状況</h3>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: {Math.min((assets / targetAssets) * 100, 100)}%"></div>
        </div>
        <div class="progress-info">
          <span>現在の資産: ¥{assets.toLocaleString()}</span>
          <span>{((assets / targetAssets) * 100).toFixed(1)}%</span>
        </div>
        <div class="shortfall-info">
          不足額: <strong>¥{Math.round(shortfall).toLocaleString()}</strong>
        </div>
      </div>

      {#if annualSavings > 0 && yearsToFIRE < Infinity}
        <div class="timeline card">
          <h3>⏱️ 達成までの道のり</h3>
          <div class="timeline-item">
            <div class="timeline-label">達成までの年数</div>
            <div class="timeline-value highlight">
              {#if yearsToFIRE < 1}
                1年未満
              {:else}
                約{Math.ceil(yearsToFIRE)}年
              {/if}
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-label">達成予定年</div>
            <div class="timeline-value">
              {new Date().getFullYear() + Math.ceil(yearsToFIRE)}年
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-label">月間積立額</div>
            <div class="timeline-value">¥{savings.toLocaleString()}</div>
          </div>
          <div class="timeline-item">
            <div class="timeline-label">貯蓄率</div>
            <div class="timeline-value">{savingsRate.toFixed(1)}%</div>
          </div>
        </div>
      {:else}
        <div class="warning-box card">
          <h3>⚠️ 注意</h3>
          <p>現在の貯蓄ペースでは目標達成が困難です。以下を検討してください：</p>
          <ul>
            <li>月間貯蓄額を増やす（収入アップ・支出削減）</li>
            <li>目標生活費を見直す</li>
            <li>想定リターンを調整する</li>
          </ul>
        </div>
      {/if}
    {:else}
      <div class="success-box card">
        <h3>🎉 おめでとうございます！</h3>
        <p>既にFIRE達成に必要な資産額に到達しています。</p>
        <p>年間 ¥{targetExpenses.toLocaleString()} の生活費を、{withdrawal}%の引き出し率で賄うことができます。</p>
      </div>
    {/if}

    <div class="info-box card">
      <h3>💡 FIRE情報</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">FIREタイプ</div>
          <div class="info-value">{fireType}</div>
        </div>
        <div class="info-item">
          <div class="info-label">4%ルール</div>
          <div class="info-value">{(100 / withdrawal).toFixed(0)}年分の資産</div>
        </div>
        <div class="info-item">
          <div class="info-label">想定資産寿命</div>
          <div class="info-value">
            {#if sustainableYears >= 100}
              ほぼ永続的
            {:else}
              約{sustainableYears}年以上
            {/if}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">実質リターン</div>
          <div class="info-value">{realReturn.toFixed(1)}%</div>
        </div>
      </div>

      <div class="tips">
        <h4>📚 FIREの基本原則</h4>
        <ul>
          <li><strong>4%ルール</strong>: 年間支出の25倍の資産があれば、資産を減らさずに生活できる</li>
          <li><strong>貯蓄率</strong>: 高い貯蓄率ほど早くFIRE達成できる</li>
          <li><strong>支出の最適化</strong>: 収入を増やすより支出を減らす方が効果的</li>
          <li><strong>分散投資</strong>: リスクを抑えつつ安定したリターンを目指す</li>
        </ul>
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

  h4 {
    font-size: 1rem;
    margin: 1rem 0 0.5rem;
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

  .progress-card {
    margin-top: 1.5rem;
  }

  .progress-bar-container {
    width: 100%;
    height: 30px;
    background: var(--surface);
    border-radius: 15px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    transition: width 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0.75rem;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .shortfall-info {
    text-align: center;
    padding: 0.75rem;
    background: var(--background);
    border-radius: 4px;
    margin-top: 0.75rem;
  }

  .shortfall-info strong {
    color: var(--primary-color);
    font-size: 1.1rem;
  }

  .timeline {
    margin-top: 1rem;
  }

  .timeline-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  .timeline-item:last-child {
    border-bottom: none;
  }

  .timeline-label {
    color: var(--text-secondary);
  }

  .timeline-value {
    font-weight: 600;
    color: var(--text-primary);
  }

  .timeline-value.highlight {
    color: var(--primary-color);
    font-size: 1.2rem;
  }

  .success-box,
  .warning-box {
    margin-top: 1rem;
  }

  .success-box {
    background: var(--background);
    border: 2px solid var(--success);
  }

  .success-box h3 {
    color: var(--success);
  }

  .warning-box {
    background: var(--background);
    border: 1px solid var(--error);
  }

  .warning-box h3 {
    color: var(--error);
  }

  .warning-box ul,
  .tips ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .warning-box li,
  .tips li {
    margin-bottom: 0.5rem;
  }

  .success-box p,
  .warning-box p {
    margin-bottom: 0.75rem;
    line-height: 1.6;
  }

  .info-box {
    margin-top: 1.5rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .info-item {
    padding: 1rem;
    background: var(--surface);
    border-radius: 4px;
    text-align: center;
  }

  .info-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .info-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--primary-color);
  }

  .tips {
    padding: 1rem;
    background: var(--background);
    border-radius: 4px;
  }

  .tips ul {
    line-height: 1.8;
  }

  @media (max-width: 640px) {
    .input-row {
      grid-template-columns: 1fr;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
