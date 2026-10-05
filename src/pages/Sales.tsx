import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getSales } from '../services/api';
import { Sale } from '../types/Sale';

function Sales() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastPage, setLastPage] = useState(1);

    const getToday = () => {
        const date = new Date();

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const formatDate = (date: string) => {
        const [year, month, day] = date.split('T')[0].split('-');

        return `${day}/${month}/${year}`;
    };

    const formatMoney = (value: number | string) => {
        return Number(value).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatPaymentMethod = (paymentMethod: number) => {
        switch (paymentMethod) {
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

    const page = Number(searchParams.get('page')) || 1;

    const urlDate = searchParams.get('date');

    const date = urlDate || getToday();

    const loadSales = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getSales(
                page,
                date
            );

            setSales(response.data);
            setLastPage(response.last_page);

        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível carregar as vendas.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
    }, [page, date]);

    const handleDateChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;

        setSearchParams({
            page: '1',
            date: value
        });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > lastPage) {
            return;
        }

        const params: {
            page: string;
            date?: string;
        } = {
            page: String(newPage)
        };

        if (urlDate) {
            params.date = urlDate;
        }

        setSearchParams(params);
    };

    return (
        <div className="page">

            <header className="page-header">
                <h2>Vendas</h2>

                <button
                    className="btn btn-info"
                    onClick={() => navigate('/pdv')}
                >
                    Nova Venda (PDV)
                </button>

                <div className="page-header-actions">
                    <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                    />
                </div>
            </header>

            {loading && (
                <div className="loading">
                    <p>
                        Carregando vendas...
                    </p>
                </div>
            )}

            {error && (
                <div className="error">
                    <p>
                        {error}
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={loadSales}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {!loading && !error && sales.length === 0 && (
                <div className="empty">
                    <p>
                        Nenhuma venda encontrada.
                    </p>
                </div>
            )}

            {!loading && !error && sales.length > 0 && (
                <>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Total</th>
                                    <th>Pagamento</th>
                                    <th>Data</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {sales.map((sale) => (
                                    <tr key={sale.id}>
                                        <td>
                                            {sale.id}
                                        </td>

                                        <td>
                                            R$ {formatMoney(sale.total)}
                                        </td>

                                        <td>
                                            {formatPaymentMethod(
                                                Number(sale.payment_method)
                                            )}
                                        </td>

                                        <td>
                                            {formatDate(sale.created_at)}
                                        </td>

                                        <td className="actions">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() =>
                                                    navigate(
                                                        `/sales/${sale.id}/details`
                                                    )
                                                }
                                            >
                                                Resumo
                                            </button>

                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    window.open(
                                                        `/sales/${sale.id}/coupon`,
                                                        '_blank'
                                                    );
                                                }}
                                            >
                                                Comprovante
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1 || loading}
                        >
                            Anterior
                        </button>

                        <span>
                            Página {page} de {lastPage}
                        </span>

                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === lastPage || loading}
                        >
                            Próxima
                        </button>
                    </div>
                </>
            )}

        </div>
    );
}

export default Sales;