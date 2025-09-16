import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { DollarSign } from 'lucide-react-native';
import { useCurrency } from '../hooks/useCurrency';
import CurrencySelector from './CurrencySelector';

interface CurrencyAmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showCurrencySelector?: boolean;
}

export default function CurrencyAmountInput({ 
  value, 
  onChangeText, 
  placeholder = "0.00",
  showCurrencySelector = true 
}: CurrencyAmountInputProps) {
  const { selectedCurrency, formatAmount } = useCurrency();
  const [displayValue, setDisplayValue] = useState(value);
  const [currentSymbol, setCurrentSymbol] = useState(selectedCurrency.symbol);

  // Update symbol when currency changes
  useEffect(() => {
    setCurrentSymbol(selectedCurrency.symbol);
  }, [selectedCurrency]);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleTextChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanText.split('.');
    const formattedText = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join('')}`
      : cleanText;

    setDisplayValue(formattedText);
    onChangeText(formattedText);
  };

  const handleCurrencyChange = (currency: any) => {
    // Update the symbol immediately when currency changes
    setCurrentSymbol(currency.symbol);
  };

  const getFormattedPreview = () => {
    const numericValue = parseFloat(displayValue) || 0;
    if (numericValue > 0) {
      return formatAmount(numericValue);
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.currencySymbol}>
          <Text style={styles.symbolText}>{currentSymbol}</Text>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          value={displayValue}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          placeholderTextColor="#C1C8CD"
        />
        {showCurrencySelector && (
          <View style={styles.currencySelectorContainer}>
            <CurrencySelector 
              compact={true} 
              showLabel={false} 
              onCurrencyChange={handleCurrencyChange}
            />
          </View>
        )}
      </View>
      
      {getFormattedPreview() && (
        <Text style={styles.previewText}>
          Preview: {getFormattedPreview()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  currencySymbol: {
    minWidth: 24,
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1652F0',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#050F19',
  },
  currencySelectorContainer: {
    marginLeft: 8,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1652F0',
    marginTop: 8,
    textAlign: 'right',
  },
});