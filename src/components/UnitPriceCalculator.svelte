<script>
  let products = [
    { id: 1, name: '商品1', price: '', amount: '', memo: '' },
    { id: 2, name: '商品2', price: '', amount: '', memo: '' }
  ];
  let nextId = 3;

  function addProduct() {
    products = [...products, { id: nextId++, name: `商品${nextId}`, price: '', amount: '', memo: '' }];
  }

  function removeProduct(id) {
    if (products.length > 2) {
      products = products.filter(p => p.id !== id);
    }
  }

  $: productsWithUnitPrice = products.map(product => ({
    ...product,
    unitPrice: product.price && product.amount
      ? (parseFloat(product.price) / parseFloat(product.amount)) * 100
      : null
  }));

  $: sortedProducts = productsWithUnitPrice
    .filter(p => p.unitPrice !== null)
    .sort((a, b) => a.unitPrice - b.unitPrice);

  $: bestProduct = sortedProducts.length > 0 ? sortedProducts[0] : null;

  $: comparison = sortedProducts.length >= 2
    ? {
        best: sortedProducts[0],
        worst: sortedProducts[sortedProducts.length - 1],
        diff: (((sortedProducts[sortedProducts.length - 1].unitPrice - sortedProducts[0].unitPrice) / sortedProducts[sortedProducts.length - 1].unitPrice) * 100).toFixed(1)
      }
    : null;
</script>

<div class="calculator">
  <h2>🏷️ 単価比較</h2>
  <p class="description">複数の商品の単価を比較してお得な商品を見つけます</p>

  <div class="products">
    {#each products as product, index (product.id)}
      <div class="card" class:best={bestProduct && product.id === bestProduct.id && productsWithUnitPrice[index].unitPrice !== null}>
        <div class="card-header">
          <h3>{product.name}</h3>
          {#if products.length > 2}
            <button class="remove-btn" on:click={() => removeProduct(product.id)} title="削除">×</button>
          {/if}
        </div>
        <div class="input-group">
          <label for="price{product.id}">価格（円）</label>
          <input
            id="price{product.id}"
            type="number"
            bind:value={product.price}
            placeholder="例: 298"
            min="0"
            step="1"
          />
        </div>
        <div class="input-group">
          <label for="amount{product.id}">容量</label>
          <input
            id="amount{product.id}"
            type="number"
            bind:value={product.amount}
            placeholder="例: 500"
            min="0"
            step="0.1"
          />
        </div>
        <div class="input-group">
          <label for="memo{product.id}">メモ（店名など）</label>
          <input
            id="memo{product.id}"
            type="text"
            bind:value={product.memo}
            placeholder="例: スーパーA"
          />
        </div>
        {#if productsWithUnitPrice[index].unitPrice}
          <div class="unit-price">
            <span class="label">100あたり</span>
            <span class="value">¥{productsWithUnitPrice[index].unitPrice.toFixed(2)}</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <button class="add-btn" on:click={addProduct}>+ 商品を追加</button>

  {#if comparison}
    <div class="result">
      <div class="result-label">最もお得なのは...</div>
      <div class="result-value">🎉 {comparison.best.name}！</div>
      <div class="result-detail">最も高い商品より約{comparison.diff}%お得です</div>
    </div>
  {/if}

  {#if sortedProducts.length > 1}
    <div class="ranking">
      <h3>ランキング</h3>
      <div class="ranking-list">
        {#each sortedProducts as product, index}
          <div class="ranking-item" class:best={index === 0}>
            <span class="rank">
              {#if index === 0}
                🥇
              {:else if index === 1}
                🥈
              {:else if index === 2}
                🥉
              {:else}
                {index + 1}位
              {/if}
            </span>
            <div class="product-info">
              <span class="product-name">{product.name}</span>
              {#if product.memo}
                <span class="product-memo">({product.memo})</span>
              {/if}
            </div>
            <span class="unit-price-display">¥{product.unitPrice.toFixed(2)} / 100</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .calculator {
    max-width: 1000px;
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
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .card {
    position: relative;
    border: 2px solid transparent;
    transition: all 0.3s ease;
  }

  .card.best {
    border-color: #ffd700;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.25rem;
    margin: 0;
    color: var(--primary-color);
  }

  .remove-btn {
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    padding: 0;
    line-height: 1;
  }

  .remove-btn:hover {
    background: #cc0000;
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

  .add-btn {
    width: 100%;
    padding: 0.75rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 1.5rem;
    transition: opacity 0.2s;
  }

  .add-btn:hover {
    opacity: 0.9;
  }

  .ranking {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 12px;
  }

  .ranking h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .ranking-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .ranking-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    border: 2px solid transparent;
    transition: all 0.2s;
  }

  .ranking-item.best {
    border-color: #ffd700;
    background: #fffef0;
  }

  .rank {
    font-size: 1.25rem;
    min-width: 3rem;
    text-align: center;
  }

  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .product-name {
    font-weight: 500;
  }

  .product-memo {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .unit-price-display {
    font-weight: bold;
    color: var(--primary-color);
  }

  @media (max-width: 768px) {
    .products {
      grid-template-columns: 1fr;
    }

    .ranking-item {
      flex-wrap: wrap;
    }

    .unit-price-display {
      width: 100%;
      text-align: right;
      margin-left: 4rem;
    }
  }
</style>
