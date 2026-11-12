import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shows the applied discount', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.code = 'SUMMER20';
    fixture.componentInstance.validate();
    http.expectOne('/api/discounts/validate').flush({
      valid: true, message: 'Discount applied.', discount: 40, finalPrice: 160
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Discount applied.');
    expect(fixture.nativeElement.querySelector('[data-testid="discount"]').textContent).toContain('40.00');
  });

  it('shows a message for an invalid code', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.code = 'NOPE';
    fixture.componentInstance.validate();
    http.expectOne('/api/discounts/validate').flush(
      { message: 'Invalid discount code.' }, { status: 400, statusText: 'Bad Request' }
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Invalid discount code.');
  });
});
