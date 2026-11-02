import type { APIRequestContext } from '@playwright/test';
import { BrandService } from './services/brand.service';
import { CartService } from './services/cart.service';
import { InvoiceService } from './services/invoice.service';
import { PostcodeService } from './services/postcode.service';
import { ProductService } from './services/product.service';
import { ReportService } from './services/report.service';
import { UserService } from './services/user.service';

export class ApiHelper {
  readonly user: UserService;
  readonly brand: BrandService;
  readonly product: ProductService;
  readonly cart: CartService;
  readonly invoice: InvoiceService;
  readonly report: ReportService;
  readonly postcode: PostcodeService;

  constructor(request: APIRequestContext) {
    this.user = new UserService(request);
    this.brand = new BrandService(request);
    this.product = new ProductService(request);
    this.cart = new CartService(request);
    this.invoice = new InvoiceService(request);
    this.report = new ReportService(request);
    this.postcode = new PostcodeService(request);
  }
}
