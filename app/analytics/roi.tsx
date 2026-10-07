import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppHeader } from '@/components/layout/app-header';
import { ResponsiveGrid } from '@/components/layout/responsive-grid';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Divider,
  Icon,
  IconButton,
  Skeleton,
} from '@/components/ui';
import { useEventROIAnalysis } from '@/hooks/use-analytics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/use-responsive';
import { calculateEventROIAnalysis } from '@/services/analytics/roi-calculator';
import { useAppStore } from '@/stores/use-app-store';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { EventCostInputs, RevenueModelInputs } from '@/types/analytics';

export default function EventROIScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { isTablet, isDesktop } = useResponsive();
  const activeEventId = useAppStore((state) => state.activeEventId);

  // Default baseline cost inputs
  const [costInputs, setCostInputs] = useState<EventCostInputs>({
    eventCost: 4500,
    travelCost: 4500,
    boothCost: 14000,
    marketingCost: 2000,
    staffCost: 3500,
    otherExpenses: 1500,
  });

  // Default baseline revenue assumptions
  const [revenueInputs, setRevenueInputs] = useState<RevenueModelInputs>({
    averageDealSize: 18500,
    estimatedCloseRatePercent: 15,
  });

  // Modal edit state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [draftCosts, setDraftCosts] = useState<EventCostInputs>({ ...costInputs });
  const [draftRevenue, setDraftRevenue] = useState<RevenueModelInputs>({ ...revenueInputs });

  // Fetch initial base report
  const { data: baseReport, isLoading } = useEventROIAnalysis(activeEventId || 'evt-2026-ces');

  // Recalculate pure utility whenever costInputs or revenueInputs change
  const report = useMemo(() => {
    if (!baseReport) return null;
    return calculateEventROIAnalysis(
      baseReport.eventId,
      baseReport.eventName,
      costInputs,
      revenueInputs,
      baseReport.actuals
    );
  }, [baseReport, costInputs, revenueInputs]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    []
  );

  const handleOpenEdit = () => {
    setDraftCosts({ ...costInputs });
    setDraftRevenue({ ...revenueInputs });
    setIsEditModalVisible(true);
  };

  const handleSaveEdits = () => {
    setCostInputs({ ...draftCosts });
    setRevenueInputs({ ...draftRevenue });
    setIsEditModalVisible(false);
  };

  const handleResetDefaults = () => {
    const defaultsCost: EventCostInputs = {
      eventCost: 4500,
      travelCost: 4500,
      boothCost: 14000,
      marketingCost: 2000,
      staffCost: 3500,
      otherExpenses: 1500,
    };
    const defaultsRevenue: RevenueModelInputs = {
      averageDealSize: 18500,
      estimatedCloseRatePercent: 15,
    };
    setCostInputs(defaultsCost);
    setRevenueInputs(defaultsRevenue);
    setDraftCosts(defaultsCost);
    setDraftRevenue(defaultsRevenue);
    setIsEditModalVisible(false);
  };

  if (isLoading || !report) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Event ROI Analytics"
            subtitle="Trade-show expenditure vs pipeline yield analysis"
            action={
              <Button
                label="Back"
                variant="outline"
                size="sm"
                leftIcon="ChevronLeft"
                onPress={() => router.back()}
              />
            }
          />
        }>
        <View style={{ gap: Spacing.sm }}>
          <Skeleton width="100%" height={80} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={160} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={240} style={{ borderRadius: Radius.large }} />
        </View>
      </ScreenContainer>
    );
  }

  const { actuals, costBreakdown, funnelStages } = report;

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Event ROI Analytics"
          subtitle={`${report.eventName} • Expenditure vs yield analysis`}
          action={
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Button
                label="Edit Inputs"
                variant="outline"
                size="sm"
                leftIcon="Sliders"
                onPress={handleOpenEdit}
              />
              <Button
                label="Back"
                variant="ghost"
                size="sm"
                leftIcon="ChevronLeft"
                onPress={() => router.back()}
              />
            </View>
          }
        />
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ============================================================ */}
        {/* 1. FINANCIAL ESTIMATE TRANSPARENCY DISCLAIMER                 */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(240)}>
          <Card
            density="comfortable"
            style={[
              styles.disclaimerCard,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}>
            <CardContent style={styles.disclaimerContent}>
              <View style={styles.disclaimerHeader}>
                <Icon name="Info" size={16} color={theme.primary} />
                <AppText weight="bold" variant="body" color="primary">
                  Financial Model Transparency
                </AppText>
              </View>
              <AppText variant="caption" color="secondary" style={styles.disclaimerText}>
                Total Event Cost, Leads, and Cost Per Lead are{' '}
                <AppText variant="caption" weight="bold">
                  actual recorded figures
                </AppText>
                . Projected Revenue and ROI are{' '}
                <AppText variant="caption" weight="bold">
                  hypothetical model estimates
                </AppText>{' '}
                based on your configured ${report.revenueInputs.averageDealSize.toLocaleString()} deal size and{' '}
                {report.revenueInputs.estimatedCloseRatePercent}% close rate.
              </AppText>
              <View style={styles.legendBadgesRow}>
                <Badge label="ACTUAL RECORDED VALUE" variant="success" size="sm" showDot />
                <Badge label="HYPOTHETICAL MODEL ESTIMATE" variant="primary" size="sm" />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* 2. PRIMARY METRICS DASHBOARD                                  */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(40)}>
          <ResponsiveGrid gap={10} columns={isTablet || isDesktop ? 4 : 2}>
            {/* Metric 1: Total Event Cost (Actual) */}
            <Card density="compact">
              <CardContent style={styles.metricCardInner}>
                <View style={styles.metricHeaderRow}>
                  <AppText variant="caption" color="secondary">
                    Total Event Cost
                  </AppText>
                  <Badge label="ACTUAL" variant="outline" size="sm" />
                </View>
                <AppText variant="title" weight="bold" tabular>
                  {currencyFormatter.format(report.totalEventCost)}
                </AppText>
                <AppText variant="caption" color="muted">
                  Sum of 6 expense categories
                </AppText>
              </CardContent>
            </Card>

            {/* Metric 2: Total Leads (Actual) */}
            <Card density="compact">
              <CardContent style={styles.metricCardInner}>
                <View style={styles.metricHeaderRow}>
                  <AppText variant="caption" color="secondary">
                    Total Leads
                  </AppText>
                  <Badge label="ACTUAL" variant="success" size="sm" />
                </View>
                <AppText variant="title" weight="bold" tabular>
                  {actuals.totalLeads}
                </AppText>
                <AppText variant="caption" color="muted">
                  Scanned attendee badges & cards
                </AppText>
              </CardContent>
            </Card>

            {/* Metric 3: Qualified Leads (Actual) */}
            <Card density="compact">
              <CardContent style={styles.metricCardInner}>
                <View style={styles.metricHeaderRow}>
                  <AppText variant="caption" color="secondary">
                    Qualified Leads
                  </AppText>
                  <Badge label="ACTUAL" variant="success" size="sm" />
                </View>
                <AppText variant="title" weight="bold" color="primary" tabular>
                  {actuals.qualifiedLeads}
                </AppText>
                <AppText variant="caption" color="muted">
                  {Math.round((actuals.qualifiedLeads / (actuals.totalLeads || 1)) * 100)}% qualification rate
                </AppText>
              </CardContent>
            </Card>

            {/* Metric 4: Hot Leads (Actual) */}
            <Card density="compact">
              <CardContent style={styles.metricCardInner}>
                <View style={styles.metricHeaderRow}>
                  <AppText variant="caption" color="secondary">
                    Hot Leads
                  </AppText>
                  <Badge label="ACTUAL" variant="danger" size="sm" />
                </View>
                <AppText variant="title" weight="bold" tabular>
                  {actuals.hotLeads}
                </AppText>
                <AppText variant="caption" color="muted">
                  Immediate buying intent
                </AppText>
              </CardContent>
            </Card>

            {/* Metric 5: Meetings (Actual) */}
            <Card density="compact">
              <CardContent style={styles.metricCardInner}>
                <View style={styles.metricHeaderRow}>
                  <AppText variant="caption" color="secondary">
                    Meetings Held
                  </AppText>
                  <Badge label="ACTUAL" variant="outline" size="sm" />
                </View>
                <AppText variant="title" weight="bold" tabular>
                  {actuals.meetings}
                </AppText>
                <AppText variant="caption" color="muted">
                  Show floor consultations
                </AppText>
              </CardContent>
            </Card>

            {/* Metric 6: Cost Per Lead (Actual) */}
            <Card density="compact">
              <CardContent style={styles.metricCardInner}>
                <View style={styles.metricHeaderRow}>
                  <AppText variant="caption" color="secondary">
                    Cost Per Lead (CPL)
                  </AppText>
                  <Badge label="ACTUAL" variant="outline" size="sm" />
                </View>
                <AppText variant="title" weight="bold" tabular>
                  {currencyFormatter.format(report.costPerLead)}
                </AppText>
                <AppText variant="caption" color="muted">
                  Total cost ÷ all leads
                </AppText>
              </CardContent>
            </Card>

            {/* Metric 7: Cost Per Qualified Lead (Actual) */}
            <Card density="compact">
              <CardContent style={styles.metricCardInner}>
                <View style={styles.metricHeaderRow}>
                  <AppText variant="caption" color="secondary">
                    Cost / Qual. Lead
                  </AppText>
                  <Badge label="ACTUAL" variant="success" size="sm" />
                </View>
                <AppText variant="title" weight="bold" color="success" tabular>
                  {currencyFormatter.format(report.costPerQualifiedLead)}
                </AppText>
                <AppText variant="caption" color="muted">
                  Target threshold &lt; $400
                </AppText>
              </CardContent>
            </Card>

            {/* Metric 8: Estimated Revenue (Estimated) */}
            <Card density="compact">
              <CardContent style={styles.metricCardInner}>
                <View style={styles.metricHeaderRow}>
                  <AppText variant="caption" color="secondary">
                    Estimated Revenue
                  </AppText>
                  <Badge label="ESTIMATED" variant="primary" size="sm" />
                </View>
                <AppText variant="title" weight="bold" color="primary" tabular>
                  {currencyFormatter.format(report.estimatedRevenue)}
                </AppText>
                <AppText variant="caption" color="muted">
                  Model at {report.revenueInputs.estimatedCloseRatePercent}% close
                </AppText>
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </Animated.View>

        {/* ============================================================ */}
        {/* 3. ROI SUMMARY (HERO EXECUTIVE CARD)                          */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(80)}>
          <Card
            density="comfortable"
            style={[
              styles.roiExecutiveCard,
              { borderColor: theme.primary, backgroundColor: theme.primarySubtle },
            ]}>
            <CardContent style={styles.roiExecutiveContent}>
              <View style={styles.roiHeaderRow}>
                <View style={{ gap: 2 }}>
                  <View style={styles.badgeLabelRow}>
                    <AppText variant="caption" color="secondary" weight="bold">
                      PROJECTED BOOTH ROI MULTIPLIER
                    </AppText>
                    <Badge label="ESTIMATED" variant="primary" size="sm" />
                  </View>
                  <AppText
                    variant="title"
                    weight="bold"
                    color="primary"
                    style={{ fontSize: 38, lineHeight: 44 }}>
                    {report.roiMultiplier}x
                  </AppText>
                </View>
                <View style={styles.roiBadgeCol}>
                  <Badge
                    label={report.roiMultiplier >= 2 ? 'HIGH YIELD RETURN' : 'CAPITAL POSITIVE'}
                    variant="success"
                    size="md"
                    showDot
                  />
                  <AppText variant="caption" weight="bold" color="success">
                    +{report.estimatedRoiPercent}% ROI
                  </AppText>
                </View>
              </View>

              <Divider />

              <View style={styles.roiMetricsRow}>
                <View style={styles.roiMetricCol}>
                  <AppText variant="caption" color="muted">
                    Total Invested [Actual]
                  </AppText>
                  <AppText variant="body" weight="bold" tabular>
                    {currencyFormatter.format(report.totalEventCost)}
                  </AppText>
                </View>
                <View style={styles.roiMetricCol}>
                  <AppText variant="caption" color="muted">
                    Est. Realized [Model]
                  </AppText>
                  <AppText variant="body" weight="bold" color="primary" tabular>
                    {currencyFormatter.format(report.estimatedRevenue)}
                  </AppText>
                </View>
                <View style={styles.roiMetricCol}>
                  <AppText variant="caption" color="muted">
                    Net Return [Model]
                  </AppText>
                  <AppText variant="body" weight="bold" color="success" tabular>
                    +{currencyFormatter.format(report.netProfit)}
                  </AppText>
                </View>
                <View style={styles.roiMetricCol}>
                  <AppText variant="caption" color="muted">
                    Break-Even Needed
                  </AppText>
                  <AppText variant="body" weight="bold" tabular>
                    {report.breakEvenDealsNeeded} deals
                  </AppText>
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* 4. COST BREAKDOWN                                             */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.cardHeaderWithAction}>
                <View style={{ gap: 2 }}>
                  <View style={styles.titleWithBadge}>
                    <CardTitle level={2}>Event Cost Breakdown</CardTitle>
                    <Badge label="ACTUAL EXPENSES" variant="success" size="sm" showDot />
                  </View>
                  <AppText variant="caption" color="secondary">
                    Total budget expenditure: {currencyFormatter.format(report.totalEventCost)}
                  </AppText>
                </View>
                <Button
                  label="Edit Costs"
                  variant="outline"
                  size="sm"
                  leftIcon="Edit3"
                  onPress={handleOpenEdit}
                />
              </View>
            </CardHeader>
            <CardContent style={styles.costBreakdownList}>
              {costBreakdown.map((item) => (
                <View key={item.key} style={styles.costItemRow}>
                  <View style={styles.costItemHeader}>
                    <View style={styles.costNameGroup}>
                      <View style={[styles.costColorDot, { backgroundColor: item.color }]} />
                      <AppText weight="semibold" variant="body">
                        {item.label}
                      </AppText>
                    </View>
                    <View style={styles.costValuesGroup}>
                      <AppText weight="bold" variant="body" tabular>
                        {currencyFormatter.format(item.amount)}
                      </AppText>
                      <Badge label={`${item.percentage}%`} variant="outline" size="sm" />
                    </View>
                  </View>
                  <View style={[styles.costTrack, { backgroundColor: theme.surfaceSubtle }]}>
                    <View
                      style={[
                        styles.costFill,
                        {
                          width: `${Math.max(2, item.percentage)}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </CardContent>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* 5. LEAD FUNNEL PROGRESSION                                    */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(160)}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.titleWithBadge}>
                <CardTitle level={2}>Booth Lead Conversion Funnel</CardTitle>
                <Badge label="STAGES & YIELD" variant="outline" size="sm" />
              </View>
            </CardHeader>
            <CardContent style={styles.funnelList}>
              {funnelStages.map((stage, index) => {
                const widthPercent = Math.max(16, stage.conversionFromTotal);

                return (
                  <View key={stage.stageKey} style={styles.funnelItem}>
                    <View style={styles.funnelHeaderRow}>
                      <View style={styles.funnelLeftGroup}>
                        <View
                          style={[
                            styles.funnelStepNum,
                            { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                          ]}>
                          <AppText variant="caption" weight="bold" style={{ fontSize: 11 }}>
                            {index + 1}
                          </AppText>
                        </View>
                        <AppText weight="bold" variant="body">
                          {stage.label}
                        </AppText>
                        <Badge
                          label={stage.isEstimated ? 'ESTIMATED' : 'ACTUAL'}
                          variant={stage.isEstimated ? 'primary' : 'success'}
                          size="sm"
                        />
                      </View>
                      <View style={styles.funnelRightGroup}>
                        <AppText weight="bold" variant="body" tabular>
                          {stage.count} {stage.stageKey === 'closed_deals' ? 'deals' : 'leads'}
                        </AppText>
                        <AppText variant="caption" color="secondary" tabular>
                          ({stage.conversionFromTotal}%)
                        </AppText>
                      </View>
                    </View>

                    {/* Funnel Progress Width Bar */}
                    <View style={[styles.funnelTrack, { backgroundColor: theme.surfaceSubtle }]}>
                      <View
                        style={[
                          styles.funnelFill,
                          {
                            width: `${widthPercent}%`,
                            backgroundColor: stage.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </CardContent>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* 6. REVENUE SUMMARY & MODEL INPUTS                             */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(200)}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.cardHeaderWithAction}>
                <View style={styles.titleWithBadge}>
                  <CardTitle level={2}>Revenue Model Summary</CardTitle>
                  <Badge label="HYPOTHETICAL MODEL" variant="primary" size="sm" />
                </View>
                <Button
                  label="Tweak Model"
                  variant="outline"
                  size="sm"
                  leftIcon="Sliders"
                  onPress={handleOpenEdit}
                />
              </View>
            </CardHeader>
            <CardContent style={styles.revenueSummaryContent}>
              <View style={[styles.assumptionsBox, { backgroundColor: theme.surfaceSubtle }]}>
                <View style={styles.assumptionRow}>
                  <AppText variant="caption" color="secondary">
                    Average Contract Value (ACV):
                  </AppText>
                  <AppText variant="body" weight="bold" tabular>
                    {currencyFormatter.format(report.revenueInputs.averageDealSize)}
                  </AppText>
                </View>
                <View style={styles.assumptionRow}>
                  <AppText variant="caption" color="secondary">
                    Assumed Qualified Close Rate:
                  </AppText>
                  <AppText variant="body" weight="bold" color="primary" tabular>
                    {report.revenueInputs.estimatedCloseRatePercent}%
                  </AppText>
                </View>
                <View style={styles.assumptionRow}>
                  <AppText variant="caption" color="secondary">
                    Qualified Accounts in Scope:
                  </AppText>
                  <AppText variant="body" weight="bold" tabular>
                    {actuals.qualifiedLeads} accounts
                  </AppText>
                </View>
              </View>

              <Divider />

              <View style={styles.resultsGrid}>
                <View style={styles.resultCol}>
                  <AppText variant="caption" color="muted">
                    Total Pipeline Generated
                  </AppText>
                  <AppText variant="title" weight="bold" tabular>
                    {currencyFormatter.format(report.pipelineValue)}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    {actuals.qualifiedLeads} × {currencyFormatter.format(report.revenueInputs.averageDealSize)}
                  </AppText>
                </View>

                <View style={styles.resultCol}>
                  <AppText variant="caption" color="muted">
                    Est. Realized Revenue
                  </AppText>
                  <AppText variant="title" weight="bold" color="primary" tabular>
                    {currencyFormatter.format(report.estimatedRevenue)}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    {report.projectedDeals} deals @ {report.revenueInputs.estimatedCloseRatePercent}% close
                  </AppText>
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* ============================================================ */}
      {/* 7. INTERACTIVE COST & REVENUE INPUT ADJUSTMENT MODAL         */}
      {/* ============================================================ */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              Shadows.modal,
            ]}>
            <View style={styles.modalHeader}>
              <View style={{ gap: 2 }}>
                <CardTitle level={2}>Adjust Financial Inputs</CardTitle>
                <AppText variant="caption" color="secondary">
                  Update costs and revenue assumptions to recalculate ROI
                </AppText>
              </View>
              <IconButton
                icon="X"
                size="sm"
                variant="ghost"
                accessibilityLabel="Close financial inputs modal"
                onPress={() => setIsEditModalVisible(false)}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <AppText variant="caption" weight="bold" color="primary" style={{ marginBottom: 4 }}>
                1. EVENT EXPENSES (ACTUAL COSTS)
              </AppText>

              {/* Event Registration Cost */}
              <View style={styles.inputGroup}>
                <AppText variant="caption" weight="semibold">
                  Event Registration & Badges ($)
                </AppText>
                <TextInput
                  keyboardType="numeric"
                  value={String(draftCosts.eventCost)}
                  onChangeText={(val) =>
                    setDraftCosts({ ...draftCosts, eventCost: Number(val) || 0 })
                  }
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                />
              </View>

              {/* Travel Cost */}
              <View style={styles.inputGroup}>
                <AppText variant="caption" weight="semibold">
                  Staff Travel, Lodging & Meals ($)
                </AppText>
                <TextInput
                  keyboardType="numeric"
                  value={String(draftCosts.travelCost)}
                  onChangeText={(val) =>
                    setDraftCosts({ ...draftCosts, travelCost: Number(val) || 0 })
                  }
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                />
              </View>

              {/* Booth Cost */}
              <View style={styles.inputGroup}>
                <AppText variant="caption" weight="semibold">
                  Booth Space, Buildout & Power ($)
                </AppText>
                <TextInput
                  keyboardType="numeric"
                  value={String(draftCosts.boothCost)}
                  onChangeText={(val) =>
                    setDraftCosts({ ...draftCosts, boothCost: Number(val) || 0 })
                  }
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                />
              </View>

              {/* Marketing Cost */}
              <View style={styles.inputGroup}>
                <AppText variant="caption" weight="semibold">
                  Marketing Collateral & Swag ($)
                </AppText>
                <TextInput
                  keyboardType="numeric"
                  value={String(draftCosts.marketingCost)}
                  onChangeText={(val) =>
                    setDraftCosts({ ...draftCosts, marketingCost: Number(val) || 0 })
                  }
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                />
              </View>

              {/* Staff Cost */}
              <View style={styles.inputGroup}>
                <AppText variant="caption" weight="semibold">
                  Booth Staff Allocation & Overtime ($)
                </AppText>
                <TextInput
                  keyboardType="numeric"
                  value={String(draftCosts.staffCost)}
                  onChangeText={(val) =>
                    setDraftCosts({ ...draftCosts, staffCost: Number(val) || 0 })
                  }
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                />
              </View>

              {/* Other Expenses */}
              <View style={styles.inputGroup}>
                <AppText variant="caption" weight="semibold">
                  Other Shipping & Contingency ($)
                </AppText>
                <TextInput
                  keyboardType="numeric"
                  value={String(draftCosts.otherExpenses)}
                  onChangeText={(val) =>
                    setDraftCosts({ ...draftCosts, otherExpenses: Number(val) || 0 })
                  }
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                />
              </View>

              <Divider style={{ marginVertical: Spacing.sm }} />

              <AppText variant="caption" weight="bold" color="primary" style={{ marginBottom: 4 }}>
                2. REVENUE MODEL ASSUMPTIONS (ESTIMATES)
              </AppText>

              {/* Average Deal Size */}
              <View style={styles.inputGroup}>
                <AppText variant="caption" weight="semibold">
                  Average Deal Size / ACV ($)
                </AppText>
                <TextInput
                  keyboardType="numeric"
                  value={String(draftRevenue.averageDealSize)}
                  onChangeText={(val) =>
                    setDraftRevenue({ ...draftRevenue, averageDealSize: Number(val) || 0 })
                  }
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                />
              </View>

              {/* Close Rate % */}
              <View style={styles.inputGroup}>
                <AppText variant="caption" weight="semibold">
                  Estimated Qualified Close Rate (%)
                </AppText>
                <TextInput
                  keyboardType="numeric"
                  value={String(draftRevenue.estimatedCloseRatePercent)}
                  onChangeText={(val) =>
                    setDraftRevenue({
                      ...draftRevenue,
                      estimatedCloseRatePercent: Number(val) || 0,
                    })
                  }
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                label="Reset Defaults"
                variant="ghost"
                size="md"
                onPress={handleResetDefaults}
              />
              <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
                <Button
                  label="Cancel"
                  variant="outline"
                  size="md"
                  onPress={() => setIsEditModalVisible(false)}
                />
                <Button
                  label="Recalculate ROI"
                  variant="primary"
                  size="md"
                  onPress={handleSaveEdits}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  disclaimerCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  disclaimerContent: {
    gap: 6,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disclaimerText: {
    lineHeight: 18,
  },
  legendBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 4,
  },
  metricCardInner: {
    gap: 4,
    alignItems: 'flex-start',
  },
  metricHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  roiExecutiveCard: {
    borderWidth: 1.5,
  },
  roiExecutiveContent: {
    gap: Spacing.md,
  },
  roiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roiBadgeCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  roiMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  roiMetricCol: {
    gap: 2,
  },
  cardHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  costBreakdownList: {
    gap: Spacing.sm,
  },
  costItemRow: {
    gap: 4,
  },
  costItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  costColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  costValuesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  costTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  costFill: {
    height: '100%',
    borderRadius: 3,
  },
  funnelList: {
    gap: Spacing.sm,
  },
  funnelItem: {
    gap: 4,
  },
  funnelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  funnelLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  funnelStepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  funnelRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  funnelTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  funnelFill: {
    height: '100%',
    borderRadius: 4,
  },
  revenueSummaryContent: {
    gap: Spacing.sm,
  },
  assumptionsBox: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    gap: 6,
  },
  assumptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  resultCol: {
    flex: 1,
    gap: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    padding: Spacing.md,
    borderRadius: Radius.large,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalScroll: {
    maxHeight: 380,
  },
  inputGroup: {
    gap: 4,
    marginBottom: Spacing.xs + 2,
  },
  textInput: {
    height: 40,
    borderRadius: Radius.medium,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
});
