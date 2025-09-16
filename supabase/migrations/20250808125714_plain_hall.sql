/*
  # Add category column to debts table

  1. Schema Changes
    - Add `category` column to `debts` table
    - Column type: text (nullable)
    - Default value: null (optional category)

  2. Notes
    - This allows users to categorize their debts
    - Category is optional and can be null
    - Existing debts will have null category initially
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'debts' AND column_name = 'category'
  ) THEN
    ALTER TABLE debts ADD COLUMN category text;
  END IF;
END $$;