import { useEffect, useState } from 'react';
import './App.css';

const backend = window.location.port === '3000'
  ? 'http://localhost:8080'
  : 'https://captured-feature-hearing-scholar.trycloudflare.com';

function App() {
  const [status, setStatus] = useState('loading');
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${backend}/api/entra/items`, { credentials: 'include' })
      .then((response) => {
        if (!response.ok) {
          setStatus('signed-out');
          return null;
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setItems(data);
          setStatus('signed-in');
        }
      })
      .catch(() => setStatus('signed-out'));
  }, []);

  return (
    <>
      <header>
        <h1>Pet Store</h1>
        <p>Entra ID Demo</p>
      </header>
      <main>
        {status === 'loading' && <p className="lead">Loading…</p>}
        {status === 'signed-out' && (
          <>
            <p className="lead">Sign in with your customer account to see the demo list.</p>
            <a className="btn" href={`${backend}/login/entra`}>Sign in with Entra ID</a>
          </>
        )}
        {status === 'signed-in' && (
          <>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <form method="post" action={`${backend}/logout`}>
              <button className="btn" type="submit">Logout</button>
            </form>
          </>
        )}
      </main>
    </>
  );
}

export default App;
