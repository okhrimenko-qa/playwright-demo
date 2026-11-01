export interface CreateUserPayload {
    first_name: string,
    last_name: string,
    dob: string,
    phone: string,
    email: string,
    password: string,
    address: {
        street: string,
        city: string,
        state: string,
        country: string,
        postal_code: string
    }
}
