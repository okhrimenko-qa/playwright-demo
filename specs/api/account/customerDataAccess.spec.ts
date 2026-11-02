import { test } from '../../../fixtures/fixtures';
import { expect } from '@playwright/test';
import testData from '../../../test-data/api/account/customerDataAccess';

test("Customer cannot read another customer's profile or invoice @T6f7c3aea @api @account @regression @P1", async ({
  apiHelper,
  createLoggedInUser,
  createInvoice,
}) => {
  const { hiddenProfileFields } = testData;
  const customerA = await createLoggedInUser();
  const customerB = await createLoggedInUser();
  const invoice = await createInvoice(customerB);

  const profileResponse = await apiHelper.user.getById(customerB.id, customerA.token);

  expect(profileResponse.status(), "Customer should not get another customer's profile")
    .toBe(404);

  const profileBody = await profileResponse.json();

  expect(JSON.stringify(profileBody), "Response should not contain the other customer's email")
    .not.toContain(customerB.email);
  for (const field of hiddenProfileFields) {
    expect(profileBody, `Response should not have the ${field} field`)
      .not.toHaveProperty(field);
  }

  const invoiceResponse = await apiHelper.invoice.getById(invoice.id, customerA.token);

  expect(invoiceResponse.status(), "Customer should not get another customer's invoice")
    .toBe(404);

  const invoiceBody = await invoiceResponse.text();

  expect(invoiceBody, 'Response should not contain the invoice number')
    .not.toContain(invoice.invoice_number);
  expect(invoiceBody, 'Response should not contain the billing address')
    .not.toContain(invoice.billing_street);

  const ownInvoiceResponse = await apiHelper.invoice.getById(invoice.id, customerB.token);

  expect(ownInvoiceResponse.status(), 'Invoice owner should get the invoice')
    .toBe(200);
  expect((await ownInvoiceResponse.json()).id, 'Invoice owner should get the same invoice')
    .toBe(invoice.id);
});
