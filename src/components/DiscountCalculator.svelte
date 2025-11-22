<script>
  import { getQueryParams, updateQueryParam, encodeData, decodeData } from '../utils/urlParams.js';

  // URLから初期データを読み込む
  let initialData = {
    originalPrice: '',
    discountType: 'percentage',
    discountValue: '',
    couponValue: ''
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

  let originalPrice = initialData.originalPrice;
  let discountType = initialData.discountType;
  let discountValue = initialData.discountValue;
  let couponValue = initialData.couponValue;

  // データが変更されたらURLを更新
  $: if (typeof window !== 'undefined') {
    const data = encodeData({ originalPrice, discountType, discountValue, couponValue });
    if (data) {
      updateQueryParam('data', data);
    }
  }

  $: discount = discountType === 'percentage'
    ? (parseFloat(originalPrice) || 0) * (parseFloat(discountValue) || 0) / 100
    : (parseFloat(discountValue) || 0);

  $: priceAfterDiscount = (parseFloat(originalPrice) || 0) - discount;
  $: finalPrice = priceAfterDiscount - (parseFloat(couponValue) || 0);
  $: totalDiscount = (parseFloat(originalPrice) || 0) - finalPrice;
  $: discountPercentage = originalPrice
    ? (totalDiscount / parseFloat(originalPrice) * 100).toFixed(1)
    : 0;
</script>

<div class="calculator">
  <h2>💰 割引・クーポン計算</h2>
  <p class="description">割引とクーポンを併用した最終価格を計算</p>

  <div class="card">
    <div class="input-group">
      <label for="originalPrice">元の価格（円）</label>
      <input
        id="originalPrice"
        type="number"
        bind:value={originalPrice}
        placeholder="例: 10000"
        min="0"
        step="1"
      />
    </div>

    <div class="input-group">
      <label for="discountType">割引タイプ</label>
      <select id="discountType" bind:value={discountType}>
        <option value="percentage">パーセント割引（%）</option>
        <option value="fixed">金額割引（円）</option>
      </select>
    </div>

    <div class="input-group">
      <label for="discountValue">
        {discountType === 'percentage' ? '割引率（%）' : '割引額（円）'}
      </label>
      <input
        id="discountValue"
        type="number"
        bind:value={discountValue}
        placeholder={discountType === 'percentage' ? '例: 20' : '例: 2000'}
        min="0"
        step={discountType === 'percentage' ? '0.1' : '1'}
      />
    </div>

    <div class="input-group">
      <label for="couponValue">クーポン値引き額（円）</label>
      <input
        id="couponValue"
        type="number"
        bind:value={couponValue}
        placeholder="例: 500（なしの場合は0）"
        min="0"
        step="1"
      />
    </div>
  </div>

  {#if originalPrice && finalPrice >= 0}
    <div class="breakdown card">
      <h3>💡 計算内訳</h3>
      <div class="breakdown-item">
        <span>元の価格</span>
        <span>¥{parseFloat(originalPrice).toLocaleString()}</span>
      </div>
      {#if discount > 0}
        <div class="breakdown-item discount">
          <span>
            {discountType === 'percentage'
              ? `割引（${discountValue}%）`
              : '割引額'}
          </span>
          <span>-¥{discount.toLocaleString()}</span>
        </div>
      {/if}
      {#if couponValue}
        <div class="breakdown-item discount">
          <span>クーポン</span>
          <span>-¥{parseFloat(couponValue).toLocaleString()}</span>
        </div>
      {/if}
      <div class="breakdown-divider"></div>
      <div class="breakdown-item total">
        <span>合計割引</span>
        <span>-¥{totalDiscount.toLocaleString()}</span>
      </div>
    </div>

    <div class="result">
      <div class="result-label">お支払い金額</div>
      <div class="result-value">¥{Math.max(0, finalPrice).toLocaleString()}</div>
      <div class="result-detail">
        元の価格から{discountPercentage}%お得！
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

  .breakdown-item.discount {
    color: var(--error);
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
