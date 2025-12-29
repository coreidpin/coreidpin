/**
 * Featured Items API Utilities
 * CRUD operations for featured items
 */

import { supabase } from './supabase/client';
import type { FeaturedItem, FeaturedItemFormData, PopulatedFeaturedItem } from '../types/portfolio';

/**
 * Get all featured items for a user
 */
export async function getFeaturedItems(userId: string): Promise<PopulatedFeaturedItem[]> {
  const { data, error } = await supabase
    .from('featured_items')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Add a new featured item
 */
export async function addFeaturedItem(
  userId: string,
  item: Omit<FeaturedItemFormData, 'displayOrder'>
): Promise<FeaturedItem> {
  // Get current count to set display order
  const { count } = await supabase
    .from('featured_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const displayOrder = (count || 0);

  // Convert camelCase to snake_case for database
  const dbItem: any = {
    user_id: userId,
    item_type: item.itemType,
    item_id: item.itemId,
    custom_title: item.customTitle,
    custom_description: item.customDescription,
    custom_link: item.customLink,
    custom_image: item.customImage,
    display_order: displayOrder
  };

  // Remove undefined values
  Object.keys(dbItem).forEach(key => {
    if (dbItem[key] === undefined) {
      delete dbItem[key];
    }
  });

  const { data, error } = await supabase
    .from('featured_items')
    .insert(dbItem)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove a featured item
 */
export async function removeFeaturedItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('featured_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Reorder featured items
 */
export async function reorderFeaturedItems(
  userId: string,
  itemIds: string[]
): Promise<void> {
  // Update display_order for each item
  const updates = itemIds.map((id, index) =>
    supabase
      .from('featured_items')
      .update({ display_order: index })
      .eq('id', id)
      .eq('user_id', userId)
  );

  await Promise.all(updates);
}

/**
 * Toggle featured status for any item
 */
export async function toggleFeatured(
  userId: string,
  itemType: 'case_study' | 'project' | 'product_launch' | 'article',
  itemId: string,
  isFeatured: boolean
): Promise<void> {
  if (isFeatured) {
    // Add to featured
    await addFeaturedItem(userId, { itemType, itemId });
  } else {
    // Remove from featured
    const { data } = await supabase
      .from('featured_items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .single();

    if (data) {
      await removeFeaturedItem(data.id);
    }
  }
}

/**
 * Check if an item is featured
 */
export async function isItemFeatured(
  userId: string,
  itemType: string,
  itemId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('featured_items')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .maybeSingle();

  return !!data;
}

/**
 * Get featured items count
 */
export async function getFeaturedCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('featured_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return count || 0;
}
