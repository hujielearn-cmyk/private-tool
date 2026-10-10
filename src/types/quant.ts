/**
 * JIAJIE / QUANTPLATFORM V4.0 数据契约与类型定义
 * 统一 PaperAccount 体系 · 四轨同起点比较 · LightGBM · 行为假说
 */

export type BuyUniversePolicy = 'STRICT_T0_ONLY' | 'OPEN_MARKET_ALPHA' | 'CUSTOM_POOL';

export type InitializationMode = 'IMPORT_REAL_T0' | 'CASH_ONLY' | 'MANUAL_PORTFOLIO';

export type MarketRegimeType = 'BULL_TREND' | 'BEAR_TREND' | 'CONSOLIDATION_UP' | 'CONSOLIDATION_DOWN' | 'HIGH_VOLATILITY';

export type SignalType = 'ACC_NEW' | 'ACC_ADD' | 'BREAKOUT' | 'PULLBACK' | 'MA_GOLDEN_TRIANGLE' | 'TRIANGLE_CONVERGENCE' | 'DIVERGENCE_HIGH' | 'DISTRIBUTION_RISK' | 'NEUTRAL';

export interface StockCandidate {
  code: string;
  name: string;
  industry: string;
  price: number;
  changePercent: number;
  rvol20: number; // 当日量 / 过去20日均量 (BH-01)
  amountPercentile: number; // 60日成交额分位
  predictedScore: number; // LightGBM 截面预测分
  expectedReturn5D: number; // 预期5日超额收益率 %
  signalType: SignalType;
  signalLabel: string;
  stage: 'S0_PREPARE' | 'S1_CONSOLIDATE' | 'S2_ACCUMULATION' | 'S3_TREND_UP' | 'S4_DIVERGENCE' | 'S5_DISTRIBUTION';
  targetWeight: number; // 建议目标权重 %
  inHolding: boolean; // 是否当前持有
  isT0Locked: boolean; // 是否在 T0 原持股中
  exclusionReason?: string; // 排除原因（若不可交易或不在池内）
  evidenceList: {
    ruleId: string;
    description: string;
    status: 'SUPPORT' | 'CONTRADICT' | 'NEUTRAL';
    value: string;
  }[];
  counterEvidence: string;
  supportConditions: string[];
}

export interface HoldingLot {
  code: string;
  name: string;
  quantity: number; // 总持仓股数
  availableToSell: number; // T+1可卖股数 (EX-02)
  costPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  weight: number;
  isT0Origin: boolean;
}

export interface PaperAccount {
  accountId: string;
  name: string;
  accountRole: 'SHADOW_A_STRICT' | 'SHADOW_B_OPEN' | 'BENCHMARK_C_PASSIVE' | 'CUSTOM_PAPER';
  accountGroupId: string; // 归属 AccountGroup (同T0起点)
  initMode: InitializationMode;
  buyUniversePolicy: BuyUniversePolicy;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  t0Date: string;
  t0TotalAsset: number;
  currentTotalAsset: number;
  freeCash: number;
  positionsValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  benchmarkExcess: number; // 相对被动买入持有C的超额
  allowedWhitelistCodes: string[]; // 若为 STRICT_T0_ONLY 严格锁定这些标的
  holdings: HoldingLot[];
  boundStrategyVersion: string;
  boundStrategyName: string;
}

export interface PaperOrder {
  orderId: string;
  accountId: string;
  timestamp: string;
  code: string;
  name: string;
  direction: 'BUY' | 'SELL';
  targetShares: number;
  executedShares: number;
  orderPrice: number;
  executedPrice: number;
  status: 'FILLED' | 'REJECTED' | 'PENDING' | 'CANCELLED';
  fee: number; // 佣金 (万2.5) + 印花税 (0.05% 仅卖出)
  slippage: number;
  rejectReason?: string;
  ruleCitation?: string;
}

// 四轨同T0起点对比数据点
export interface FourTrackNavPoint {
  date: string;
  shadowA_Nav: number; // 轨道A: 原股受限影子 (STRICT_T0_ONLY)
  shadowB_Nav: number; // 轨道B: 全市场换股影子 (OPEN_MARKET_ALPHA)
  passiveC_Nav: number; // 轨道C: 被动买入持有基准 (BUY_AND_HOLD)
  actualD_Nav: number;  // 轨道D: 真实账户参考 (TWR调整后)
  csi300Nav: number;    // 沪深300指数基准
  externalCashFlow?: number;
}

export interface LightGBMModelSpec {
  modelId: string;
  name: string;
  version: string;
  taskType: 'RANKER' | 'REGRESSOR' | 'CLASSIFIER';
  learningRate: number;
  numLeaves: number;
  minDataInLeaf: number;
  nEstimators: number;
  trainWindow: string;
  oosWindow: string;
  features: {
    name: string;
    category: 'PRICE_VOLUME' | 'MOMENTUM' | 'BEHAVIOR' | 'FINANCIAL';
    importanceGain: number;
    importanceSplit: number;
    ic: number;
  }[];
  metrics: {
    trainIC: number;
    valIC: number;
    oosRankIC: number;
    oosICIR: number;
    calibError: number;
    sharpeOOS: number;
    maxDrawdownOOS: number;
    status: 'PRODUCTION_READY' | 'CANDIDATE' | 'REJECTED';
  };
}

export interface PortfolioConstraintSettings {
  maxSingleStockWeight: number; // 单股最大持仓上限 %
  minCashReserve: number; // 现金缓冲比例 %
  maxTurnover: number; // 单次调仓换手率上限 %
  minLotSize: number; // 100股整手
  universePolicy: BuyUniversePolicy;
  method: 'EQUAL_WEIGHT' | 'INVERSE_VOLATILITY' | 'MEAN_VARIANCE_COST';
}

export interface AttributionLayer {
  layer: 'TRUE_RETURN' | 'ACTIVE_MGMT' | 'STOCK_SELECTION' | 'RISK_EXPOSURE' | 'TRANSACTION_COST' | 'RESIDUAL';
  title: string;
  question: string;
  comparison: string;
  contributionPct: number;
  amount: number;
  explanation: string;
}

export interface OpsTaskItem {
  taskId: string;
  taskName: string;
  stage: 'DAILY_DATA_READY' | 'FEATURE_COMPUTED' | 'PREDICTION_PUBLISHED' | 'ACCOUNT_PLAN_PREPARED' | 'SIM_ORDER_EXECUTED' | 'NAV_SETTLED';
  status: 'SUCCESS' | 'RUNNING' | 'WAITING' | 'FAILED';
  durationMs: number;
  lastRunTime: string;
  details: string;
}

export interface SingleMachineBenchmark {
  metricId: string;
  hardwareComponent: string;
  testLoad: string;
  measuredResult: string;
  standardTarget: string;
  status: 'PASSED' | 'PENDING_AUDIT';
}
