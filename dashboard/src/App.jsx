import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:4000/api";

export default function App() {
  const [stores, setStores] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const fetchStores = async () => {
    const res = await axios.get(`${API}/stores`);
    setStores(res.data.stores);
  };

  const createStore = async () => {
    if (!name) return alert("Store name required");
    await axios.post(`${API}/stores`, {
      name,
      adminEmail: email || "admin@example.com",
    });
    setName("");
    setEmail("");
    fetchStores();
  };

  const deleteStore = async (id) => {
    await axios.delete(`${API}/stores/${id}`);
    fetchStores();
  };

  useEffect(() => {
    fetchStores();
    const interval = setInterval(fetchStores, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <header>
        <h1>🚀 Urumi Cloud</h1>
        <p>Multi-Tenant WooCommerce Orchestrator</p>
      </header>

      <div className="card create">
        <h2>Create New Store</h2>
        <input
          placeholder="Store Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={createStore}>Create Store</button>
      </div>

      <div className="stores">
        {stores.map((store) => (
          <div className="card store" key={store.id}>
            <h3>{store.name}</h3>
            <p>{store.domain}</p>

            <span className={`status ${store.status.toLowerCase()}`}>
              {store.status}
            </span>

            <div className="actions">
              {store.status === "READY" && (
                <a href={`http://${store.domain}`} target="_blank">
                  Open Store
                </a>
              )}
              <button onClick={() => deleteStore(store.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
