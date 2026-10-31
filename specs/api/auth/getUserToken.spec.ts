import { test } from '../../../fixtures/fixtures';
import { expect } from '@playwright/test';
import testData from '../../../test-data/api/auth/getUserToken';

test('Login API returns an access token for valid credentials @Te963a5ed @api @auth @regression @smoke @P1', async ({
  apiHelper,
  createNewUser: userData,
}) => {
  const response = await apiHelper.getUserToken(userData.email, userData.password);
  const body = await response.json();
  const { expectedUserTokenSchema, expectedUserTokenType } = testData;

  expect(response.status(), 'Token request should return valid status')
    .toBe(200);
  expect(body.access_token, 'Access token should have JWT format')
    .toMatch(expectedUserTokenSchema);
  expect(body.token_type, 'Access token should have valid type')
    .toMatch(expectedUserTokenType);
  expect(body.expires_in, 'Token lifetime should be positive')
    .toBeGreaterThan(0);
});
