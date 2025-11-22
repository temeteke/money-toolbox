<script>
  import { getQueryParams, updateQueryParam, encodeData, decodeData } from '../utils/urlParams.js';

  // URLから初期データを読み込む
  let initialData = {
    price: '',
    taxRate: '10',
    mode: 'exclude',
    roundingMethod: 'round'
  };

  if (typeof window !== 'undefined') {
    const params = getQueryParams();
    if (params.data) {
      const decoded = decodeData(params.data);
      if (decoded) {
        initialData = { ...initialData, ...decoded };
      }
    }
  }

  let price = initialData.price;
  let taxRate = initialData.taxRate;
  let mode = initialData.mode;
  let roundingMethod = initialData.roundingMethod;

  // データが変更されたらURLを更新
  $: if (typeof window !== 'undefined') {
    const data = encodeData({ price, taxRate, mode, roundingMethod });
    if (data) {
      updateQueryParam('data', data);
    }
  }

  $: taxRateValue = parseFloat(taxRate) / 100;

  $: result = calculateTax(price, taxRateValue, mode, roundingMethod);

  function calculateTax(price, taxRate, mode, rounding) {
    if (!price) return null;

    const priceNum = parseFloat(price);
    let taxAmount, totalPrice, basePrice;

    if (mode === 'exclude') {
      // 税抜価格から税込を計算
      basePrice = priceNum;
      taxAmount = priceNum * taxRate;

      // 丸め処理
      if (rounding === 'floor') {
        taxAmount = Math.floor(taxAmount);
      } else if (rounding === 'ceil') {
        taxAmount = Math.ceil(taxAmount);
      } else {
        taxAmount = Math.round(taxAmount);
      }

      totalPrice = basePrice + taxAmount;
    } else {
      // 税込価格から税抜を計算
      totalPrice = priceNum;
      basePrice = priceNum / (1 + taxRate);

      // 丸め処理
      if (rounding === 'floor') {
        basePrice = Math.floor(basePrice);
      } else if (rounding === 'ceil') {
        basePrice = Math.ceil(basePrice);
      } else {
        basePrice = Math.round(basePrice);
      }

      taxAmount = totalPrice - basePrice;
    }

    return {
      basePrice: Math.round(basePrice),
      taxAmount: Math.round(taxAmount),
      totalPrice: Math.round(totalPrice)
    };
  }
</script>

<div class="calculator">
  <h2>🧾 税込・税抜き変換</h2>
  <p class="description">消費税の計算を簡単に</p>

  <div class="card">
    <div class="input-group">
      <label for="mode">計算モード</label>
      <select id="mode" bind:value={mode}>
        <option value="exclude">税抜 → 税込</option>
        <option value="include">税込 → 税抜</option>
      </select>
    </div>

    <div class="input-group">
      <label for="price">
        {mode === 'exclude' ? '税抜価格（円）' : '税込価格（円）'}
      </label>
      <input
        id="price"
        type="number"
        bind:value={price}
        placeholder="例: 1000"
        min="0"
        step="1"
      />
    </div>

    <div class="input-group">
      <label for="taxRate">消費税率（%）</label>
      <select id="taxRate" bind:value={taxRate}>
        <option value="10">10%（標準税率）</option>
        <option value="8">8%（軽減税率）</option>
        <option value="5">5%（旧税率）</option>
      </select>
    </div>

    <div class="input-group">
      <label for="rounding">端数処理</label>
      <select id="rounding" bind:value={roundingMethod}>
        <option value="round">四捨五入</option>
        <option value="floor">切り捨て</option>
        <option value="ceil">切り上げ</option>
      </select>
    </div>
  </div>

  {#if result}
    <div class="breakdown card">
      <h3>💡 計算結果</h3>
      <div class="breakdown-item">
        <span>税抜価格</span>
        <span>¥{result.basePrice.toLocaleString()}</span>
      </div>
      <div class="breakdown-item tax">
        <span>消費税（{taxRate}%）</span>
        <span>¥{result.taxAmount.toLocaleString()}</span>
      </div>
      <div class="breakdown-divider"></div>
      <div class="breakdown-item total">
        <span>税込価格</span>
        <span>¥{result.totalPrice.toLocaleString()}</span>
      </div>
    </div>

    <div class="result">
      <div class="result-label">
        {mode === 'exclude' ? '税込価格' : '税抜価格'}
      </div>
      <div class="result-value">
        ¥{mode === 'exclude'
          ? result.totalPrice.toLocaleString()
          : result.basePrice.toLocaleString()}
      </div>
      <div class="result-detail">
        消費税: ¥{result.taxAmount.toLocaleString()}
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

  .breakdown {
    margin-bottom: 1rem;
  }

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    font-size: 1rem;
  }

  .breakdown-item.tax {
    color: var(--warning);
  }

  .breakdown-item.total {
    font-weight: bold;
    font-size: 1.1rem;
  }

  .breakdown-divider {
    height: 2px;
    background: var(--border-color);
    margin: 0.5rem 0;
  }
</style>
