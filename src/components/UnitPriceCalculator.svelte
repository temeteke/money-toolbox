<script>
  let productA = { name: '商品A', price: '', amount: '', unit: 'g' };
  let productB = { name: '商品B', price: '', amount: '', unit: 'g' };

  $: unitPriceA = productA.price && productA.amount
    ? (parseFloat(productA.price) / parseFloat(productA.amount)) * 100
    : null;

  $: unitPriceB = productB.price && productB.amount
    ? (parseFloat(productB.price) / parseFloat(productB.amount)) * 100
    : null;

  $: comparison = unitPriceA && unitPriceB
    ? unitPriceA < unitPriceB
      ? { winner: 'A', diff: ((unitPriceB - unitPriceA) / unitPriceB * 100).toFixed(1) }
      : { winner: 'B', diff: ((unitPriceA - unitPriceB) / unitPriceA * 100).toFixed(1) }
    : null;
</script>

<div class="calculator">
  <h2>🏷️ 単価比較</h2>
  <p class="description">どちらの商品がお得か比較します</p>

  <div class="products">
    <div class="card">
      <h3>商品A</h3>
      <div class="input-group">
        <label for="priceA">価格（円）</label>
        <input
          id="priceA"
          type="number"
          bind:value={productA.price}
          placeholder="例: 298"
          min="0"
          step="1"
        />
      </div>
      <div class="input-row">
        <div class="input-group" style="flex: 2;">
          <label for="amountA">容量</label>
          <input
            id="amountA"
            type="number"
            bind:value={productA.amount}
            placeholder="例: 500"
            min="0"
            step="0.1"
          />
        </div>
        <div class="input-group" style="flex: 1;">
          <label for="unitA">単位</label>
          <select id="unitA" bind:value={productA.unit}>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="個">個</option>
          </select>
        </div>
      </div>
      {#if unitPriceA}
        <div class="unit-price">
          <span class="label">100{productA.unit}あたり</span>
          <span class="value">¥{unitPriceA.toFixed(2)}</span>
        </div>
      {/if}
    </div>

    <div class="vs">VS</div>

    <div class="card">
      <h3>商品B</h3>
      <div class="input-group">
        <label for="priceB">価格（円）</label>
        <input
          id="priceB"
          type="number"
          bind:value={productB.price}
          placeholder="例: 398"
          min="0"
          step="1"
        />
      </div>
      <div class="input-row">
        <div class="input-group" style="flex: 2;">
          <label for="amountB">容量</label>
          <input
            id="amountB"
            type="number"
            bind:value={productB.amount}
            placeholder="例: 1000"
            min="0"
            step="0.1"
          />
        </div>
        <div class="input-group" style="flex: 1;">
          <label for="unitB">単位</label>
          <select id="unitB" bind:value={productB.unit}>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="個">個</option>
          </select>
        </div>
      </div>
      {#if unitPriceB}
        <div class="unit-price">
          <span class="label">100{productB.unit}あたり</span>
          <span class="value">¥{unitPriceB.toFixed(2)}</span>
        </div>
      {/if}
    </div>
  </div>

  {#if comparison}
    <div class="result">
      <div class="result-label">お得なのは...</div>
      <div class="result-value">🎉 商品{comparison.winner}！</div>
      <div class="result-detail">約{comparison.diff}%お得です</div>
    </div>
  {/if}
</div>

<style>
  .calculator {
    max-width: 800px;
    margin: 0 auto;
  }

  h2 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  .description {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .products {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    align-items: start;
    margin-bottom: 1.5rem;
  }

  .vs {
    font-weight: bold;
    font-size: 1.25rem;
    color: var(--primary-color);
    align-self: center;
    padding: 1rem 0.5rem;
  }

  h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
  }

  .unit-price {
    margin-top: 1rem;
    padding: 0.75rem;
    background: var(--primary-color);
    color: white;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .unit-price .label {
    font-size: 0.85rem;
    opacity: 0.9;
  }

  .unit-price .value {
    font-size: 1.25rem;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    .products {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .vs {
      text-align: center;
      padding: 0.5rem;
    }
  }
</style>
