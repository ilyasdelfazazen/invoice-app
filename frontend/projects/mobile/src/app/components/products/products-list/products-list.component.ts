import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AlertController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Product } from '../../../../../../../libs/models/product.model';
import { ProductService } from '../../../../../../../libs/services/product.service';

type SortDir = 'asc' | 'desc' | '';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  private allProducts: Product[] = [];
  displayed: Product[] = [];
  loading = false;
  searchControl = new FormControl('');
  sortName: SortDir = '';
  sortPrice: SortDir = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private productService: ProductService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.allProducts = this.route.snapshot.data['products'] as Product[];
    this.applySort();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.search(term ?? ''));
  }

  search(term: string): void {
    this.loading = true;
    this.productService.getProducts(term).subscribe({
      next: data => { this.allProducts = data; this.applySort(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  toggleSortName(): void {
    this.sortName = this.sortName === '' ? 'asc' : this.sortName === 'asc' ? 'desc' : '';
    this.applySort();
  }

  toggleSortPrice(): void {
    this.sortPrice = this.sortPrice === '' ? 'asc' : this.sortPrice === 'asc' ? 'desc' : '';
    this.applySort();
  }

  private applySort(): void {
    let list = [...this.allProducts];
    if (this.sortName === 'asc')  list.sort((a, b) => (a.designation ?? '').localeCompare(b.designation ?? ''));
    if (this.sortName === 'desc') list.sort((a, b) => (b.designation ?? '').localeCompare(a.designation ?? ''));
    if (this.sortPrice === 'asc')  list.sort((a, b) => a.unit_price_ht - b.unit_price_ht);
    if (this.sortPrice === 'desc') list.sort((a, b) => b.unit_price_ht - a.unit_price_ht);
    this.displayed = list;
  }

  async confirmDelete(product: Product): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: this.translate.instant('common.confirmDelete'),
      buttons: [
        { text: this.translate.instant('common.cancel'), role: 'cancel' },
        {
          text: this.translate.instant('common.delete'), role: 'destructive',
          handler: () => {
            this.productService.delete(product._id).subscribe(() => {
              this.allProducts = this.allProducts.filter(p => p._id !== product._id);
              this.applySort();
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
