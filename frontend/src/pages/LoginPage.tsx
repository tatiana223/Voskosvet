import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { setStoredAuth } from '../utils/auth';
import type { FormEvent } from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    login({ email, password })
      .then((auth) => {
        setStoredAuth(auth);
        navigate('/account');
      })
      .catch((error: Error) => setError(error.message || 'Не получилось войти. Проверь email и пароль.'))
      .finally(() => setIsSubmitting(false));
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Личный кабинет</p>
        <h1>Вход в ВоскоСвет</h1>
        <p>Войдите, чтобы видеть свои заказы и быстрее оформлять новые покупки.</p>

        <label>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="mail@example.ru"
          />
        </label>

        <label>
          Пароль
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Минимум 6 символов"
          />
        </label>

        {error ? <p className="state-message state-message-error">{error}</p> : null}

        <button className="primary-link" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Входим...' : 'Войти'}
        </button>

        <span className="auth-switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </span>
      </form>
    </section>
  );
}
