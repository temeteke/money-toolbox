<script>
  // 源泉徴収票の項目
  let paymentAmount = ''; // 支払金額（額面年収）
  let afterEmploymentDeduction = ''; // 給与所得控除後の金額
  let totalDeductions = ''; // 所得控除の額の合計額
  let withheldTax = ''; // 源泉徴収税額
  let socialInsurance = ''; // 社会保険料等の金額

  // 追加控除項目
  let furusatoDonation = ''; // ふるさと納税額
  let medicalExpenses = ''; // 医療費
  let housingLoanBalance = ''; // 住宅ローン残高（初年度のみ）
  let isFirstYearHousingLoan = false;
  let idecoContribution = ''; // iDeCo等掛金
  let otherDonations = ''; // その他寄附金

  $: payment = parseFloat(paymentAmount) || 0;
  $: employmentIncome = parseFloat(afterEmploymentDeduction) || 0;
  $: deductions = parseFloat(totalDeductions) || 0;
  $: withheld = parseFloat(withheldTax) || 0;
  $: insurance = parseFloat(socialInsurance) || 0;

  $: furusato = parseFloat(furusatoDonation) || 0;
  $: medical = parseFloat(medicalExpenses) || 0;
  $: housingLoan = parseFloat(housingLoanBalance) || 0;
  $: ideco = parseFloat(idecoContribution) || 0;
  $: otherDonation = parseFloat(otherDonations) || 0;

  // 現在の課税所得（源泉徴収票ベース）
  $: currentTaxableIncome = Math.max(0, employmentIncome - deductions);

  // 現在の所得税額（源泉徴収票の値を使用）
  $: currentIncomeTax = withheld;

  // 現在の実効税率
  $: currentEffectiveTaxRate = currentTaxableIncome > 0 ? (currentIncomeTax / currentTaxableIncome * 100) : 0;

  // 追加控除の計算

  // 1. ふるさと納税（寄附金控除）
  $: furusatoDeduction = Math.max(0, furusato - 2000);

  // 2. 医療費控除
  $: medicalThreshold = Math.min(100000, employmentIncome * 0.05);
  $: medicalDeduction = Math.max(0, medical - medicalThreshold);

  // 3. 住宅ローン控除（初年度）- 税額控除
  $: housingLoanTaxCredit = isFirstYearHousingLoan ? Math.min(housingLoan * 0.007, 273000) : 0;

  // 4. iDeCo等掛金（全額控除）
  $: idecoDeduction = ideco;

  // 5. その他寄附金控除
  $: otherDonationDeduction = Math.max(0, otherDonation - 2000);

  // 所得控除の合計（ふるさと納税、医療費、iDeCo、その他寄附金）
  $: additionalDeductions = furusatoDeduction + medicalDeduction + idecoDeduction + otherDonationDeduction;

  // 追加控除適用後の課税所得
  $: newTaxableIncome = Math.max(0, currentTaxableIncome - additionalDeductions);

  // 追加控除適用後の所得税（再計算）
  $: newIncomeTax = calculateIncomeTax(newTaxableIncome);

  // 住宅ローン控除（税額控除）を適用
  $: newIncomeTaxAfterHousingCredit = Math.max(0, newIncomeTax - housingLoanTaxCredit);

  // 所得税の還付額
  $: incomeTaxRefund = Math.max(0, currentIncomeTax - newIncomeTaxAfterHousingCredit);

  // 住民税への影響（翌年度）
  $: currentResidentTax = currentTaxableIncome * 0.1 + 5000;
  $: newResidentTax = newTaxableIncome * 0.1 + 5000;
  $: residentTaxReduction = Math.max(0, currentResidentTax - newResidentTax);

  // 住宅ローン控除の住民税への影響（所得税で控除しきれなかった分）
  $: housingLoanResidentTaxCredit = isFirstYearHousingLoan ? Math.min(housingLoanTaxCredit - (newIncomeTax - newIncomeTaxAfterHousingCredit), newResidentTax * 0.2, 97500) : 0;
  $: residentTaxReductionTotal = residentTaxReduction + housingLoanResidentTaxCredit;

  // 合計メリット
  $: totalBenefit = incomeTaxRefund + residentTaxReductionTotal;

  // 申告推奨判定
  $: shouldFile = totalBenefit >= 3000;
  $: filingRecommendation = totalBenefit >= 3000 ? 'recommend' : totalBenefit >= 1000 ? 'consider' : 'not-recommend';

  // 源泉徴収票の入力が完了しているか
  $: hasWithholdingSlipData = payment > 0 && employmentIncome > 0 && deductions > 0 && withheld >= 0;

  // 追加控除が入力されているか
  $: hasAdditionalDeductions = furusato > 0 || medical > 0 || (isFirstYearHousingLoan && housingLoan > 0) || ideco > 0 || otherDonation > 0;

  function calculateIncomeTax(taxableIncome) {
    // 所得税の累進課税
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
    } else if (taxableIncome <= 40000000) {
      tax = 4404000 + (taxableIncome - 18000000) * 0.4;
    } else {
      tax = 13204000 + (taxableIncome - 40000000) * 0.45;
    }

    // 復興特別所得税（2.1%）
    tax = tax * 1.021;

    return Math.max(0, tax);
  }
