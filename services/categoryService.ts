import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, DEFAULT_CATEGORIES } from '../types/category';

const CATEGORIES_STORAGE_KEY = 'debt_categories';

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    try {
      const stored = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored) {
        const categories = JSON.parse(stored);
        // Ensure we always have default categories
        const defaultIds = DEFAULT_CATEGORIES.map(cat => cat.id);
        const hasAllDefaults = defaultIds.every(id => 
          categories.some((cat: Category) => cat.id === id)
        );
        
        if (!hasAllDefaults) {
          // Merge with defaults if some are missing
          const merged = this.mergeWithDefaults(categories);
          await this.saveCategories(merged);
          return merged;
        }
        
        return categories;
      } else {
        // First time - save defaults
        await this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  static async saveCategories(categories: Category[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  static async addCategory(name: string, emoji: string): Promise<Category> {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: name.trim(),
      emoji,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    const categories = await this.getCategories();
    const updatedCategories = [...categories, newCategory];
    await this.saveCategories(updatedCategories);
    
    return newCategory;
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    const categories = await this.getCategories();
    const category = categories.find(cat => cat.id === categoryId);
    
    // Prevent deletion of default categories
    if (category?.isDefault) {
      throw new Error('Cannot delete default categories');
    }
    
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    await this.saveCategories(updatedCategories);
  }

  private static mergeWithDefaults(existingCategories: Category[]): Category[] {
    const existingIds = existingCategories.map(cat => cat.id);
    const missingDefaults = DEFAULT_CATEGORIES.filter(cat => 
      !existingIds.includes(cat.id)
    );
    
    return [...existingCategories, ...missingDefaults];
  }
}