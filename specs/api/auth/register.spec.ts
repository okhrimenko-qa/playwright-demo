import { test } from '../../../fixtures/fixtures';
import { expect } from '@playwright/test';
import { Ajv } from 'ajv';
import commonHelper from '../../../helpers/commonHelper';
import testData from '../../../test-data/api/auth/register';

test('Register API creates a customer and returns it without the password @T89a07416 @api @auth @regression @P1', async ({
  apiHelper,
}) => {
  const userData = commonHelper.generateNewUserData();
  const { expectedUserResponseSchema, getExpectedUserResponse } = testData;
  const validateUserResponse = new Ajv({ allowUnionTypes: true }).compile(expectedUserResponseSchema);

  const response = await apiHelper.user.register(userData);

  expect(response.status(), 'Register request should return valid status')
    .toBe(201);

  const body = await response.json();
  validateUserResponse(body);

  expect(validateUserResponse.errors, 'Response body should match the UserResponse schema')
    .toBeNull();
  expect(body.id, 'Response body should have an ID')
    .toBeTruthy();
  expect(body, 'Response body should repeat the registered data')
    .toMatchObject(getExpectedUserResponse(userData));
  expect(body, 'Response body should not expose the password')
    .not.toHaveProperty('password');

  const tokenResponse = await apiHelper.user.getToken(userData.email, userData.password);

  expect(tokenResponse.status(), 'New customer should be able to log in')
    .toBe(200);
  expect((await tokenResponse.json()).access_token, 'Login response should have an access token')
    .toBeTruthy();
});
