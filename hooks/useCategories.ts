import { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { CategoryService } from '../services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const loadedCategories = await CategoryService.getCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string, emoji: string): Promise<Category> => {
    const newCategory = await CategoryService.addCategory(name, emoji);
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const deleteCategory = async (categoryId: string): Promise<void> => {
    await CategoryService.deleteCategory(categoryId);
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    addCategory,
    deleteCategory,
    refreshCategories: loadCategories,
  };
}