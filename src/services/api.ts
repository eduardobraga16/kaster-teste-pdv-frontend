const API_URL = 'http://localhost:8000/api';

async function request(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = localStorage.getItem('token');

    let response;

    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Accept': 'application/json',
                ...options.headers,
                ...(token && {
                    'Authorization': `Bearer ${token}`
                })
            }
        });
    } catch (error) {
        throw {
            message: 'Não foi possível conectar com o servidor.'
        };
    }

    let data;

    try {
        data = await response.json();
    } catch (error) {
        throw {
            message: 'O servidor retornou uma resposta inválida.'
        };
    }

    if (!response.ok) {
        throw data;
    }

    return data;
}

export async function login(email: string, password: string) {
    const formData = new FormData();

    formData.append('email', email);
    formData.append('password', password);

    return request('/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData
    });
}

export async function getSales(
    page: number = 1,
    date: string = ''
) {
    let url = `/sales?page=${page}`;

    if (date) {
        url += `&date=${date}`;
    }

    return request(url);
}

export async function getSale(id: number) {
    return request(`/sales/${id}`);
}

export async function searchProducts(query: string) {
    return request(
        `/products/search?term=${encodeURIComponent(query)}`
    );
}

export async function createSale(data: any) {
    return request('/sales', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}