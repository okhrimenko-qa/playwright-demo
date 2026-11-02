import { test } from '../../../fixtures/fixtures';
import { expect } from '@playwright/test';
import testData from '../../../test-data/api/account/adminEndpointsAccess';

test('Customer token is rejected on admin endpoints @T4bcbd81b @api @account @regression @smoke @P1', async ({
  apiHelper,
  createLoggedInUser,
}) => {
  const { expectedForbiddenBody } = testData;
  const { token } = await createLoggedInUser();
  const brandsResponse = await apiHelper.brand.getAll();

  expect(brandsResponse.status(), 'Brands should be available for the test')
    .toBe(200);

  const [brand] = await brandsResponse.json();
  const usersResponse = await apiHelper.user.getAll(token);

  expect(usersResponse.status(), 'Customer should not list users')
    .toBe(403);
  expect(await usersResponse.json(), 'Users request should return the forbidden error')
    .toEqual(expectedForbiddenBody);

  const deleteBrandResponse = await apiHelper.brand.delete(brand.id, token);

  expect(deleteBrandResponse.status(), 'Customer should not delete a brand')
    .toBe(403);
  expect((await apiHelper.brand.getById(brand.id)).status(), 'Brand should still exist')
    .toBe(200);

  const reportResponse = await apiHelper.report.getTotalSalesOfYears(token);

  expect(reportResponse.status(), 'Customer should not read reports')
    .toBe(403);
});
