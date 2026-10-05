import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginData } from '../types/Auth';
import { login } from '../services/api';

function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState<LoginData>({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<{
        email?: string[];
        password?: string[];
    }>({});

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        });

        setErrors({
            ...errors,
            [name]: undefined
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError('');
        setErrors({});
        setLoading(true);

        try {
            const data = await login(
                form.email,
                form.password
            );

            localStorage.setItem('token', data.token);

            navigate('/vendas');

        } catch (error: any) {

            if (error?.errors) {
                setErrors(error.errors);
                return;
            }

            setError(
                error?.message ||
                'Não foi possível realizar o login.'
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">

            <div className="box-login">
                <h1>PDV</h1>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label>E-mail</label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Digite seu e-mail"
                        />

                        {errors.email && (
                            <p>{errors.email[0]}</p>
                        )}
                    </div>

                    <div>
                        <label>Senha</label>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Digite sua senha"
                        />

                        {errors.password && (
                            <p>{errors.password[0]}</p>
                        )}
                    </div>

                    {error && (
                        <p>{error}</p>
                    )}

                    <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>

        </div>
    );
}

export default Login;