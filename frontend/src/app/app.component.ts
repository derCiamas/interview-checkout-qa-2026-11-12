import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface DiscountResult {
  valid: boolean;
  message: string;
  discount: number;
  finalPrice: number;
}

interface CheckoutResult {
  success: boolean;
  message: string;
  orderId: string;
  subtotal: number;
  discount: number;
  finalPrice: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  template: `
    <main>
      <h1>Checkout</h1>
      <label for="subtotal">Order subtotal (PLN)</label>
      <input id="subtotal" type="number" min="0.01" step="0.01"
             [(ngModel)]="subtotal" (ngModelChange)="resetDiscount()" [disabled]="busy">

      <label for="code">Discount code</label>
      <input id="code" [(ngModel)]="code" (ngModelChange)="resetDiscount()" [disabled]="busy">
      <button type="button" (click)="validate()" [disabled]="busy">Apply code</button>
      @if (discountMessage) { <p role="status">{{ discountMessage }}</p> }

      <dl>
        <dt>Subtotal</dt><dd data-testid="subtotal">{{ subtotal | number:'1.2-2' }} PLN</dd>
        <dt>Discount</dt><dd data-testid="discount">{{ discount | number:'1.2-2' }} PLN</dd>
        <dt>Final price</dt><dd data-testid="final-price">{{ finalPrice | number:'1.2-2' }} PLN</dd>
      </dl>
      <button type="button" (click)="submit()" [disabled]="busy">Submit order</button>
      @if (orderMessage) { <p role="status">{{ orderMessage }}</p> }
    </main>
  `
})
export class AppComponent {
  private readonly http = inject(HttpClient);
  subtotal = 200;
  code = '';
  appliedCode = '';
  discount = 0;
  discountMessage = '';
  orderMessage = '';
  busy = false;

  get finalPrice(): number {
    return Math.max(0, this.subtotal - this.discount);
  }

  resetDiscount(): void {
    this.appliedCode = '';
    this.discount = 0;
    this.discountMessage = '';
    this.orderMessage = '';
  }

  validate(): void {
    this.busy = true;
    this.orderMessage = '';
    this.http.post<DiscountResult>('/api/discounts/validate', {
      code: this.code, subtotal: this.subtotal
    }).subscribe({
      next: result => {
        this.discount = result.discount;
        this.appliedCode = this.code.trim();
        this.discountMessage = result.message;
        this.busy = false;
      },
      error: (error: HttpErrorResponse) => {
        this.appliedCode = '';
        this.discount = 0;
        this.discountMessage = error.error?.message || 'Unable to validate discount code.';
        this.busy = false;
      }
    });
  }

  submit(): void {
    this.busy = true;
    this.orderMessage = '';
    this.http.post<CheckoutResult>('/api/checkout', {
      subtotal: this.subtotal, code: this.appliedCode || null
    }).subscribe({
      next: result => {
        this.orderMessage = `${result.message} Order ID: ${result.orderId}`;
        this.busy = false;
      },
      error: (error: HttpErrorResponse) => {
        this.orderMessage = error.error?.message || 'Unable to submit order.';
        this.busy = false;
      }
    });
  }
}
