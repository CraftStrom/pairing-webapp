import { useState } from 'react';

export default function Login({ setUserToken }) {
  // login with email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const API_BASE = 'https://craftstrom.azurewebsites.net/api/';

  const login = (e) => {
    e.preventDefault();

    fetch(`${API_BASE}auth?`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${btoa(`${email}:${password}`)}`,
      },
    }).then((response) => {
      if (response.status !== 200) {
        console.error('Login failed');
      } else {
        response.json().then((data) => {
          const { access_token, user_id } = data;
          localStorage.setItem('userToken', access_token.access_token);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userId', user_id.toString());
          setUserToken(access_token);
        });
      }
    });
  };
  return (
    <>
      <h1>Login</h1>
      <form onSubmit={login}>
        <input
          type="text"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="submit" value="Login" />
      </form>
    </>
  );
}
