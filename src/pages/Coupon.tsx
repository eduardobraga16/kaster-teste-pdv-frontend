import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getSale } from '../services/api';

function Coupon() {
    const { id } = useParams();

    const [sale, setSale] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const formatDate = (date?: string) => {
        if (!date) {
            return '';
        }

        const [year, month, day] = date
            .split('T')[0]
            .split('-');

        return `${day}/${month}/${year}`;
    };

    const formatMoney = (value: number | string) => {
        return Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const formatPaymentMethod = (paymentMethod: number) => {
        switch (Number(paymentMethod)) {
            case 1:
                return 'À vista';

            case 2:
                return 'Cartão de crédito';

            case 3:
                return 'Cartão de débito';

            case 4:
                return 'Pix';

            default:
                return 'Não informado';
        }
    };

    useEffect(() => {
        const loadSale = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await getSale(Number(id));

                setSale(response.sale);
                setItems(response.items);

            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Não foi possível carregar o comprovante.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadSale();
    }, [id]);

    useEffect(() => {
        if (sale) {
            setTimeout(() => {
                window.print();
            }, 300);
        }
    }, [sale]);

    if (loading) {
        return (
            <div className="coupon-status">
                <p>Carregando comprovante...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="coupon-status">
                <p>{error}</p>
            </div>
        );
    }

    if (!sale) {
        return (
            <div className="coupon-status">
                <p>Venda não encontrada.</p>
            </div>
        );
    }

    return (
        <>
            <div className="coupon">

                <div className="coupon-info">
                    <div>
                        <span>Venda</span>

                        <strong>
                            #{sale.id}
                        </strong>
                    </div>

                    <div>
                        <span>Data</span>

                        <span>
                            {formatDate(sale.created_at)}
                        </span>
                    </div>
                </div>

                <div className="coupon-divider">
                    --------------------------------
                </div>

                <div className="coupon-items">

                    {items.map((item, index) => (
                        <div
                            className="coupon-item"
                            key={item.id}
                        >
                            <div className="coupon-item-name">
                                {index + 1}. {item.product_name}
                            </div>

                            <div className="coupon-item-values">
                                <span>
                                    {item.qtd} x {formatMoney(item.unit_price)}
                                </span>

                                <strong>
                                    {formatMoney(item.subtotal)}
                                </strong>
                            </div>
                        </div>
                    ))}

                </div>

                <div className="coupon-divider">
                    --------------------------------
                </div>

                <div className="coupon-total">
                    <span>TOTAL</span>

                    <strong>
                        {formatMoney(sale.total)}
                    </strong>
                </div>

                <div className="coupon-divider">
                    --------------------------------
                </div>

                <div className="coupon-payment">

                    <div>
                        <span>Pagamento</span>

                        <strong>
                            {formatPaymentMethod(
                                sale.payment_method
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Recebido</span>

                        <span>
                            {formatMoney(
                                sale.amount_received
                            )}
                        </span>
                    </div>

                    <div>
                        <span>Troco</span>

                        <strong>
                            {formatMoney(
                                sale.troco
                            )}
                        </strong>
                    </div>

                </div>

            </div>

            <div className="coupon-actions">
                <button
                    className="btn btn-primary"
                    onClick={() => window.print()}
                >
                    Imprimir novamente
                </button>
            </div>
        </>
    );
}

export default Coupon;