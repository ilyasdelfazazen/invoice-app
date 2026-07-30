import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';

@Injectable({ providedIn: 'root' })
export class ProductDetailResolver implements Resolve<Product> {
  constructor(private service: ProductService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<Product> {
    return this.service.getProductById(route.paramMap.get('id')!);
  }
}
