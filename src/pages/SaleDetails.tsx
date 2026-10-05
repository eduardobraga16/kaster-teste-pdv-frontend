import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getSale } from '../services/api';

function SaleDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sale, setSale] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const formatMoney = (
        value: number | string | null | undefined
    ) => {
        const number = Number(value);

        if (isNaN(number)) {
            return 'R$ 0,00';
        }

        return number.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const formatDate = (date: string | null | undefined) => {
        if (!date) {
            return '';
        }

        const dateObject = new Date(date);

        return dateObject.toLocaleString('pt-BR');
    };

    const formatPaymentMethod = (
        paymentMethod: number | string
    ) => {
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
                setItems(response.items || []);

            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Não foi possível carregar a venda.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadSale();
    }, [id]);

    if (loading) {
        return <p>Carregando venda...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!sale) {
        return <p>Venda não encontrada.</p>;
    }

    return (
        <div>
            <button onClick={() => navigate('/sales')}>
                Voltar
            </button>

            <h2>
                Venda #{sale.id}
            </h2>

            <p>
                Data: {formatDate(sale.created_at)}
            </p>

            <h3>
                Produtos
            </h3>

            <table>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Valor unitário</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item: any) => (
                        <tr key={item.id}>
                            <td>
                                {item.product_name}
                            </td>

                            <td>
                                {item.qtd}
                            </td>

                            <td>
                                {formatMoney(item.unit_price)}
                            </td>

                            <td>
                                {formatMoney(item.subtotal)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr />

            <p>
                Total:
                <strong>
                    {' '}
                    {formatMoney(sale.total)}
                </strong>
            </p>

            <p>
                Valor recebido:
                {' '}
                {formatMoney(sale.amount_received)}
            </p>

            <p>
                Troco:
                {' '}
                {formatMoney(sale.troco)}
            </p>

            <p>
                Forma de pagamento:
                {' '}
                {formatPaymentMethod(sale.payment_method)}
            </p>
        </div>
    );
}

export default SaleDetails;
