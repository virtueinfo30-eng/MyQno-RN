import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme';
import { fetchWalletBalance, fetchWalletInvoices } from '../api';

export const WalletScreen = () => {
  const [balance, setBalance] = useState('0.00');
  const [currency, setCurrency] = useState('USD');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);

    // Load balance
    const balanceResult = await fetchWalletBalance();
    if (balanceResult.success) {
      setBalance(balanceResult.balance);
      setCurrency(balanceResult.currency);
    }

    // Load invoices
    const invoicesResult = await fetchWalletInvoices();
    if (invoicesResult.success) {
      setInvoices(invoicesResult.data);
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const getTransactionTypeColor = type => {
    if (type === 'credit' || type === 'C') return '#4CAF50';
    if (type === 'debit' || type === 'D') return '#F44336';
    return theme.colors.textSecondary;
  };

  const renderInvoiceItem = ({ item }) => (
    <View style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceLeft}>
          <Text style={styles.invoiceTitle}>
            {item.invoice_type || item.package_name || 'Transaction'}
          </Text>
          <Text style={styles.invoiceDate}>
            {item.invoice_date || item.created_date || 'N/A'}
          </Text>
        </View>
        <View style={styles.invoiceRight}>
          <Text
            style={[
              styles.invoiceAmount,
              { color: getTransactionTypeColor(item.transaction_type) },
            ]}
          >
            {item.transaction_type === 'D' || item.transaction_type === 'debit'
              ? '-'
              : '+'}
            {currency} {item.amount || item.invoice_amount || '0.00'}
          </Text>
          <Text style={styles.invoiceStatus}>{item.status || 'Completed'}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.invoiceDescription}>{item.description}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>
          {currency} {balance}
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonOutline]}
          >
            <Text
              style={[styles.actionButtonText, styles.actionButtonTextOutline]}
            >
              Send Money
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction History */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Transaction History</Text>
      </View>

      <FlatList
        data={invoices}
        renderItem={renderInvoiceItem}
        keyExtractor={(item, index) => item.invoice_id || `invoice_${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading transactions...' : 'No transactions found'}
            </Text>
            <Text style={styles.emptySubtext}>
              Your transaction history will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  balanceCard: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
    margin: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: theme.spacing.s,
  },
  balanceAmount: {
    fontSize: theme.fontSize.xxlarge * 1.5,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.l,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
  },
  actionButtonTextOutline: {
    color: theme.colors.white,
  },
  historyHeader: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  historyTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  listContainer: {
    padding: theme.spacing.m,
  },
  invoiceCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceLeft: {
    flex: 1,
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: theme.fontSize.medium,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  invoiceDate: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
  },
  invoiceAmount: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  invoiceStatus: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
  },
  invoiceDescription: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.s,
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 3,
  },
  emptyText: {
    fontSize: theme.fontSize.large,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
  },
  emptySubtext: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
});
