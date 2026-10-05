import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent
} from 'react';

import {
    searchProducts,
    createSale
} from '../services/api';


interface Product {
    id: number;
    name: string;
    price: number | string;
    stock?: number;
    ean: string;
}

interface CartItem extends Product {
    qtd: number;
}

function Pdv() {

    const searchInputRef = useRef<HTMLInputElement>(null);

    const [alertMessage, setAlertMessage] = useState('');

    const [search, setSearch] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('pdv_cart');

        if (!savedCart) {
            return [];
        }

        try {
            return JSON.parse(savedCart);
        } catch {
            return [];
        }
    });

    const [paymentMethod, setPaymentMethod] = useState(1);
    const [amountReceived, setAmountReceived] = useState('');

    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState('');


    const showAlert = (message: string) => {
        setAlertMessage(message);

        setTimeout(() => {
            setAlertMessage('');
        }, 3000);
    };


    useEffect(() => {
        localStorage.setItem(
            'pdv_cart',
            JSON.stringify(cart)
        );
    }, [cart]);


    const formatMoney = (value: number | string) => {
        return Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };


    const getProductPrice = (product: Product) => {
        return Number(product.price);
    };


    const subtotal = cart.reduce((total, item) => {
        return total + (
            getProductPrice(item) * item.qtd
        );
    }, 0);


    const received = Number(
        amountReceived.replace(',', '.')
    ) || 0;


    const change = Math.max(
        received - subtotal,
        0
    );


    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);


    useEffect(() => {
        if (search.length < 2) {
            setProducts([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoadingProducts(true);
                setError('');

                const response = await searchProducts(search);

                setProducts(
                    Array.isArray(response)
                        ? response
                        : response.data || []
                );

            } catch (error: any) {
                setProducts([]);

                showAlert(
                    error?.message ||
                    'Não foi possível buscar os produtos.'
                );

            } finally {
                setLoadingProducts(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);


    const handleSearchKeyDown = async (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key !== 'Enter') {
            return;
        }

        const ean = search.trim();

        if (!ean) {
            return;
        }

        try {
            setLoadingProducts(true);
            setError('');

            const response = await searchProducts(ean);

            const result = Array.isArray(response)
                ? response
                : response.data || [];

            if (result.length === 0) {
                showAlert('Produto não encontrado.');
                return;
            }

            const product = result.find(
                (item: Product) => item.ean === ean
            );

            if (!product) {
                showAlert('Produto não encontrado.');
                return;
            }

            addProduct(product);

        } catch (error: any) {
            showAlert(
                error?.message ||
                'Não foi possível buscar o produto.'
            );

        } finally {
            setLoadingProducts(false);
        }
    };


    const addProduct = (product: Product) => {

        if (
            product.stock !== undefined &&
            product.stock <= 0
        ) {
            showAlert(
                'Produto sem estoque disponível.'
            );

            return;
        }

        setCart(currentCart => {

            const existing = currentCart.find(
                item => item.id === product.id
            );

            if (existing) {

                if (
                    existing.stock !== undefined &&
                    existing.qtd >= existing.stock
                ) {
                    showAlert(
                        'Quantidade maior que o estoque disponível.'
                    );

                    return currentCart;
                }

                return currentCart.map(item =>
                    item.id === product.id
                        ? {
                            ...item,
                            qtd: item.qtd + 1
                        }
                        : item
                );
            }

            return [
                {
                    ...product,
                    qtd: 1
                },
                ...currentCart
            ];
        });

        setSearch('');
        setProducts([]);

        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 0);
    };


    const updateQuantity = (
        productId: number,
        qtd: number
    ) => {

        if (qtd < 1) {
            return;
        }

        setCart(currentCart =>
            currentCart.map(item => {

                if (item.id !== productId) {
                    return item;
                }

                if (
                    item.stock !== undefined &&
                    qtd > item.stock
                ) {
                    showAlert(
                        'Quantidade maior que o estoque disponível.'
                    );

                    return item;
                }

                return {
                    ...item,
                    qtd
                };
            })
        );
    };


    const removeProduct = (productId: number) => {
        setCart(currentCart =>
            currentCart.filter(
                item => item.id !== productId
            )
        );
    };


    const handleSearchChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setSearch(event.target.value);
    };


    const handleAmountReceived = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setAmountReceived(event.target.value);
    };


    const handleFinishSale = async () => {

        if (cart.length === 0) {
            showAlert(
                'Adicione pelo menos um produto.'
            );

            return;
        }

        if (!paymentMethod) {
            showAlert(
                'Selecione a forma de pagamento.'
            );

            return;
        }

        try {

            const data = {
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.qtd
                })),
                payment_method: paymentMethod,
                amount_received: received
            };

            const response = await createSale(data);

            console.log(
                'Venda criada:',
                response
            );

            showAlert(
                'Venda realizada com sucesso.'
            );

            setCart([]);
            setSearch('');
            setProducts([]);
            setAmountReceived('');
            setPaymentMethod(1);

            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 0);

        } catch (error: any) {

            console.error(error);

            if (error?.message) {
                showAlert(error.message);
                return;
            }

            const firstError = Object.values(
                error || {}
            )[0];

            if (Array.isArray(firstError)) {
                showAlert(firstError[0]);
                return;
            }

            showAlert(
                'Não foi possível finalizar a venda.'
            );
        }
    };


    return (

        <div className="pdv">

            {alertMessage && (
                <div className="pdv-alert">

                    <div>
                        <strong>Atenção</strong>

                        <p>
                            {alertMessage}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setAlertMessage('')}
                    >
                        ×
                    </button>

                </div>
            )}


            <div className="pdv-header">

                <h2>
                    Nova venda
                </h2>

                <div>
                    <strong>
                        TOTAL
                    </strong>

                    <span className="pdv-total">
                        {formatMoney(subtotal)}
                    </span>
                </div>

            </div>


            <div className="pdv-content">

                <div className="pdv-products">

                    <div className="pdv-search">

                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Pesquisar produto..."
                        />

                        {loadingProducts && (
                            <span>
                                Buscando...
                            </span>
                        )}


                        {products.length > 0 && (

                            <div className="pdv-product-results">

                                {products.map(product => (

                                    <button
                                        type="button"
                                        key={product.id}
                                        onClick={() =>
                                            addProduct(product)
                                        }
                                    >

                                        <div>

                                            <strong>
                                                {product.name}
                                            </strong>

                                            <small>
                                                Estoque:{' '}
                                                {product.stock ?? 0}
                                            </small>

                                        </div>

                                        <strong>
                                            {formatMoney(
                                                product.price
                                            )}
                                        </strong>

                                    </button>

                                ))}

                            </div>

                        )}

                    </div>


                    <div className="pdv-cart">

                        {cart.length === 0 && (

                            <div className="pdv-empty">

                                <p>
                                    Nenhum produto adicionado.
                                </p>

                            </div>

                        )}


                        {cart.length > 0 && (

                            <table>

                                <thead>

                                    <tr>
                                        <th>Produto</th>
                                        <th>Qtd.</th>
                                        <th>Preço</th>
                                        <th>Subtotal</th>
                                        <th></th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {cart.map(item => (

                                        <tr key={item.id}>

                                            <td>
                                                <strong>
                                                    {item.name}
                                                </strong>
                                            </td>


                                            <td>

                                                <div className="pdv-quantity">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.qtd - 1
                                                            )
                                                        }
                                                        disabled={
                                                            item.qtd <= 1
                                                        }
                                                    >
                                                        -
                                                    </button>


                                                    <span>
                                                        {item.qtd}
                                                    </span>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.qtd + 1
                                                            )
                                                        }
                                                        disabled={
                                                            item.stock !== undefined &&
                                                            item.qtd >= item.stock
                                                        }
                                                    >
                                                        +
                                                    </button>

                                                </div>

                                            </td>


                                            <td>
                                                {formatMoney(
                                                    item.price
                                                )}
                                            </td>


                                            <td>

                                                <strong>
                                                    {formatMoney(
                                                        getProductPrice(item) *
                                                        item.qtd
                                                    )}
                                                </strong>

                                            </td>


                                            <td>

                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={() =>
                                                        removeProduct(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    Remover
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        )}

                    </div>

                </div>


                <aside className="pdv-checkout">

                    <h3>
                        Pagamento
                    </h3>


                    <div className="pdv-checkout-total">

                        <span>
                            Total a pagar
                        </span>

                        <strong>
                            {formatMoney(subtotal)}
                        </strong>

                    </div>


                    <div className="pdv-field">

                        <label>
                            Forma de pagamento
                        </label>

                        <select
                            value={paymentMethod}
                            onChange={event =>
                                setPaymentMethod(
                                    Number(event.target.value)
                                )
                            }
                        >

                            <option value="1">
                                À vista
                            </option>

                            <option value="2">
                                Cartão de crédito
                            </option>

                            <option value="3">
                                Cartão de débito
                            </option>

                            <option value="4">
                                Pix
                            </option>

                        </select>

                    </div>


                    <div className="pdv-field">

                        <label>
                            Valor recebido
                        </label>

                        <input
                            type="text"
                            value={amountReceived}
                            onChange={handleAmountReceived}
                            placeholder="0,00"
                        />

                    </div>


                    <div className="pdv-change">

                        <span>
                            Troco
                        </span>

                        <strong>
                            {formatMoney(change)}
                        </strong>

                    </div>


                    {error && (
                        <div className="pdv-error">
                            {error}
                        </div>
                    )}


                    <button
                        type="button"
                        className="btn btn-success pdv-finish"
                        onClick={handleFinishSale}
                    >
                        Finalizar venda
                    </button>

                </aside>

            </div>

        </div>
    );
}

export default Pdv;