import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/authApi';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Подтверждаем email...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setMessage('В ссылке отсутствует код подтверждения.');
      setIsError(true);
      return;
    }

    verifyEmail(token)
      .then(() => setMessage('Email подтверждён. Теперь можно войти в аккаунт.'))
      .catch((error: Error) => {
        setMessage(error.message || 'Не удалось подтвердить email.');
        setIsError(true);
      });
  }, [searchParams]);

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Подтверждение email</p>
        <h1>{isError ? 'Ссылка не сработала' : 'Почти готово'}</h1>
        <p className={isError ? 'state-message state-message-error' : 'state-message'}>
          {message}
        </p>
        <Link className="primary-link" to="/login">Перейти ко входу</Link>
      </div>
    </section>
  );
}
