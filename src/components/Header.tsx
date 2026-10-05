import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');

        navigate('/login');
    };

    const handleSales = () => {
        navigate('/sales');
    };

    return (
        <header className="header">
            <div>
                <h1>Kaster Teste PDV</h1>
            </div>

            <div>
                <button
                    className="btn btn-secondary"
                    onClick={handleSales}
                >
                    Listar Vendas
                </button>

                <button
                    className="btn btn-danger"
                    onClick={handleLogout}
                >
                    Sair
                </button>
            </div>
        </header>
    );
}

export default Header;