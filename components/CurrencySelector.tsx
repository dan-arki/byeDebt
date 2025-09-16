import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ChevronDown, X, Check, RefreshCw } from 'lucide-react-native';
import { Currency, SUPPORTED_CURRENCIES } from '../types/currency';
import { useCurrency } from '../hooks/useCurrency';
import { HapticService } from '../services/hapticService';

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: Currency) => void;
  showLabel?: boolean;
  compact?: boolean;
}

export default function CurrencySelector({ 
  onCurrencyChange, 
  showLabel = true,
  compact = false 
}: CurrencySelectorProps) {
  const { selectedCurrency, loading, error, changeCurrency, refreshRates } = useCurrency();
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCurrencySelect = async (currency: Currency) => {
    try {
      HapticService.selection();
      await changeCurrency(currency);
      onCurrencyChange?.(currency);
      setShowModal(false);
    } catch (err) {
      HapticService.error();
      console.error('Error selecting currency:', err);
    }
  };

  const handleRefreshRates = async () => {
    try {
      HapticService.light();
      setIsRefreshing(true);
      await refreshRates();
      HapticService.success();
    } catch (err) {
      HapticService.error();
      console.error('Error refreshing rates:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectorPress = () => {
    HapticService.light();
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <ActivityIndicator size="small" color="#1652F0" />
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {showLabel && !compact && (
        <Text style={styles.label}>Currency</Text>
      )}
      
      <TouchableOpacity
        style={[styles.selector, compact && styles.compactSelector]}
        onPress={handleSelectorPress}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.flag}>{selectedCurrency.flag}</Text>
          <Text style={[styles.currencyCode, compact && styles.compactCurrencyCode]}>
            {selectedCurrency.code}
          </Text>
          {!compact && (
            <Text style={styles.currencyName}>{selectedCurrency.name}</Text>
          )}
        </View>
        <ChevronDown size={16} color="#5B616E" strokeWidth={2} />
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Currency Selection Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <View style={styles.modalHeaderActions}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefreshRates}
                disabled={isRefreshing}
              >
                <RefreshCw 
                  size={20} 
                  color="#1652F0" 
                  strokeWidth={2}
                  style={isRefreshing ? { transform: [{ rotate: '180deg' }] } : {}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <X size={24} color="#5B616E" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Choose your preferred currency for displaying amounts throughout the app.
            </Text>

            {SUPPORTED_CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyOption,
                  selectedCurrency.code === currency.code && styles.selectedCurrencyOption
                ]}
                onPress={() => handleCurrencySelect(currency)}
              >
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  <View style={styles.currencyDetails}>
                    <Text style={styles.currencyOptionCode}>{currency.code}</Text>
                    <Text style={styles.currencyOptionName}>{currency.name}</Text>
                  </View>
                  <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                </View>
                {selectedCurrency.code === currency.code && (
                  <Check size={20} color="#1652F0" strokeWidth={2} />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.ratesInfo}>
              <Text style={styles.ratesInfoText}>
                Exchange rates are updated hourly. Last update: {new Date().toLocaleTimeString()}
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  compactContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 12,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  compactSelector: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flag: {
    fontSize: 18,
  },
  currencyCode: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  compactCurrencyCode: {
    fontSize: 14,
  },
  currencyName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF4747',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    marginBottom: 24,
    lineHeight: 22,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedCurrencyOption: {
    backgroundColor: '#E8F4FD',
    borderWidth: 2,
    borderColor: '#1652F0',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  currencyFlag: {
    fontSize: 24,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyOptionCode: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 2,
  },
  currencyOptionName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1652F0',
  },
  ratesInfo: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  ratesInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#5B616E',
    textAlign: 'center',
    lineHeight: 16,
  },
});