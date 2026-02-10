import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, TabsContent } from '@erp/ui';
import { getFinancialStatements } from '@erp/demo-data';
import { formatCurrency } from '@erp/shared';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  excellent: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  good: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  poor: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const categoryLabels: Record<string, { title: string; description: string }> = {
  profitability: { title: 'Profitability', description: 'Measures how effectively the company generates profit' },
  liquidity: { title: 'Liquidity', description: 'Ability to meet short-term obligations' },
  leverage: { title: 'Leverage', description: 'How the company finances its operations' },
  efficiency: { title: 'Efficiency', description: 'How well the company utilizes its assets' },
};

function formatRatioValue(value: number, unit: string): string {
  if (unit === '$') return formatCurrency(value);
  if (unit === '%') return `${value.toFixed(2)}%`;
  if (unit === 'days') return `${value} days`;
  return `${value.toFixed(2)}x`;
}

export default function FinancialStatementsPage() {
  const statements = useMemo(() => getFinancialStatements(), []);
  const { incomeStatement, balanceSheet, cashFlowStatement, financialRatios } = statements;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Financial Statements</h1>
        <p className="text-xs text-text-muted">
          Investor-ready income statement, balance sheet, cash flow, and financial ratios
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="income-statement">
        <TabsList>
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow Statement</TabsTrigger>
          <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
        </TabsList>

        {/* ============================================ */}
        {/* Income Statement Tab                         */}
        {/* ============================================ */}
        <TabsContent value="income-statement">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Income Statement</CardTitle>
                <span className="text-sm text-text-secondary">Period: {incomeStatement.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue Section */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Revenue</h3>
                <div className="space-y-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {incomeStatement.revenue.map((item) => (
                    <div key={item.account} className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-surface-2">
                      <span className="text-sm text-text-secondary">{item.account}</span>
                      <span className="text-sm font-medium text-text-primary">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 px-3 border-t border-border mt-2">
                    <span className="text-sm font-semibold text-text-primary">Total Revenue</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(incomeStatement.totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Expenses</h3>
                <div className="space-y-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {incomeStatement.expenses.map((item) => (
                    <div key={item.account} className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-surface-2">
                      <span className="text-sm text-text-secondary">{item.account}</span>
                      <span className="text-sm font-medium text-text-primary">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 px-3 border-t border-border mt-2">
                    <span className="text-sm font-semibold text-text-primary">Total Expenses</span>
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(incomeStatement.totalExpenses)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Income */}
              <div className="flex items-center justify-between py-3 px-4 bg-surface-2 rounded-lg border border-border">
                <span className="text-base font-bold text-text-primary">Net Income</span>
                <span className={`text-base font-bold ${incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(incomeStatement.netIncome)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================ */}
        {/* Balance Sheet Tab                            */}
        {/* ============================================ */}
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Balance Sheet</CardTitle>
                <span className="text-sm text-text-secondary">As of: {balanceSheet.asOf}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assets Section */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Assets</h3>
                {balanceSheet.assets.map((category) => (
                  <div key={category.category} className="mb-4">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2 px-3">
                      {category.category}
                    </p>
                    <div className="space-y-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {category.items.map((item) => (
                        <div key={item.account} className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-surface-2">
                          <span className="text-sm text-text-secondary">{item.account}</span>
                          <span className={`text-sm font-medium ${item.amount < 0 ? 'text-red-600' : 'text-text-primary'}`}>
                            {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount))})` : formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2 px-3 border-t border-border">
                  <span className="text-sm font-semibold text-text-primary">Total Assets</span>
                  <span className="text-sm font-bold text-text-primary">
                    {formatCurrency(balanceSheet.totalAssets)}
                  </span>
                </div>
              </div>

              {/* Liabilities Section */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Liabilities</h3>
                {balanceSheet.liabilities.map((category) => (
                  <div key={category.category} className="mb-4">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2 px-3">
                      {category.category}
                    </p>
                    <div className="space-y-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {category.items.map((item) => (
                        <div key={item.account} className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-surface-2">
                          <span className="text-sm text-text-secondary">{item.account}</span>
                          <span className="text-sm font-medium text-text-primary">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2 px-3 border-t border-border">
                  <span className="text-sm font-semibold text-text-primary">Total Liabilities</span>
                  <span className="text-sm font-bold text-text-primary">
                    {formatCurrency(balanceSheet.totalLiabilities)}
                  </span>
                </div>
              </div>

              {/* Equity Section */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Equity</h3>
                <div className="space-y-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {balanceSheet.equity.map((item) => (
                    <div key={item.account} className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-surface-2">
                      <span className="text-sm text-text-secondary">{item.account}</span>
                      <span className="text-sm font-medium text-text-primary">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 px-3 border-t border-border">
                    <span className="text-sm font-semibold text-text-primary">Total Equity</span>
                    <span className="text-sm font-bold text-text-primary">
                      {formatCurrency(balanceSheet.totalEquity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Liabilities + Equity */}
              <div className="flex items-center justify-between py-3 px-4 bg-surface-2 rounded-lg border border-border">
                <span className="text-base font-bold text-text-primary">Total Liabilities + Equity</span>
                <span className="text-base font-bold text-text-primary">
                  {formatCurrency(balanceSheet.totalLiabilities + balanceSheet.totalEquity)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================ */}
        {/* Cash Flow Statement Tab                      */}
        {/* ============================================ */}
        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cash Flow Statement</CardTitle>
                <span className="text-sm text-text-secondary">Period: {cashFlowStatement.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Operating Activities */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-text-primary">Cash Flows from Operating Activities</h3>
                </div>
                <div className="space-y-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {cashFlowStatement.operating.map((item) => (
                    <div key={item.item} className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-surface-2">
                      <span className="text-sm text-text-secondary">{item.item}</span>
                      <span className={`text-sm font-medium ${item.amount < 0 ? 'text-red-600' : 'text-text-primary'}`}>
                        {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount))})` : formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 px-3 border-t border-border mt-2 bg-blue-50 rounded-md">
                    <span className="text-sm font-semibold text-blue-800">Net Cash from Operating Activities</span>
                    <span className={`text-sm font-bold ${cashFlowStatement.totalOperating >= 0 ? 'text-blue-800' : 'text-red-600'}`}>
                      {formatCurrency(cashFlowStatement.totalOperating)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Investing Activities */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-amber-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-text-primary">Cash Flows from Investing Activities</h3>
                </div>
                <div className="space-y-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {cashFlowStatement.investing.map((item) => (
                    <div key={item.item} className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-surface-2">
                      <span className="text-sm text-text-secondary">{item.item}</span>
                      <span className={`text-sm font-medium ${item.amount < 0 ? 'text-red-600' : 'text-text-primary'}`}>
                        {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount))})` : formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 px-3 border-t border-border mt-2 bg-amber-50 rounded-md">
                    <span className="text-sm font-semibold text-amber-800">Net Cash from Investing Activities</span>
                    <span className={`text-sm font-bold ${cashFlowStatement.totalInvesting >= 0 ? 'text-amber-800' : 'text-red-700'}`}>
                      {cashFlowStatement.totalInvesting < 0
                        ? `(${formatCurrency(Math.abs(cashFlowStatement.totalInvesting))})`
                        : formatCurrency(cashFlowStatement.totalInvesting)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financing Activities */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-purple-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-text-primary">Cash Flows from Financing Activities</h3>
                </div>
                <div className="space-y-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {cashFlowStatement.financing.map((item) => (
                    <div key={item.item} className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-surface-2">
                      <span className="text-sm text-text-secondary">{item.item}</span>
                      <span className={`text-sm font-medium ${item.amount < 0 ? 'text-red-600' : 'text-text-primary'}`}>
                        {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount))})` : formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 px-3 border-t border-border mt-2 bg-purple-50 rounded-md">
                    <span className="text-sm font-semibold text-purple-800">Net Cash from Financing Activities</span>
                    <span className={`text-sm font-bold ${cashFlowStatement.totalFinancing >= 0 ? 'text-purple-800' : 'text-red-700'}`}>
                      {cashFlowStatement.totalFinancing < 0
                        ? `(${formatCurrency(Math.abs(cashFlowStatement.totalFinancing))})`
                        : formatCurrency(cashFlowStatement.totalFinancing)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Change in Cash */}
              <div className="border-t-2 border-border pt-4 space-y-3">
                <div className="flex items-center justify-between py-2 px-4 bg-surface-2 rounded-lg border border-border">
                  <span className="text-sm font-bold text-text-primary">Net Change in Cash</span>
                  <span className={`text-sm font-bold ${cashFlowStatement.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(cashFlowStatement.netChange)}
                  </span>
                </div>

                {/* Beginning / Ending Cash Reconciliation */}
                <div className="bg-surface-2 rounded-lg border border-border px-4 py-3 space-y-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Beginning Cash Balance</span>
                    <span className="text-sm font-medium text-text-primary">{formatCurrency(cashFlowStatement.beginningCash)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Net Change in Cash</span>
                    <span className={`text-sm font-medium ${cashFlowStatement.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {cashFlowStatement.netChange >= 0 ? '+' : ''}{formatCurrency(cashFlowStatement.netChange)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-text-primary">Ending Cash Balance</span>
                      <span className="text-base font-bold text-green-600">{formatCurrency(cashFlowStatement.endingCash)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================ */}
        {/* Financial Ratios Tab                         */}
        {/* ============================================ */}
        <TabsContent value="ratios">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(Object.entries(financialRatios) as [string, typeof financialRatios.profitability][]).map(
              ([categoryKey, ratios]) => {
                const label = categoryLabels[categoryKey];
                return (
                  <Card key={categoryKey}>
                    <CardHeader>
                      <div>
                        <CardTitle>{label.title}</CardTitle>
                        <p className="text-xs text-text-muted mt-0.5">{label.description}</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {ratios.map((ratio) => {
                          const colors = statusColors[ratio.status] || statusColors.good;
                          return (
                            <div
                              key={ratio.name}
                              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-2 transition-colors"
                            >
                              <div className="flex-1 min-w-0 mr-4">
                                <p className="text-sm font-medium text-text-primary">{ratio.name}</p>
                                <p className="text-xs text-text-muted mt-0.5">
                                  Benchmark: {ratio.benchmark}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span
                                  className="text-sm font-semibold text-text-primary"
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {formatRatioValue(ratio.value, ratio.unit)}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                  {ratio.status.charAt(0).toUpperCase() + ratio.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
