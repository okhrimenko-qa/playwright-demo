export interface CreateInvoicePayload {
    billing_street: string,
    billing_city: string,
    billing_state: string,
    billing_country: string,
    billing_postal_code: string,
    payment_method: string,
    payment_details: object,
    cart_id: string
}
