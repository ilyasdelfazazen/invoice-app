import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';

@Injectable({ providedIn: 'root' })
export class ProductsResolver implements Resolve<Product[]> {
  constructor(private service: ProductService) {}
  resolve(): Observable<Product[]> {
    return this.service.getProducts();
  }
}
