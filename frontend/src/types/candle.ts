export type Candle = {
  id: number;
  slug: string;
  createdAt: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  scent: string;
  color: string;
  weightGrams: number;
  burnTimeHours: number;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  categoryId: number;
  categoryName: string;
};
