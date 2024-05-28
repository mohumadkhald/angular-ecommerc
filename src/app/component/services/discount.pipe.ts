import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'discount',
  standalone: true
})
export class DiscountPipe implements PipeTransform {
  newPrice: number = 0;
  discount: number = 0;
  transform(price: number, dis:number) {
    
    this.discount = price/dis;
    this.newPrice =  price-this.discount||0;
    return this.newPrice.toFixed(2);
  }

}
