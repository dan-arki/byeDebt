export interface Category {
  id: string;
  name: string;
  emoji: string;
  isDefault: boolean;
  createdAt: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Dinner', emoji: '🍽️', isDefault: true, createdAt: '2025-01-01' },
  { id: '2', name: 'Gas', emoji: '⛽', isDefault: true, createdAt: '2025-01-01' },
  { id: '3', name: 'Concert', emoji: '🎵', isDefault: true, createdAt: '2025-01-01' },
  { id: '4', name: 'Loan', emoji: '💰', isDefault: true, createdAt: '2025-01-01' },
  { id: '5', name: 'Coffee', emoji: '☕', isDefault: true, createdAt: '2025-01-01' },
  { id: '6', name: 'Groceries', emoji: '🛒', isDefault: true, createdAt: '2025-01-01' },
  { id: '7', name: 'Rent', emoji: '🏠', isDefault: true, createdAt: '2025-01-01' },
  { id: '8', name: 'Bills', emoji: '📄', isDefault: true, createdAt: '2025-01-01' },
  { id: '9', name: 'Other', emoji: '📝', isDefault: true, createdAt: '2025-01-01' },
];

export const SUGGESTED_EMOJIS = [
  '🍽️', '⛽', '🎵', '💰', '☕', '🛒', '🏠', '📄', '📝', '🎬',
  '🚗', '🏥', '📚', '👕', '🎮', '✈️', '🍕', '🎁', '💊', '🔧',
  '📱', '💻', '🎯', '🏋️', '🎨', '🌟', '💡', '🔑', '🎪', '🌮'
];