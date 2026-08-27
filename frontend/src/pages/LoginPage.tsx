import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { setStoredAuth } from '../utils/auth';
import type { FormEvent } from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    login({ email: loginValue, password })
      .then((auth) => {
        setStoredAuth(auth);
        navigate('/admin');
      })
      .catch((error: Error) => setError(error.message || 'Не получилось войти. Проверь логин и пароль.'))
      .finally(() => setIsSubmitting(false));
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Администрирование</p>
        <h1>Вход в кабинет</h1>
        <p>Доступ для администратора и созданных им менеджеров.</p>

        <label>
          Логин
          <input
            required
            autoComplete="username"
            type="text"
            value={loginValue}
            onChange={(event) => setLoginValue(event.target.value)}
            placeholder="Введите логин"
          />
        </label>

        <label>
          Пароль
          <input
            required
            minLength={6}
            autoComplete="current-password"
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

      </form>
    </section>
  );
}
