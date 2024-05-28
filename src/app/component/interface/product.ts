export interface Product {
    id: number;
    name_en: string;
    price:number;
    image: string;
    code: Number;
    images: Array<string>;
    quentity: number;
  }
export interface PaginatedResponse {
  content: Product[];
  pageable: any;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
