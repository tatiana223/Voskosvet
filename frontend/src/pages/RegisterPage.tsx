import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/authApi';
import { setStoredAuth } from '../utils/auth';
import type { FormEvent } from 'react';

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    register({ fullName, phone, email, password })
      .then((auth) => {
        setStoredAuth(auth);
        navigate('/account');
      })
      .catch((error: Error) => setError(error.message || 'Не получилось создать аккаунт.'))
      .finally(() => setIsSubmitting(false));
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Регистрация</p>
        <h1>Создать аккаунт</h1>
        <p>Аккаунт нужен, чтобы сохранять историю заказов и отслеживать их без телефона.</p>

        <label>
          Имя и фамилия
          <input
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Татьяна Иванова"
          />
        </label>

        <label>
          Телефон
          <input
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+7 999 123-45-67"
          />
        </label>

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
          {isSubmitting ? 'Создаем...' : 'Зарегистрироваться'}
        </button>

        <span className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </span>
      </form>
    </section>
  );
}
