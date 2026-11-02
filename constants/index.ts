export const defaultToolshopUrl = 'https://practicesoftwaretesting.com';

export const defaultToolshopApiUrl = 'https://api.practicesoftwaretesting.com';

export const routes = {
    login: '/auth/login',
    registration: '/auth/register',
    account: '/account'
};

export const apiRoutes = {
    user: {
        users: '/users',
        register: '/users/register',
        login: '/users/login',
    },
    brand: {
        brands: '/brands',
    },
    product: {
        products: '/products',
    },
    cart: {
        carts: '/carts',
    },
    invoice: {
        invoices: '/invoices',
    },
    report: {
        totalSalesOfYears: '/reports/total-sales-of-years',
    },
    postcode: {
        lookup: '/postcode-lookup',
    },
};
