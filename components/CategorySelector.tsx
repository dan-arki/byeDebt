import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { X, Plus } from 'lucide-react-native';
import { Category, SUGGESTED_EMOJIS } from '../types/category';
import { useCategories } from '../hooks/useCategories';
import AnimatedButton from './AnimatedButton';
import { HapticService, HapticType } from '../services/hapticService';

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export default function CategorySelector({ selectedCategory, onSelectCategory }: CategorySelectorProps) {
  const { categories, addCategory } = useCategories();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📝');

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      HapticService.error();
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    // Check if category already exists
    const exists = categories.some(cat => 
      cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    
    if (exists) {
      HapticService.error();
      Alert.alert('Error', 'A category with this name already exists');
      return;
    }

    try {
      const newCategory = await addCategory(newCategoryName.trim(), selectedEmoji);
      HapticService.success();
      onSelectCategory(newCategory.name);
      setShowCreateModal(false);
      setNewCategoryName('');
      setSelectedEmoji('📝');
    } catch (error) {
      HapticService.error();
      Alert.alert('Error', 'Failed to create category');
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    HapticService.selection();
    onSelectCategory(categoryName);
  };

  const handleEmojiSelect = (emoji: string) => {
    HapticService.light();
    setSelectedEmoji(emoji);
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.name && styles.activeCategoryChip
            ]}
            onPress={() => handleCategorySelect(category.name)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.name && styles.activeCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Add New Category Button */}
        <TouchableOpacity
          style={styles.addCategoryChip}
          onPress={() => {
            HapticService.light();
            setShowCreateModal(true);
          }}
        >
          <Plus size={16} color="#1652F0" strokeWidth={2} />
          <Text style={styles.addCategoryText}>Add new</Text>
        </TouchableOpacity>
      </View>

      {/* Create Category Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <Animated.View style={styles.modalContainer} entering={FadeIn.duration(300)}>
          <Animated.View style={styles.modalHeader} entering={SlideInUp.duration(400)}>
            <Text style={styles.modalTitle}>Create category</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                HapticService.light();
                setShowCreateModal(false);
              }}
            >
              <X size={24} color="#5B616E" strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Category Name Input */}
            <Animated.View style={styles.inputSection} entering={FadeIn.delay(200).duration(300)}>
              <Text style={styles.inputLabel}>Category name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter category name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholderTextColor="#C1C8CD"
                maxLength={20}
              />
            </Animated.View>

            {/* Emoji Selection */}
            <Animated.View style={styles.inputSection} entering={FadeIn.delay(300).duration(300)}>
              <Text style={styles.inputLabel}>Choose an emoji</Text>
              <View style={styles.emojiGrid}>
                {SUGGESTED_EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      selectedEmoji === emoji && styles.selectedEmojiOption
                    ]}
                    onPress={() => handleEmojiSelect(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Preview */}
            <Animated.View style={styles.previewSection} entering={FadeIn.delay(400).duration(300)}>
              <Text style={styles.inputLabel}>Preview</Text>
              <View style={styles.previewChip}>
                <Text style={styles.categoryEmoji}>{selectedEmoji}</Text>
                <Text style={styles.previewText}>
                  {newCategoryName || 'Category name'}
                </Text>
              </View>
            </Animated.View>
          </ScrollView>

          {/* Create Button */}
          <Animated.View style={styles.modalFooter} entering={SlideInUp.delay(500).duration(300)}>
            <AnimatedButton
              title="Create category"
              style={[styles.createButton, !newCategoryName.trim() && styles.disabledButton]}
              onPress={handleCreateCategory}
              disabled={!newCategoryName.trim()}
              hapticType={HapticType.MEDIUM}
            />
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  activeCategoryChip: {
    backgroundColor: '#1652F0',
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#5B616E',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  addCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#1652F0',
    borderStyle: 'dashed',
  },
  addCategoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1652F0',
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
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#050F19',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#050F19',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedEmojiOption: {
    backgroundColor: '#E8F4FD',
    borderWidth: 2,
    borderColor: '#1652F0',
  },
  emojiText: {
    fontSize: 20,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1652F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  createButton: {
    backgroundColor: '#1652F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C1C8CD',
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});