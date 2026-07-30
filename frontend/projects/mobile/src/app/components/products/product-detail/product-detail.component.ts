import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../../../../libs/models/product.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product!: Product;

  constructor(private route: ActivatedRoute, public router: Router) {}

  ngOnInit(): void {
    this.product = this.route.snapshot.data['product'] as Product;
  }
}
