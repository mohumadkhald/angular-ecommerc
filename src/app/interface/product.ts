// export interface Product {
//     id: number;
//     name_en: string;
//     price:number;
//     image: string;
//     code: Number;
//     images: Array<string>;
//     quentity: number;
//   }
// export interface PaginatedResponse {
//   content: Product[];
//   pageable: any;
//   totalPages: number;
//   totalElements: number;
//   last: boolean;
//   size: number;
//   number: number;
//   sort: any;
//   first: boolean;
//   numberOfElements: number;
//   empty: boolean;
// }

export interface Product {
  colorsAndSizes: any;
  productId: number;
  productTitle: string;
  imageUrl: string;
  price: number;
  discountPercent: number;
  color: string;
  size: string;
  subCategory: {
    id: number;
    name: string;
    img: string | null;
    categoryId: number;
  };
}

export interface PaginatedResponse<T> {
  totalElements: number;
  content: T;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
}