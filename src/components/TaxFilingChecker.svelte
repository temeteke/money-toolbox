<script>
  let employmentStatus = 'employee'; // 'employee', 'self-employed', 'both'
  let annualSalary = '';
  let sideIncome = '';
  let medicalExpenses = '';
  let donationAmount = '';
  let housingLoanBalance = '';
  let isFirstYearHousingLoan = false;
  let hasMultipleJobs = false;
  let hasStockGains = false;
  let stockGainAmount = '';
  let quitJob = false;

  $: salary = parseFloat(annualSalary) || 0;
  $: sideIncomeAmount = parseFloat(sideIncome) || 0;
  $: medical = parseFloat(medicalExpenses) || 0;
  $: donation = parseFloat(donationAmount) || 0;
  $: housingLoan = parseFloat(housingLoanBalance) || 0;
  $: stockGain = parseFloat(stockGainAmount) || 0;

  // 確定申告が必要かどうかの判定
  $: filingRequired = checkFilingRequired();
  $: filingRecommended = checkFilingRecommended();
  $: reasons = getReasons();

  function checkFilingRequired() {
    // 個人事業主は必須
    if (employmentStatus === 'self-employed') {
      return true;
    }

    // 給与所得者で以下の条件に該当する場合は必須
    if (employmentStatus === 'employee' || employmentStatus === 'both') {
      // 給与収入が2,000万円超
      if (salary > 20000000) {
        return true;
      }

      // 給与所得と退職所得以外の所得が20万円超
      if (sideIncomeAmount > 200000) {
        return true;
      }

      // 2か所以上から給与をもらっている
      if (hasMultipleJobs) {
        return true;
      }

      // 住宅ローン控除の初年度
      if (isFirstYearHousingLoan && housingLoan > 0) {
        return true;
      }

      // 年の途中で退職して年末調整を受けていない
      if (quitJob) {
        return true;
      }
    }

    return false;
  }

  function checkFilingRecommended() {
    // 必須の場合はfalse（おすすめではなく必須）
    if (filingRequired) {
      return false;
    }

    // 医療費控除が受けられる可能性
    const medicalThreshold = Math.min(100000, salary * 0.05);
    if (medical > medicalThreshold) {
      return true;
    }

    // 寄附金控除（ふるさと納税など）
    if (donation > 2000) {
      return true;
    }

    // 住宅ローン控除（2年目以降）
    if (!isFirstYearHousingLoan && housingLoan > 0) {
      return true;
    }

    return false;
  }

  function getReasons() {
    const reasons = [];

    if (employmentStatus === 'self-employed') {
      reasons.push({
        type: 'required',
        icon: '⚠️',
        title: '個人事業主・フリーランス',
        description: '事業所得がある方は確定申告が必要です'
      });
    }

    if (salary > 20000000) {
      reasons.push({
        type: 'required',
        icon: '⚠️',
        title: '給与収入2,000万円超',
        description: '年末調整の対象外となるため確定申告が必要です'
      });
    }

    if (sideIncomeAmount > 200000) {
      reasons.push({
        type: 'required',
        icon: '⚠️',
        title: '副業所得20万円超',
        description: '給与所得以外の所得が20万円を超える場合は申告が必要です'
      });
    }

    if (hasMultipleJobs) {
      reasons.push({
        type: 'required',
        icon: '⚠️',
        title: '複数の勤務先',
        description: '2か所以上から給与を受けている場合は申告が必要です'
      });
    }

    if (isFirstYearHousingLoan && housingLoan > 0) {
      reasons.push({
        type: 'required',
        icon: '⚠️',
        title: '住宅ローン控除（初年度）',
        description: '初年度は確定申告が必須です（2年目以降は年末調整でOK）'
      });
    }

    if (quitJob) {
      reasons.push({
        type: 'required',
        icon: '⚠️',
        title: '年の途中で退職',
        description: '年末調整を受けていない場合は確定申告で還付を受けられます'
      });
    }

    const medicalThreshold = Math.min(100000, salary * 0.05);
    if (medical > medicalThreshold && !filingRequired) {
      const deduction = medical - medicalThreshold;
      reasons.push({
        type: 'recommended',
        icon: '💊',
        title: '医療費控除',
        description: `約¥${Math.round(deduction).toLocaleString()}の控除が受けられる可能性があります`
      });
    }

    if (donation > 2000 && !filingRequired) {
      reasons.push({
        type: 'recommended',
        icon: '🎁',
        title: '寄附金控除',
        description: 'ふるさと納税などの寄附金控除が受けられます'
      });
    }

    if (!isFirstYearHousingLoan && housingLoan > 0 && !filingRequired) {
      reasons.push({
        type: 'recommended',
        icon: '🏠',
        title: '住宅ローン控除（2年目以降）',
        description: '年末調整で処理されていない場合は確定申告が必要です'
      });
    }

    if (hasStockGains && stockGain > 0) {
      reasons.push({
        type: 'info',
        icon: '📈',
        title: '株式等の譲渡所得',
        description: '特定口座（源泉徴収あり）以外の場合は申告が必要な場合があります'
      });
    }

    return reasons;
  }

  $: requiredReasons = reasons.filter(r => r.type === 'required');
  $: recommendedReasons = reasons.filter(r => r.type === 'recommended');
  $: infoReasons = reasons.filter(r => r.type === 'info');
