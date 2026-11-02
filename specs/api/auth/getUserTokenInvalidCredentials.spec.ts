import { test } from '../../../fixtures/fixtures';
import { expect } from '@playwright/test';
import commonHelper from '../../../helpers/commonHelper';
import testData from '../../../test-data/api/auth/getUserTokenInvalidCredentials';

test('Login API returns the same error for a wrong password and an unknown email @T739ce77d @api @auth @regression @P1', async ({
  apiHelper,
  createNewUser: userData,
}) => {
  const { email: unknownEmail, password: wrongPassword } = commonHelper.generateNewUserData();
  const { expectedErrorBody } = testData;

  const wrongPasswordResponse = await apiHelper.user.getToken(userData.email, wrongPassword);

  expect(wrongPasswordResponse.status(), 'Wrong password should be rejected')
    .toBe(401);
  expect(await wrongPasswordResponse.json(), 'Wrong password should return the generic error')
    .toEqual(expectedErrorBody);

  const unknownEmailResponse = await apiHelper.user.getToken(unknownEmail, wrongPassword);

  expect(unknownEmailResponse.status(), 'Unknown email should be rejected')
    .toBe(401);
  expect(await unknownEmailResponse.text(), 'Unknown email should return the same body as a wrong password')
    .toBe(await wrongPasswordResponse.text());
});
