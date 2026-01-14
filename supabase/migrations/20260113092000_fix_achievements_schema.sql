-- Fix achievements table schema limits
-- some columns might be too short (varchar(10)), causing insertion errors.

ALTER TABLE achievements ALTER COLUMN icon TYPE text;
ALTER TABLE achievements ALTER COLUMN rarity TYPE text;
