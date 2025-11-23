<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { recentTabs } from './lib/historyStore.js';
  import UnitPriceCalculator from './components/UnitPriceCalculator.svelte';
  import DiscountCalculator from './components/DiscountCalculator.svelte';
  import TaxCalculator from './components/TaxCalculator.svelte';
  import SplitBillCalculator from './components/SplitBillCalculator.svelte';
  import PointCalculator from './components/PointCalculator.svelte';
  import InvestmentCalculator from './components/InvestmentCalculator.svelte';
  import HourlyWageCalculator from './components/HourlyWageCalculator.svelte';
  import SavingsGoalCalculator from './components/SavingsGoalCalculator.svelte';
  import SubscriptionCalculator from './components/SubscriptionCalculator.svelte';
  import FuelCostCalculator from './components/FuelCostCalculator.svelte';
  import MortgageLoanCalculator from './components/MortgageLoanCalculator.svelte';
  import NetSalaryCalculator from './components/NetSalaryCalculator.svelte';
  import FurusatoTaxCalculator from './components/FurusatoTaxCalculator.svelte';
  import CreditCardRewardsCalculator from './components/CreditCardRewardsCalculator.svelte';
  import LoanRefinancingCalculator from './components/LoanRefinancingCalculator.svelte';
  import FIRECalculator from './components/FIRECalculator.svelte';
  import MedicalDeductionCalculator from './components/MedicalDeductionCalculator.svelte';
  import BusinessIncomeCalculator from './components/BusinessIncomeCalculator.svelte';
  import TaxFilingChecker from './components/TaxFilingChecker.svelte';
  import WithholdingSlipAnalyzer from './components/WithholdingSlipAnalyzer.svelte';
  import MoreFeaturesModal from './components/MoreFeaturesModal.svelte';

  const activeTab = writable('unit-price');

  // よく使う機能（メインタブに表示）
  const mainTabs = [
    { id: 'unit-price', label: '単価比較', icon: '🏷️' },
    { id: 'discount', label: '割引計算', icon: '💰' },
    { id: 'tax', label: '税込/税抜', icon: '🧾' },
    { id: 'split', label: '割り勘', icon: '🍽️' },
    { id: 'point', label: 'ポイント', icon: '💳' },
    { id: 'investment', label: '投資', icon: '📈' }
  ];

  // その他の機能（モーダルに表示）
  const moreFeatures = [
    { id: 'withholding-slip', label: '源泉徴収票分析', icon: '📄' },
    { id: 'card-rewards', label: 'カード還元率比較', icon: '💳' },
    { id: 'fire', label: 'FIRE計算', icon: '🔥' },
    { id: 'loan-refinancing', label: 'ローン借り換え', icon: '🔄' },
    { id: 'medical-deduction', label: '医療費控除', icon: '💊' },
    { id: 'business-income', label: '事業所得計算', icon: '📊' },
    { id: 'tax-filing-checker', label: '確定申告チェック', icon: '✅' },
    { id: 'hourly-wage', label: '時給換算', icon: '⏱️' },
    { id: 'savings-goal', label: '貯金目標', icon: '💰' },
    { id: 'subscription', label: 'サブスク', icon: '📱' },
    { id: 'fuel-cost', label: '移動コスト', icon: '🚗' },
    { id: 'mortgage', label: '住宅ローン', icon: '🏠' },
    { id: 'net-salary', label: '手取り給与', icon: '💴' },
    { id: 'furusato', label: 'ふるさと納税', icon: '🎁' }
  ];

  let showMoreModal = false;

  function setTab(tabId) {
    activeTab.set(tabId);
    recentTabs.addTab(tabId);
  }

  function handleMoreClick() {
    showMoreModal = true;
  }

  function handleFeatureSelect(featureId) {
    setTab(featureId);
    showMoreModal = false;
  }

  // カスタムイベントリスナー（他のコンポーネントからのタブ切り替え）
  onMount(() => {
    const handleChangeTab = (event) => {
      setTab(event.detail);
    };
    window.addEventListener('changeTab', handleChangeTab);
    return () => {
      window.removeEventListener('changeTab', handleChangeTab);
    };
  });
</script>

