
// This file contains SQL migrations for modifying the database schema
// The SQL in this file has already been executed, it's just for reference

export const addPricingIdToWebsites = `
-- Add pricing_id column to websites table
ALTER TABLE public.websites 
ADD COLUMN pricing_id UUID NULL REFERENCES public.pricing(id);
`;
