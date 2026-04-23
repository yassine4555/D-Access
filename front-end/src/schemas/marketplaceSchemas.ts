import { z } from 'zod';

export const marketplaceCategorySchema = z.enum(['mobility', 'daily_aids', 'other']);

export const marketplaceItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    description: z.string().optional().default(''),
    images: z.array(z.string()).default([]),
    category: marketplaceCategorySchema.optional().default('other'),
    inStock: z.boolean().optional().default(true),
    productUrl: z.string(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const marketplaceResponseSchema = z.object({
    data: z.array(marketplaceItemSchema),
    pagination: z
        .object({
            page: z.number().optional(),
            limit: z.number().optional(),
            total: z.number().optional(),
            totalPages: z.number().optional(),
        })
        .optional(),
});

export type MarketplaceItem = z.infer<typeof marketplaceItemSchema>;
export type MarketplaceResponse = z.infer<typeof marketplaceResponseSchema>;