<main>
  <header>
    <div class="container">
      <h1>💼 Money Toolbox</h1>
      <p class="subtitle">日常のお金の判断をサポート</p>
    </div>
  </header>

  <nav class="tabs">
    <div class="container">
      <div class="tab-list">
        {#each mainTabs as tab}
          <button
            class="tab"
            class:active={$activeTab === tab.id}
            on:click={() => setTab(tab.id)}
          >
            <span class="tab-icon">{tab.icon}</span>
            <span class="tab-label">{tab.label}</span>
          </button>
        {/each}
        <button class="tab more-button" on:click={handleMoreClick}>
          <span class="tab-icon">⋯</span>
          <span class="tab-label">もっと見る</span>
        </button>
      </div>
    </div>
  </nav>

  <MoreFeaturesModal
    bind:isOpen={showMoreModal}
    features={moreFeatures}
    onSelect={handleFeatureSelect}
  />

  <div class="container">
    <div class="content">
      {#if $activeTab === 'unit-price'}
        <UnitPriceCalculator />
      {:else if $activeTab === 'discount'}
        <DiscountCalculator />
      {:else if $activeTab === 'tax'}
        <TaxCalculator />
      {:else if $activeTab === 'split'}
        <SplitBillCalculator />
      {:else if $activeTab === 'point'}
        <PointCalculator />
      {:else if $activeTab === 'investment'}
        <InvestmentCalculator />
      {:else if $activeTab === 'hourly-wage'}
        <HourlyWageCalculator />
      {:else if $activeTab === 'savings-goal'}
        <SavingsGoalCalculator />
      {:else if $activeTab === 'subscription'}
        <SubscriptionCalculator />
      {:else if $activeTab === 'fuel-cost'}
        <FuelCostCalculator />
      {:else if $activeTab === 'mortgage'}
        <MortgageLoanCalculator />
      {:else if $activeTab === 'net-salary'}
        <NetSalaryCalculator />
      {:else if $activeTab === 'furusato'}
        <FurusatoTaxCalculator />
      {:else if $activeTab === 'card-rewards'}
        <CreditCardRewardsCalculator />
      {:else if $activeTab === 'loan-refinancing'}
        <LoanRefinancingCalculator />
      {:else if $activeTab === 'fire'}
        <FIRECalculator />
      {:else if $activeTab === 'medical-deduction'}
        <MedicalDeductionCalculator />
      {:else if $activeTab === 'business-income'}
        <BusinessIncomeCalculator />
      {:else if $activeTab === 'tax-filing-checker'}
        <TaxFilingChecker />
      {:else if $activeTab === 'withholding-slip'}
        <WithholdingSlipAnalyzer />
      {/if}
    </div>
  </div>

  <footer>
    <div class="container">
      <p>Money Toolbox · <a href="https://github.com/temeteke/money-toolbox" target="_blank" rel="noopener noreferrer">GitHub</a></p>
    </div>
  </footer>
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    padding: 2rem 0 1.5rem;
    box-shadow: 0 2px 8px var(--shadow);
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    opacity: 0.9;
    font-size: 0.95rem;
  }

  .tabs {
    background: var(--surface);
    border-bottom: 2px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 4px var(--shadow);
  }

  .tab-list {
    display: flex;
    gap: 0.25rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .tab-list::-webkit-scrollbar {
    display: none;
  }

  .tab {
    flex: 0 0 auto;
    min-width: 100px;
    padding: 1rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    border-bottom: 3px solid transparent;
  }

  .tab:hover {
    background: var(--background);
    color: var(--text-primary);
  }

  .tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    font-weight: 600;
  }

  .tab-icon {
    font-size: 1.5rem;
  }

  .tab-label {
    font-size: 0.85rem;
  }

  .more-button {
    background: var(--background);
    border: 1px dashed var(--border-color);
  }

  .more-button:hover {
    background: var(--surface);
    border-color: var(--primary-color);
  }

  .content {
    flex: 1;
    padding: 1.5rem 0;
  }

  footer {
    background: var(--surface);
    padding: 1.5rem 0;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid var(--border-color);
    margin-top: 2rem;
  }

  footer a {
    color: var(--primary-color);
    text-decoration: none;
    transition: opacity 0.2s;
  }

  footer a:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 1.5rem;
    }

    .tab {
      min-width: 90px;
      padding: 0.75rem 0.5rem;
    }

    .tab-icon {
      font-size: 1.25rem;
    }

    .tab-label {
      font-size: 0.75rem;
    }
  }
</style>
