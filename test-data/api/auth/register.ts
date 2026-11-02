import { UserData } from "../../../interfaces/UserData";

// UserResponse from the OpenAPI spec; `required` lists what a new customer must get back
const expectedUserResponseSchema = {
    type: 'object',
    required: ['id', 'first_name', 'last_name', 'email', 'dob', 'address', 'created_at'],
    properties: {
        id: { type: 'string' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        email: { type: 'string' },
        dob: { type: 'string' },
        phone: { type: ['string', 'null'] },
        provider: { type: ['string', 'null'] },
        totp_enabled: { type: 'boolean' },
        enabled: { type: 'boolean' },
        failed_login_attempts: { type: ['integer', 'null'] },
        created_at: { type: 'string' },
        address: {
            type: 'object',
            properties: {
                street: { type: 'string' },
                house_number: { type: ['string', 'null'] },
                city: { type: 'string' },
                state: { type: ['string', 'null'] },
                country: { type: 'string' },
                postal_code: { type: ['string', 'null'] },
            },
        },
    },
};

function getExpectedUserResponse(userData: UserData) {
    return {
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
    };
}

export default {
    expectedUserResponseSchema,
    getExpectedUserResponse,
}
