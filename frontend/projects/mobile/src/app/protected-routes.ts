import { Routes } from '@angular/router';
import { ClientsResolver } from '../../../../libs/resolvers/clients.resolver';
import { ClientDetailResolver } from '../../../../libs/resolvers/client-detail.resolver';
import { ProductsResolver } from '../../../../libs/resolvers/products.resolver';
import { ProductDetailResolver } from '../../../../libs/resolvers/product-detail.resolver';
import { InvoicesResolver } from '../../../../libs/resolvers/invoices.resolver';
import { InvoiceDetailResolver } from '../../../../libs/resolvers/invoice-detail.resolver';
import { OperationsResolver } from '../../../../libs/resolvers/operations.resolver';
import { OperationDetailResolver } from '../../../../libs/resolvers/operation-detail.resolver';
import { DashboardResolver } from '../../../../libs/resolvers/dashboard.resolver';
import { ApplicationResolver } from '../../../../libs/resolvers/application.resolver';

export const protectedRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    resolve: { data: DashboardResolver },
    loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'clients',
    children: [
      {
        path: '',
        resolve: { clients: ClientsResolver },
        loadChildren: () => import('./components/clients/clients.module').then(m => m.ClientsModule)
      },
      {
        path: 'new',
        loadChildren: () => import('./components/clients/client-form/client-form.module').then(m => m.ClientFormModule)
      },
      {
        path: ':id',
        resolve: { client: ClientDetailResolver },
        loadChildren: () => import('./components/clients/client-detail/client-detail.module').then(m => m.ClientDetailModule)
      },
      {
        path: ':id/edit',
        resolve: { client: ClientDetailResolver },
        loadChildren: () => import('./components/clients/client-form/client-form.module').then(m => m.ClientFormModule)
      },
    ]
  },
  {
    path: 'products',
    children: [
      {
        path: '',
        pathMatch: 'full',
        resolve: { products: ProductsResolver },
        loadChildren: () => import('./components/products/products.module').then(m => m.ProductsModule)
      },
      {
        path: 'new',
        loadChildren: () => import('./components/products/product-form/product-form.module').then(m => m.ProductFormModule)
      },
      {
        path: ':id',
        resolve: { product: ProductDetailResolver },
        loadChildren: () => import('./components/products/product-detail/product-detail.module').then(m => m.ProductDetailModule)
      },
      {
        path: ':id/edit',
        resolve: { product: ProductDetailResolver },
        loadChildren: () => import('./components/products/product-form/product-form.module').then(m => m.ProductFormModule)
      },
    ]
  },
  {
    path: 'invoices',
    children: [
      {
        path: '',
        resolve: { invoices: InvoicesResolver },
        loadChildren: () => import('./components/invoices/invoices.module').then(m => m.InvoicesModule)
      },
      {
        path: 'new',
        loadChildren: () => import('./components/invoices/invoice-stepper/invoice-stepper.module').then(m => m.InvoiceStepperModule)
      },
      {
        path: ':id',
        resolve: { data: InvoiceDetailResolver },
        loadChildren: () => import('./components/invoices/invoice-detail/invoice-detail.module').then(m => m.InvoiceDetailModule)
      },
    ]
  },
  {
    path: 'operations',
    children: [
      {
        path: '',
        pathMatch: 'full',
        resolve: { operations: OperationsResolver },
        loadChildren: () => import('./components/operations/operations.module').then(m => m.OperationsModule)
      },
      {
        path: 'new',
        loadChildren: () => import('./components/operations/operation-form/operation-form.module').then(m => m.OperationFormModule)
      },
      {
        path: ':id',
        resolve: { operation: OperationDetailResolver },
        loadChildren: () => import('./components/operations/operation-detail/operation-detail.module').then(m => m.OperationDetailModule)
      },
      {
        path: ':id/edit',
        resolve: { operation: OperationDetailResolver },
        loadChildren: () => import('./components/operations/operation-form/operation-form.module').then(m => m.OperationFormModule)
      },
    ]
  },
  {
    path: 'settings',
    resolve: { app: ApplicationResolver },
    loadChildren: () => import('./components/settings/settings.module').then(m => m.SettingsModule)
  },
];