</script>

<div class="calculator">
  <h2>✅ 確定申告必要性チェッカー</h2>
  <p class="description">あなたに確定申告が必要か診断します</p>

  <div class="notice card">
    <h3>⚠️ ご注意</h3>
    <p>この診断は一般的なケースに基づく簡易的な判定です。個別の状況により判断が異なる場合があります。詳細は税務署や税理士にご確認ください。</p>
  </div>

  <div class="card">
    <h3>💼 雇用形態</h3>
    <div class="input-group">
      <label for="employmentStatus">あなたの雇用状態は？</label>
      <select id="employmentStatus" bind:value={employmentStatus}>
        <option value="employee">会社員・パート・アルバイト</option>
        <option value="self-employed">個人事業主・フリーランス</option>
        <option value="both">会社員 + 副業（個人事業）</option>
      </select>
    </div>

    {#if employmentStatus === 'employee' || employmentStatus === 'both'}
      <div class="input-group">
        <label for="annualSalary">年間給与収入（円）</label>
        <input
          id="annualSalary"
          type="number"
          bind:value={annualSalary}
          placeholder="例: 5000000"
          min="0"
          step="10000"
        />
        <small>源泉徴収票の「支払金額」</small>
      </div>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" bind:checked={hasMultipleJobs} />
          2か所以上から給与を受けている
        </label>
      </div>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" bind:checked={quitJob} />
          年の途中で退職した（年末調整を受けていない）
        </label>
      </div>
    {/if}

    {#if employmentStatus === 'employee' || employmentStatus === 'both'}
      <div class="input-group">
        <label for="sideIncome">副業・その他の所得（円）<span class="optional">（任意）</span></label>
        <input
          id="sideIncome"
          type="number"
          bind:value={sideIncome}
          placeholder="例: 150000"
          min="0"
          step="1000"
        />
        <small>給与以外の所得（経費差引後）</small>
      </div>
    {/if}
  </div>

  <div class="card">
    <h3>🏥 控除・還付に関する項目</h3>

    <div class="input-group">
      <label for="medicalExpenses">年間医療費（円）<span class="optional">（任意）</span></label>
      <input
        id="medicalExpenses"
        type="number"
        bind:value={medicalExpenses}
        placeholder="例: 150000"
        min="0"
        step="1000"
      />
      <small>本人・家族の医療費合計</small>
    </div>

    <div class="input-group">
      <label for="donationAmount">寄附金額（円）<span class="optional">（任意）</span></label>
      <input
        id="donationAmount"
        type="number"
        bind:value={donationAmount}
        placeholder="例: 30000"
        min="0"
        step="1000"
      />
      <small>ふるさと納税など</small>
    </div>

    <div class="input-group">
      <label for="housingLoanBalance">住宅ローン残高（円）<span class="optional">（任意）</span></label>
      <input
        id="housingLoanBalance"
        type="number"
        bind:value={housingLoanBalance}
        placeholder="例: 30000000"
        min="0"
        step="100000"
      />
      <small>住宅ローン控除を受ける場合</small>
    </div>

    {#if housingLoan > 0}
      <div class="checkbox-group">
        <label>
          <input type="checkbox" bind:checked={isFirstYearHousingLoan} />
          住宅ローン控除の初年度
        </label>
      </div>
    {/if}

    <div class="checkbox-group">
      <label>
        <input type="checkbox" bind:checked={hasStockGains} />
        株式等の譲渡所得がある
      </label>
    </div>

    {#if hasStockGains}
      <div class="input-group">
        <label for="stockGainAmount">譲渡益（円）<span class="optional">（任意）</span></label>
        <input
          id="stockGainAmount"
          type="number"
          bind:value={stockGainAmount}
          placeholder="例: 500000"
          min="0"
          step="10000"
        />
        <small>特定口座（源泉徴収なし）・一般口座の場合</small>
      </div>
    {/if}
  </div>

  <div class="result {filingRequired ? 'required' : filingRecommended ? 'recommended' : 'not-required'}">
    <div class="result-icon">
      {#if filingRequired}
        ⚠️
      {:else if filingRecommended}
        💡
      {:else}
        ✓
      {/if}
    </div>
    <div class="result-content">
      <div class="result-label">
        {#if filingRequired}
          確定申告が必要です
        {:else if filingRecommended}
          確定申告をおすすめします
        {:else}
          確定申告は不要です
        {/if}
      </div>
      <div class="result-description">
        {#if filingRequired}
          法律により確定申告が義務付けられています
        {:else if filingRecommended}
          申告することで税金の還付を受けられる可能性があります
        {:else}
          現在の情報では確定申告の必要はありません
        {/if}
      </div>
    </div>
  </div>

  {#if requiredReasons.length > 0}
    <div class="reasons-section card required-section">
      <h3>⚠️ 申告が必要な理由</h3>
      {#each requiredReasons as reason}
        <div class="reason-item">
          <div class="reason-icon">{reason.icon}</div>
          <div class="reason-content">
            <div class="reason-title">{reason.title}</div>
            <div class="reason-description">{reason.description}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if recommendedReasons.length > 0}
    <div class="reasons-section card recommended-section">
      <h3>💡 申告をおすすめする理由</h3>
      {#each recommendedReasons as reason}
        <div class="reason-item">
          <div class="reason-icon">{reason.icon}</div>
          <div class="reason-content">
            <div class="reason-title">{reason.title}</div>
            <div class="reason-description">{reason.description}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if infoReasons.length > 0}
    <div class="reasons-section card info-section">
      <h3>📌 確認が必要な項目</h3>
      {#each infoReasons as reason}
        <div class="reason-item">
          <div class="reason-icon">{reason.icon}</div>
          <div class="reason-content">
            <div class="reason-title">{reason.title}</div>
            <div class="reason-description">{reason.description}</div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if filingRequired || filingRecommended}
    <div class="documents card">
      <h3>📋 必要書類チェックリスト</h3>
      <ul class="checklist">
        <li>
          <label>
            <input type="checkbox" />
            マイナンバーカード（またはマイナンバー通知カード + 身分証明書）
          </label>
        </li>
        {#if employmentStatus === 'employee' || employmentStatus === 'both'}
          <li>
            <label>
              <input type="checkbox" />
              源泉徴収票
            </label>
          </li>
        {/if}
        {#if medical > 0}
          <li>
            <label>
              <input type="checkbox" />
              医療費の領収書・明細書
            </label>
          </li>
        {/if}
        {#if donation > 0}
          <li>
            <label>
              <input type="checkbox" />
              寄附金の受領証明書
            </label>
          </li>
        {/if}
        {#if housingLoan > 0}
          <li>
            <label>
              <input type="checkbox" />
              住宅ローンの残高証明書
            </label>
          </li>
          {#if isFirstYearHousingLoan}
            <li>
              <label>
                <input type="checkbox" />
                登記事項証明書
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" />
                売買契約書の写し
              </label>
            </li>
          {/if}
        {/if}
        <li>
          <label>
            <input type="checkbox" />
            銀行口座情報（還付金の振込先）
          </label>
        </li>
      </ul>
    </div>

    <div class="steps card">
      <h3>📝 確定申告の手順</h3>
      <ol>
        <li>
          <strong>必要書類を準備</strong>
          <p>上記のチェックリストを参考に書類を集める</p>
        </li>
        <li>
          <strong>申告書を作成</strong>
          <p>国税庁の「確定申告書等作成コーナー」で作成（推奨）</p>
        </li>
        <li>
          <strong>申告書を提出</strong>
          <p>e-Tax（電子申告）または税務署に郵送・持参</p>
        </li>
        <li>
          <strong>納税または還付</strong>
          <p>納税の場合は期限までに納付、還付の場合は1〜2ヶ月後に振込</p>
        </li>
      </ol>
      <div class="deadline-notice">
        <strong>申告期限:</strong> 毎年2月16日〜3月15日<br>
        <small>※ e-Taxなら自宅からいつでも提出可能です</small>
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
    margin-bottom: 0;
    line-height: 1.6;
  }

  .checkbox-group {
    margin: 1rem 0;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.95rem;
  }

  .checkbox-group input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }

  .result {
    margin: 1.5rem 0;
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .result.required {
    background: #ffe5e5;
    border: 2px solid #ff4444;
  }

  .result.recommended {
    background: #e7f3ff;
    border: 2px solid #2196f3;
  }

  .result.not-required {
    background: #e8f5e9;
    border: 2px solid #4caf50;
  }

  .result-icon {
    font-size: 3rem;
  }

  .result-content {
    flex: 1;
  }

  .result-label {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .result.required .result-label {
    color: #d32f2f;
  }

  .result.recommended .result-label {
    color: #1976d2;
  }

  .result.not-required .result-label {
    color: #388e3c;
  }

  .result-description {
    font-size: 0.95rem;
    opacity: 0.9;
  }

  .reasons-section {
    margin-top: 1rem;
  }

  .required-section {
    background: #fff8f8;
    border: 1px solid #ffcdd2;
  }

  .recommended-section {
    background: #f5f9ff;
    border: 1px solid #bbdefb;
  }

  .info-section {
    background: #fffbf0;
    border: 1px solid #ffe082;
  }

  .reason-item {
    display: flex;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  .reason-item:last-child {
    border-bottom: none;
  }

  .reason-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .reason-content {
    flex: 1;
  }

  .reason-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .reason-description {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .documents {
    margin-top: 1rem;
  }

  .checklist {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .checklist li {
    padding: 0.5rem 0;
  }

  .checklist label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }

  .checklist input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }

  .steps {
    margin-top: 1rem;
  }

  .steps ol {
    padding-left: 1.5rem;
    margin: 0 0 1rem 0;
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

  .deadline-notice {
    background: var(--background);
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid var(--primary-color);
  }

  .deadline-notice strong {
    color: var(--primary-color);
  }

  .deadline-notice small {
    color: var(--text-secondary);
  }

  @media (prefers-color-scheme: dark) {
    .notice {
      background: #4a3f1a;
      border-color: #6b5b1f;
    }

    .notice h3,
    .notice p {
      color: #ffc107;
    }

    .result.required {
      background: #4a2020;
      border-color: #ff4444;
    }

    .result.recommended {
      background: #1a2a3a;
      border-color: #2196f3;
    }

    .result.not-required {
      background: #1a3a1a;
      border-color: #4caf50;
    }

    .required-section {
      background: #3a1a1a;
      border-color: #d32f2f;
    }

    .recommended-section {
      background: #1a2535;
      border-color: #1976d2;
    }

    .info-section {
      background: #3a351a;
      border-color: #ffa000;
    }
  }
</style>