</script>

<div class="calculator">
  <h2>📄 源泉徴収票ベース還付金シミュレーター</h2>
  <p class="description">源泉徴収票の数値を使って、確定申告による還付額を正確に計算</p>

  <div class="notice card">
    <h3>💡 この機能について</h3>
    <p>年末調整後に発行される<strong>源泉徴収票</strong>の情報を基に、追加で控除できる項目（ふるさと納税、医療費控除など）を入力すると、確定申告による還付金額を正確に計算できます。</p>
    <ul>
      <li><strong>既存の概算機能との違い</strong>: 源泉徴収票の実際の数値を使うため、より正確な還付額が分かります</li>
      <li><strong>対象者</strong>: 年末調整を受けた会社員で、追加の控除を受けたい方</li>
    </ul>
  </div>

  <div class="card">
    <h3>📋 源泉徴収票の入力</h3>
    <p class="help-text">お手元の源泉徴収票を見ながら、以下の項目を入力してください</p>

    <div class="input-group">
      <label for="paymentAmount">
        支払金額（円）
        <span class="help-icon" title="源泉徴収票の一番上にある「支払金額」欄の数値">ⓘ</span>
      </label>
      <input
        id="paymentAmount"
        type="number"
        bind:value={paymentAmount}
        placeholder="例: 6000000"
        min="0"
        step="1000"
      />
      <small>額面年収（賞与含む）</small>
    </div>

    <div class="input-group">
      <label for="afterEmploymentDeduction">
        給与所得控除後の金額（円）
        <span class="help-icon" title="「給与所得控除後の金額」欄の数値">ⓘ</span>
      </label>
      <input
        id="afterEmploymentDeduction"
        type="number"
        bind:value={afterEmploymentDeduction}
        placeholder="例: 4360000"
        min="0"
        step="1000"
      />
      <small>給与所得控除を引いた後の金額</small>
    </div>

    <div class="input-group">
      <label for="totalDeductions">
        所得控除の額の合計額（円）
        <span class="help-icon" title="「所得控除の額の合計額」欄の数値">ⓘ</span>
      </label>
      <input
        id="totalDeductions"
        type="number"
        bind:value={totalDeductions}
        placeholder="例: 1480000"
        min="0"
        step="1000"
      />
      <small>基礎控除、社会保険料控除、配偶者控除などの合計</small>
    </div>

    <div class="input-group">
      <label for="withheldTax">
        源泉徴収税額（円）
        <span class="help-icon" title="「源泉徴収税額」欄の数値">ⓘ</span>
      </label>
      <input
        id="withheldTax"
        type="number"
        bind:value={withheldTax}
        placeholder="例: 147100"
        min="0"
        step="100"
      />
      <small>既に納めた所得税額</small>
    </div>

    <div class="input-group">
      <label for="socialInsurance">
        社会保険料等の金額（円）
        <span class="help-icon" title="「社会保険料等の金額」欄の数値">ⓘ</span>
      </label>
      <input
        id="socialInsurance"
        type="number"
        bind:value={socialInsurance}
        placeholder="例: 900000"
        min="0"
        step="1000"
      />
      <small>健康保険料、厚生年金保険料など（参考情報）</small>
    </div>
  </div>

  {#if hasWithholdingSlipData}
    <div class="current-status card">
      <h3>📊 現在の状況（年末調整後）</h3>
      <div class="breakdown-item">
        <span>給与所得</span>
        <span>¥{Math.round(employmentIncome).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>所得控除の合計</span>
        <span>¥{Math.round(deductions).toLocaleString()}</span>
      </div>
      <div class="breakdown-item highlight">
        <span>課税所得</span>
        <span>¥{Math.round(currentTaxableIncome).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>所得税額（納付済み）</span>
        <span>¥{Math.round(currentIncomeTax).toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>実効税率</span>
        <span>{currentEffectiveTaxRate.toFixed(2)}%</span>
      </div>
    </div>

    <div class="card">
      <h3>➕ 追加控除の入力</h3>
      <p class="help-text">年末調整で適用できなかった控除を入力してください</p>

      <div class="input-group">
        <label for="furusatoDonation">
          ふるさと納税額（円）
          <span class="optional">（任意）</span>
        </label>
        <input
          id="furusatoDonation"
          type="number"
          bind:value={furusatoDonation}
          placeholder="例: 50000"
          min="0"
          step="1000"
        />
        <small>寄附金控除として申告可能（自己負担2,000円を除く）</small>
      </div>

      <div class="input-group">
        <label for="medicalExpenses">
          医療費（円）
          <span class="optional">（任意）</span>
        </label>
        <input
          id="medicalExpenses"
          type="number"
          bind:value={medicalExpenses}
          placeholder="例: 150000"
          min="0"
          step="1000"
        />
        <small>年間の医療費合計（保険金等で補填された分は除く）</small>
      </div>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" bind:checked={isFirstYearHousingLoan} />
          住宅ローン控除（初年度）を適用する
        </label>
      </div>

      {#if isFirstYearHousingLoan}
        <div class="input-group">
          <label for="housingLoanBalance">
            住宅ローン年末残高（円）
          </label>
          <input
            id="housingLoanBalance"
            type="number"
            bind:value={housingLoanBalance}
            placeholder="例: 30000000"
            min="0"
            step="100000"
          />
          <small>12月31日時点のローン残高</small>
        </div>
      {/if}

      <div class="input-group">
        <label for="idecoContribution">
          iDeCo等掛金（円）
          <span class="optional">（任意）</span>
        </label>
        <input
          id="idecoContribution"
          type="number"
          bind:value={idecoContribution}
          placeholder="例: 240000"
          min="0"
          step="1000"
        />
        <small>年末調整で申告し忘れた小規模企業共済等掛金</small>
      </div>

      <div class="input-group">
        <label for="otherDonations">
          その他寄附金（円）
          <span class="optional">（任意）</span>
        </label>
        <input
          id="otherDonations"
          type="number"
          bind:value={otherDonations}
          placeholder="例: 10000"
          min="0"
          step="1000"
        />
        <small>認定NPO法人等への寄附（ふるさと納税を除く）</small>
      </div>
    </div>

    {#if hasAdditionalDeductions}
      <div class="result {filingRecommendation}">
        <div class="result-icon">
          {#if filingRecommendation === 'recommend'}
            ✨
          {:else if filingRecommendation === 'consider'}
            💡
          {:else}
            ℹ️
          {/if}
        </div>
        <div class="result-content">
          <div class="result-label">
            {#if filingRecommendation === 'recommend'}
              確定申告をおすすめします！
            {:else if filingRecommendation === 'consider'}
              確定申告を検討してみてください
            {:else}
              還付額は少額です
            {/if}
          </div>
          <div class="result-value">還付見込額: ¥{Math.round(totalBenefit).toLocaleString()}</div>
          <div class="result-description">
            {#if filingRecommendation === 'recommend'}
              所得税¥{Math.round(incomeTaxRefund).toLocaleString()} + 住民税減額¥{Math.round(residentTaxReductionTotal).toLocaleString()}（翌年度）
            {:else if filingRecommendation === 'consider'}
              手間と還付額を考慮して判断してください
            {:else}
              申告の手間を考えると、メリットは小さいかもしれません
            {/if}
          </div>
        </div>
      </div>

      <div class="breakdown card">
        <h3>💰 還付金の内訳</h3>

        <div class="section-title">追加控除</div>
        {#if furusato > 0}
          <div class="breakdown-item">
            <span>ふるさと納税（寄附金控除）</span>
            <span>¥{Math.round(furusatoDeduction).toLocaleString()}</span>
          </div>
        {/if}
        {#if medical > 0}
          <div class="breakdown-item">
            <span>医療費控除</span>
            <span>¥{Math.round(medicalDeduction).toLocaleString()}</span>
          </div>
        {/if}
        {#if ideco > 0}
          <div class="breakdown-item">
            <span>iDeCo等掛金控除</span>
            <span>¥{Math.round(idecoDeduction).toLocaleString()}</span>
          </div>
        {/if}
        {#if otherDonation > 0}
          <div class="breakdown-item">
            <span>その他寄附金控除</span>
            <span>¥{Math.round(otherDonationDeduction).toLocaleString()}</span>
          </div>
        {/if}
        <div class="breakdown-item total">
          <span>追加所得控除 合計</span>
          <span>¥{Math.round(additionalDeductions).toLocaleString()}</span>
        </div>

        <div class="section-title">所得税</div>
        <div class="breakdown-item">
          <span>現在の所得税（納付済み）</span>
          <span>¥{Math.round(currentIncomeTax).toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
          <span>再計算後の所得税</span>
          <span>¥{Math.round(newIncomeTax).toLocaleString()}</span>
        </div>
        {#if isFirstYearHousingLoan && housingLoanTaxCredit > 0}
          <div class="breakdown-item deduction">
            <span>住宅ローン控除（税額控除）</span>
            <span>-¥{Math.round(housingLoanTaxCredit).toLocaleString()}</span>
          </div>
          <div class="breakdown-item">
            <span>控除適用後の所得税</span>
            <span>¥{Math.round(newIncomeTaxAfterHousingCredit).toLocaleString()}</span>
          </div>
        {/if}
        <div class="breakdown-item success">
          <span>所得税の還付額</span>
          <span>¥{Math.round(incomeTaxRefund).toLocaleString()}</span>
        </div>

        <div class="section-title">住民税（翌年度）</div>
        <div class="breakdown-item">
          <span>現在の住民税（概算）</span>
          <span>¥{Math.round(currentResidentTax).toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
          <span>申告後の住民税（概算）</span>
          <span>¥{Math.round(newResidentTax).toLocaleString()}</span>
        </div>
        {#if housingLoanResidentTaxCredit > 0}
          <div class="breakdown-item deduction">
            <span>住宅ローン控除（住民税分）</span>
            <span>-¥{Math.round(housingLoanResidentTaxCredit).toLocaleString()}</span>
          </div>
        {/if}
        <div class="breakdown-item success">
          <span>住民税の減額</span>
          <span>¥{Math.round(residentTaxReductionTotal).toLocaleString()}</span>
        </div>

        <div class="breakdown-item highlight total-benefit">
          <span>合計メリット</span>
          <span>¥{Math.round(totalBenefit).toLocaleString()}</span>
        </div>
      </div>

      <div class="comparison card">
        <h3>📊 申告前 vs 申告後の比較</h3>
        <div class="comparison-table">
          <div class="comparison-header">
            <div class="comparison-cell">項目</div>
            <div class="comparison-cell">申告前</div>
            <div class="comparison-cell">申告後</div>
            <div class="comparison-cell">差額</div>
          </div>
          <div class="comparison-row">
            <div class="comparison-cell">課税所得</div>
            <div class="comparison-cell">¥{Math.round(currentTaxableIncome).toLocaleString()}</div>
            <div class="comparison-cell">¥{Math.round(newTaxableIncome).toLocaleString()}</div>
            <div class="comparison-cell diff">-¥{Math.round(additionalDeductions).toLocaleString()}</div>
          </div>
          <div class="comparison-row">
            <div class="comparison-cell">所得税</div>
            <div class="comparison-cell">¥{Math.round(currentIncomeTax).toLocaleString()}</div>
            <div class="comparison-cell">¥{Math.round(newIncomeTaxAfterHousingCredit).toLocaleString()}</div>
            <div class="comparison-cell benefit">-¥{Math.round(incomeTaxRefund).toLocaleString()}</div>
          </div>
          <div class="comparison-row">
            <div class="comparison-cell">住民税（翌年）</div>
            <div class="comparison-cell">¥{Math.round(currentResidentTax).toLocaleString()}</div>
            <div class="comparison-cell">¥{Math.round(newResidentTax - housingLoanResidentTaxCredit).toLocaleString()}</div>
            <div class="comparison-cell benefit">-¥{Math.round(residentTaxReductionTotal).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div class="info-box card">
        <h3>📝 確定申告の手順</h3>
        <ol>
          <li>
            <strong>必要書類を準備</strong>
            <p>源泉徴収票、控除証明書（寄附金受領証明書、医療費の領収書など）</p>
          </li>
          <li>
            <strong>確定申告書を作成</strong>
            <p>国税庁「確定申告書等作成コーナー」でオンライン作成（推奨）</p>
          </li>
          <li>
            <strong>提出</strong>
            <p>e-Tax（電子申告）または税務署に郵送・持参</p>
          </li>
          <li>
            <strong>還付金を受け取る</strong>
            <p>申告後、1〜2ヶ月程度で指定口座に振込</p>
          </li>
        </ol>
        <div class="deadline-notice">
          <strong>申告期限:</strong> 毎年2月16日〜3月15日<br>
          <small>※ 還付申告は1月から可能です</small>
        </div>
      </div>

      <div class="links card">
        <h3>🔗 関連機能</h3>
        <p>概算で知りたい方は、以下の簡易計算機もご利用ください：</p>
        <ul class="link-list">
          <li>🎁 <a href="#" on:click|preventDefault={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'furusato' }))}>ふるさと納税シミュレーター</a> - 上限額の概算</li>
          <li>💊 <a href="#" on:click|preventDefault={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'medical-deduction' }))}>医療費控除計算</a> - 控除額の概算</li>
        </ul>
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

  .help-text {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .optional {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: normal;
  }

  .help-icon {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    line-height: 1rem;
    text-align: center;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    font-size: 0.7rem;
    cursor: help;
    margin-left: 0.25rem;
  }

  small {
    display: block;
    margin-top: 0.25rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .notice {
    background: #e3f2fd;
    border: 1px solid #2196f3;
    margin-bottom: 1.5rem;
  }

  .notice h3 {
    color: #1565c0;
    margin-bottom: 0.75rem;
  }

  .notice p {
    color: #1565c0;
    margin-bottom: 0.75rem;
    line-height: 1.6;
  }

  .notice ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #1565c0;
  }

  .notice li {
    margin-bottom: 0.25rem;
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

  .current-status {
    background: var(--background);
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

  .breakdown-item.success {
    color: var(--success);
    font-weight: 600;
  }

  .breakdown-item.highlight {
    font-weight: 600;
    font-size: 1.05rem;
  }

  .breakdown-item.total {
    font-weight: 600;
    padding-top: 1rem;
    margin-top: 0.5rem;
    border-top: 2px solid var(--border-color);
  }

  .breakdown-item.total-benefit {
    font-size: 1.25rem;
    padding-top: 1rem;
    margin-top: 0.5rem;
    border-top: 3px solid var(--primary-color);
    color: var(--primary-color);
  }

  .section-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--primary-color);
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.25rem;
    border-bottom: 2px solid var(--primary-color);
  }

  .section-title:first-child {
    margin-top: 0;
  }

  .result {
    margin: 1.5rem 0;
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .result.recommend {
    background: #e8f5e9;
    border: 2px solid #4caf50;
  }

  .result.consider {
    background: #fff3e0;
    border: 2px solid #ff9800;
  }

  .result.not-recommend {
    background: #f5f5f5;
    border: 2px solid #9e9e9e;
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
    margin-bottom: 0.5rem;
  }

  .result.recommend .result-label {
    color: #2e7d32;
  }

  .result.consider .result-label {
    color: #e65100;
  }

  .result.not-recommend .result-label {
    color: #616161;
  }

  .result-value {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .result.recommend .result-value {
    color: #1b5e20;
  }

  .result.consider .result-value {
    color: #e65100;
  }

  .result.not-recommend .result-value {
    color: #424242;
  }

  .result-description {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .comparison {
    margin-top: 1rem;
  }

  .comparison-table {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    gap: 0;
  }

  .comparison-header {
    display: contents;
  }

  .comparison-header .comparison-cell {
    background: var(--primary-color);
    color: white;
    font-weight: 600;
    padding: 0.75rem 0.5rem;
    text-align: center;
  }

  .comparison-header .comparison-cell:first-child {
    border-radius: 8px 0 0 0;
  }

  .comparison-header .comparison-cell:last-child {
    border-radius: 0 8px 0 0;
  }

  .comparison-row {
    display: contents;
  }

  .comparison-cell {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid var(--border-color);
    text-align: center;
  }

  .comparison-cell:first-child {
    text-align: left;
    font-weight: 500;
  }

  .comparison-cell.diff {
    color: var(--text-secondary);
  }

  .comparison-cell.benefit {
    color: var(--success);
    font-weight: 600;
  }

  .info-box {
    margin-top: 1rem;
  }

  .info-box ol {
    padding-left: 1.5rem;
    margin: 0 0 1rem 0;
  }

  .info-box li {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .info-box li:last-child {
    margin-bottom: 0;
  }

  .info-box strong {
    color: var(--primary-color);
    display: block;
    margin-bottom: 0.25rem;
  }

  .info-box p {
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

  .links {
    margin-top: 1rem;
    background: var(--background);
  }

  .link-list {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0 0;
  }

  .link-list li {
    padding: 0.5rem 0;
  }

  .link-list a {
    color: var(--primary-color);
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .link-list a:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .comparison-table {
      grid-template-columns: 1.2fr 1fr 1fr 1fr;
      font-size: 0.85rem;
    }

    .comparison-cell {
      padding: 0.5rem 0.25rem;
    }
  }

  @media (prefers-color-scheme: dark) {
    .notice {
      background: #0d3c61;
      border-color: #2196f3;
    }

    .notice h3,
    .notice p,
    .notice ul {
      color: #64b5f6;
    }

    .result.recommend {
      background: #1b5e20;
      border-color: #4caf50;
    }

    .result.consider {
      background: #4a2c0f;
      border-color: #ff9800;
    }

    .result.not-recommend {
      background: #2c2c2c;
      border-color: #757575;
    }

    .result.recommend .result-label,
    .result.recommend .result-value {
      color: #a5d6a7;
    }

    .result.consider .result-label,
    .result.consider .result-value {
      color: #ffb74d;
    }

    .result.not-recommend .result-label,
    .result.not-recommend .result-value {
      color: #bdbdbd;
    }
  }
</style>
