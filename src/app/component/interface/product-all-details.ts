export interface ProductVariation {
    color: string;
    size: string;
    quantity: number;
  }
  
  export interface SubCategory {
    id: number;
    name: string;
    img: string | null;
    categoryId: number;
  }
  
  export interface Prod {
    productId: number;
    productTitle: string;
    imageUrl: string;
    sku: string | null;
    price: number;
    discountPercent: number;
    discountPrice: number;
    allQuantity: number;
    email: string;
    productVariation: ProductVariation[];
    subCategory: SubCategory;
  }