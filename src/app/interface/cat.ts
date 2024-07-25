// export interface CartItem {
//     id: number;
//     name: string;
//     price: number;
//     quantity: number;
//     size: string;
//     color: string;
//   }


  export interface CartItem {
    itemID: number;
    productId: number;
    color: string;
    size: string;
    quantity: number;
    productTitle: string;
    totalPrice: number;
    imageUrl: string;
  }