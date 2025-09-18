import { Tabs } from 'expo-router';
import { View, TouchableOpacity, Platform } from 'react-native';
import React, { createContext, useContext, useState } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Chrome as Home, CreditCard, Plus, ChartBar as BarChart3, User } from 'lucide-react-native';
import { HapticService, HapticType } from '../../services/hapticService';
import AddDebtBottomSheet from '../../components/AddDebtBottomSheet';
import { useDebts } from '../../hooks/useDebts';

// Context for managing the add debt modal across tabs
interface AddDebtContextType {
  showAddDebt: boolean;
  setShowAddDebt: (show: boolean) => void;
}

const AddDebtContext = createContext<AddDebtContextType | null>(null);

export const useAddDebt = () => {
  const context = useContext(AddDebtContext);
  if (!context) {
    throw new Error('useAddDebt must be used within AddDebtProvider');
  }
  return context;
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function CustomTabBar({ state, descriptors, navigation, onAddPress }: any) {
  const addButtonScale = useSharedValue(1);
  
  const addButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addButtonScale.value }],
  }));

  const handleAddPress = () => {
    // Haptic feedback for add button
    HapticService.medium();
    
    // Scale animation
    addButtonScale.value = withTiming(0.9, { duration: 100 }, () => {
      addButtonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    });
    
    // Trigger the add debt modal
    onAddPress();
  };

  const handleTabPress = (route: any, isFocused: boolean, navigation: any) => {
    // Light haptic for tab navigation
    HapticService.light();
    
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  // Filter out the add-placeholder route for rendering
  const visibleRoutes = state.routes.filter(route => route.name !== 'add-placeholder');

  return (
    <View style={{
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 34 : 20,
      left: 20,
      right: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      paddingVertical: 12,
      paddingHorizontal: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 16,
      borderWidth: 1,
      borderColor: '#F0F2F5',
    }}>
      {/* First two tabs */}
      <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-around' }}>
        {visibleRoutes.slice(0, 2).map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const originalIndex = state.routes.findIndex(r => r.key === route.key);
          const isFocused = state.index === originalIndex;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={() => handleTabPress(route, isFocused, navigation)}
              style={{
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                minWidth: 60,
              }}
              activeOpacity={0.7}
            >
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {options.tabBarIcon && options.tabBarIcon({
                  size: 24,
                  color: isFocused ? '#1652F0' : '#8E9297',
                  focused: isFocused,
                })}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Add button in the center */}
      <AnimatedTouchable
        style={[{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#1652F0',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#1652F0',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }, addButtonStyle]}
        onPress={handleAddPress}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </AnimatedTouchable>

      {/* Last two tabs */}
      <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-around' }}>
        {visibleRoutes.slice(2).map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const originalIndex = state.routes.findIndex(r => r.key === route.key);
          const isFocused = state.index === originalIndex;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={() => handleTabPress(route, isFocused, navigation)}
              style={{
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                minWidth: 60,
              }}
              activeOpacity={0.7}
            >
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {options.tabBarIcon && options.tabBarIcon({
                  size: 24,
                  color: isFocused ? '#1652F0' : '#8E9297',
                  focused: isFocused,
                })}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const [showAddDebt, setShowAddDebt] = useState(false);
  const { refreshDebts } = useDebts();

  const handleAddPress = () => {
    setShowAddDebt(true);
  };

  const handleCloseAddDebt = () => {
    setShowAddDebt(false);
  };

  const handleDebtAdded = () => {
    setShowAddDebt(false);
    // Force refresh of debts data
    refreshDebts();
  };

  return (
    <AddDebtContext.Provider value={{ showAddDebt, setShowAddDebt }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} onAddPress={handleAddPress} />}
        screenOptions={{
          headerShown: false,
        }}>
        {/* Menu 1: Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        {/* Menu 2: Debts */}
        <Tabs.Screen
          name="debts"
          options={{
            title: 'Debts',
            tabBarIcon: ({ size, color }) => (
              <CreditCard size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        {/* Bouton + (center) - This is a placeholder screen that won't be visible */}
        <Tabs.Screen
          name="add-placeholder"
          options={{
            title: 'Add',
            href: null, // This prevents the tab from being navigable
          }}
        />
        {/* Menu 3: Analytics */}
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ size, color }) => (
              <BarChart3 size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        {/* Menu 4: Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
      </Tabs>

      {/* Global Add Debt Bottom Sheet */}
      <AddDebtBottomSheet
        visible={showAddDebt}
        onClose={handleCloseAddDebt}
        onDebtAdded={handleDebtAdded}
      />
    </AddDebtContext.Provider>
  );
}