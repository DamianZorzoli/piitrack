import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- BASE DE DATOS DE BARRIOS CORREDOR HUDSON / RUTA 2 / BRANDSEN ---
const BARRIOS_CORREDOR = {
  "Fincas de Hudson": { lat: -34.8021, lng: -58.1582, zona: "Hudson" },
  "Fincas del Sur": { lat: -34.8115, lng: -58.1634, zona: "Hudson" },
  "Abril Club de Campo": { lat: -34.8234, lng: -58.1712, zona: "Hudson" },
  "El Carmen Country Club": { lat: -34.8312, lng: -58.1821, zona: "Hudson" },
  "Barrio Los Profesionales": { lat: -34.8156, lng: -58.1498, zona: "Hudson" },
  "El Pato Country Club": { lat: -34.8621, lng: -58.1890, zona: "El Pato" },
  "Las Acacias (El Pato)": { lat: -34.8712, lng: -58.1950, zona: "El Pato" },
  "La Cándida Club de Campo": { lat: -34.9351, lng: -58.1212, zona: "Ruta 2 Km 47" },
  "Haras del Sur I": { lat: -35.0112, lng: -58.0051, zona: "Ruta 2 Km 69" },
  "Haras del Sur II": { lat: -35.0189, lng: -58.0123, zona: "Ruta 2 Km 71" },
  "Haras del Sur III": { lat: -35.0280, lng: -58.0210, zona: "Ruta 2 Km 73" },
  "Haras del Sur IV / Combo": { lat: -35.0340, lng: -58.0290, zona: "Ruta 2 Km 75" },
  "Miralagos Club de Campo": { lat: -35.0255, lng: -58.0421, zona: "Ruta 2 Km 65" },
  "Campos de Roca I": { lat: -35.0511, lng: -58.0812, zona: "Ruta 2 Km 65" },
  "Campos de Roca II": { lat: -35.0601, lng: -58.0921, zona: "Ruta 2 Km 65" },
  "Posada del Sol": { lat: -35.0712, lng: -58.0122, zona: "Ruta 2" },
  "Area 60 (La Victoria / Real)": { lat: -35.0890, lng: -57.9850, zona: "Ruta 2 Km 64" },
  "Altos de Brandsen": { lat: -35.1521, lng: -58.2140, zona: "Brandsen" },
  "Las Mandarinas": { lat: -35.1712, lng: -58.2280, zona: "Brandsen" },
  "Barrio Obligado": { lat: -35.1650, lng: -58.2410, zona: "Brandsen" },
  "Campos de Brandsen": { lat: -35.1820, lng: -58.2530, zona: "Brandsen" },
  "El Sostén (Brandsen)": { lat: -35.1410, lng: -58.1980, zona: "Brandsen" },
};

function RecentarMapa({ bounds }) {
  const map = useMap();
  if (bounds && bounds.length > 0) map.fitBounds(bounds, { padding: [50, 50] });
  return null;
}

// --- COMPONENTE ESCÁNER DE QR ---
function EscanerQR({ onScanSuccess, onCancel }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
    scanner.render(
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          scanner.clear();
          onScanSuccess(data);
        } catch (e) {
          alert("El código QR no pertenece al sistema PiiTrack.");
        }
      },
      () => {}
    );
    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScanSuccess]);

  return (
    <div style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
      <h4>Escanear Código del Paquete</h4>
      <div id="qr-reader" style={{ width: "100%" }}></div>
      <button onClick={onCancel} style={{ ...styles.logoutBtn, marginTop: "10px", width: "100%" }}>
        Cancelar
      </button>
    </div>
  );
}

export default function AppPiiTrack() {
  const [usuario, setUsuario] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [roleInput, setRoleInput] = useState("emisor");

  const [envios, setEnvios] = useState([
    {
      id: "PII-901",
      emisor: "vecino@fincashudson.com",
      origen: "Fincas de Hudson",
      destino: "Haras del Sur I",
      paquete: "Documentos legales",
      distancia: "28.4",
      montoTotal: 11440,
      gananciaConductor: 9152,
      comisionApp: 2288,
      estado: "PENDIENTE",
      conductor: null,
      coordsChofer: null,
    },
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!emailInput) return;
    setUsuario({ email: emailInput, role: roleInput });
  };

  const handleLogout = () => {
    setUsuario(null);
    setEmailInput("");
    setPassInput("");
  };

  if (!usuario) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.logoBadge}>
            <span style={{ fontSize: "28px" }}>⭕</span>
            <h1 style={styles.logoTitle}>Pii track</h1>
          </div>
          <p style={styles.logoSubtitle}>Logística colaborativa · Corredor Ruta 2 / Hudson / Brandsen</p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={styles.label}>Correo Electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.label}>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.label}>Perfil de Usuario</label>
              <select value={roleInput} onChange={(e) => setRoleInput(e.target.value)} style={styles.select}>
                <option value="emisor">Vecino / Comercio (Enviar)</option>
                <option value="conductor">Conductor Colaborador (Llevar)</option>
                <option value="admin">Administrador PiiTrack</option>
              </select>
            </div>
            <button type="submit" style={styles.primaryButton}>
              Ingresar a PiiTrack
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "sans-serif" }}>
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ backgroundColor: "#0b192c", padding: "4px 10px", borderRadius: "6px", color: "white", fontWeight: "bold" }}>
            Pii track
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>| Corredor Hudson - Ruta 2 - Brandsen</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={styles.userBadge}>
            <b>{usuario.email}</b> ({usuario.role.toUpperCase()})
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Salir
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {usuario.role === "emisor" && <PanelEmisor usuario={usuario} envios={envios} setEnvios={setEnvios} />}
        {usuario.role === "conductor" && <PanelConductor usuario={usuario} envios={envios} setEnvios={setEnvios} />}
        {usuario.role === "admin" && <PanelAdmin envios={envios} />}
      </div>
    </div>
  );
}

// --- PANEL EMISOR CON QR Y MAPA DE TRACKING EN VIVO ---
function PanelEmisor({ usuario, envios, setEnvios }) {
  const [origenKey, setOrigenKey] = useState("Fincas de Hudson");
  const [destinoKey, setDestinoKey] = useState("Haras del Sur I");
  const [paquete, setPaquete] = useState("");
  const [rutaCoords, setRutaCoords] = useState([]);
  const [distanciaKm, setDistanciaKm] = useState(null);
  const [costo, setCosto] = useState(0);
  const [cargandoRuta, setCargandoRuta] = useState(false);

  const calcularRutaOSRM = async () => {
    setCargandoRuta(true);
    const orig = BARRIOS_CORREDOR[origenKey];
    const dest = BARRIOS_CORREDOR[destinoKey];

    const url = `https://router.project-osrm.org/route/v1/driving/${orig.lng},${orig.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const km = (route.distance / 1000).toFixed(1);
        setRutaCoords(route.geometry.coordinates.map((c) => [c[1], c[0]]));
        setDistanciaKm(km);
        setCosto(Math.round(1500 + parseFloat(km) * 350));
      }
    } catch (err) {
      alert("Error al calcular la ruta.");
    } finally {
      setCargandoRuta(false);
    }
  };

  const crearPedido = () => {
    const nuevo = {
      id: `PII-${Math.floor(100 + Math.random() * 900)}`,
      emisor: usuario.email,
      origen: origenKey,
      destino: destinoKey,
      paquete: paquete || "Paquete Estándar",
      distancia: distanciaKm,
      montoTotal: costo,
      gananciaConductor: Math.round(costo * 0.8),
      comisionApp: Math.round(costo * 0.2),
      estado: "PENDIENTE",
      conductor: null,
      coordsChofer: null,
    };
    setEnvios([nuevo, ...envios]);
    alert("¡Pedido registrado!");
  };

  const misEnvios = envios.filter((e) => e.emisor === usuario.email);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={styles.sidebar}>
        <h3 style={{ color: "#0b192c", margin: "0 0 10px 0" }}>Solicitar Envío PiiTrack</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label style={styles.label}>Barrio Origen</label>
            <select value={origenKey} onChange={(e) => setOrigenKey(e.target.value)} style={styles.select}>
              {Object.keys(BARRIOS_CORREDOR).map((k) => (
                <option key={k} value={k}>
                  {k} ({BARRIOS_CORREDOR[k].zona})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>Barrio Destino</label>
            <select value={destinoKey} onChange={(e) => setDestinoKey(e.target.value)} style={styles.select}>
              {Object.keys(BARRIOS_CORREDOR).map((k) => (
                <option key={k} value={k}>
                  {k} ({BARRIOS_CORREDOR[k].zona})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>Descripción del Paquete</label>
            <input
              type="text"
              placeholder="Ej. Llaves, Cartera, Documentos"
              value={paquete}
              onChange={(e) => setPaquete(e.target.value)}
              style={styles.input}
            />
          </div>
          <button onClick={calcularRutaOSRM} disabled={cargandoRuta} style={styles.secondaryBtn}>
            {cargandoRuta ? "Trazando por Carretera..." : "📍 Calcular Distancia Exacta"}
          </button>

          {distanciaKm && (
            <div style={styles.boxInfo}>
              <p style={{ margin: "2px 0" }}>
                Distancia por Ruta: <b>{distanciaKm} km</b>
              </p>
              <p style={{ margin: "6px 0 0 0", fontSize: "16px", color: "#166534" }}>
                Total: <b>${costo.toLocaleString()} ARS</b>
              </p>
              <button onClick={crearPedido} style={{ ...styles.primaryButton, backgroundColor: "#009ee3" }}>
                💳 Pagar con Mercado Pago
              </button>
            </div>
          )}
        </div>

        <h4 style={{ marginTop: "20px", color: "#0b192c" }}>Mis Envíos y Códigos QR</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", maxHeight: "250px" }}>
          {misEnvios.map((e) => (
            <div key={e.id} style={styles.cardItem}>
              <b>{e.id}</b>: {e.origen} ➔ {e.destino}
              <div style={{ fontSize: "12px", margin: "4px 0" }}>
                Estado: <span style={styles.badge}>{e.estado}</span>
              </div>
              <div style={{ textAlign: "center", backgroundColor: "#f8fafc", padding: "10px", borderRadius: "6px", marginTop: "6px" }}>
                <p style={{ fontSize: "11px", fontWeight: "bold", margin: "0 0 6px 0" }}>
                  {e.estado === "PENDIENTE" ? "QR RETIRO (Mostrar al Chofer)" : "QR ENTREGA (Mostrar al Recibir)"}
                </p>
                <QRCodeSVG value={JSON.stringify({ id: e.id, accion: e.estado === "PENDIENTE" ? "RETIRO" : "ENTREGA" })} size={120} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <MapContainer center={[-35.0, -58.1]} zoom={10} style={{ width: "100%", height: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[BARRIOS_CORREDOR[origenKey].lat, BARRIOS_CORREDOR[origenKey].lng]}>
            <Popup>Origen: {origenKey}</Popup>
          </Marker>
          <Marker position={[BARRIOS_CORREDOR[destinoKey].lat, BARRIOS_CORREDOR[destinoKey].lng]}>
            <Popup>Destino: {destinoKey}</Popup>
          </Marker>

          {/* Si el chofer está en viaje, mostramos su posición GPS en tiempo real */}
          {misEnvios.map(
            (e) =>
              e.coordsChofer && (
                <Marker key={`chofer-${e.id}`} position={[e.coordsChofer.lat, e.coordsChofer.lng]}>
                  <Popup>🚗 Conductor en Camino ({e.id})</Popup>
                </Marker>
              )
          )}

          {rutaCoords.length > 0 && <Polyline positions={rutaCoords} color="#0b192c" weight={5} />}
          {rutaCoords.length > 0 && <RecentarMapa bounds={rutaCoords} />}
        </MapContainer>
      </div>
    </div>
  );
}

// --- PANEL CONDUCTOR CON ESCÁNER QR Y GPS EN VIVO ---
function PanelConductor({ usuario, envios, setEnvios }) {
  const [escanearParaId, setEscanearParaId] = useState(null);
  const [accionEscaneo, setAccionEscaneo] = useState("");

  const pendientes = envios.filter((e) => e.estado === "PENDIENTE");
  const misTomados = envios.filter((e) => e.conductor === usuario.email);

  const totalGanado = misTomados
    .filter((e) => e.estado === "ENTREGADO")
    .reduce((acc, curr) => acc + curr.gananciaConductor, 0);

  const tomarEnvio = (id) => {
    setEnvios(envios.map((e) => (e.id === id ? { ...e, conductor: usuario.email } : e)));
    alert("Has asignado este envío. Ve al punto de origen y escanea el QR de retiro.");
  };

  // Tracking GPS Real
  const activarGPS = (envioId) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setEnvios((prev) =>
            prev.map((e) => (e.id === envioId ? { ...e, coordsChofer: { lat, lng } } : e))
          );
        },
        (err) => console.log("Error GPS", err),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleScanExitoso = (data) => {
    if (data.id !== escanearParaId) {
      alert("Este código QR no corresponde al envío seleccionado.");
      return;
    }

    if (accionEscaneo === "RETIRO") {
      setEnvios(
        envios.map((e) => (e.id === data.id ? { ...e, estado: "EN_CAMINO" } : e))
      );
      activarGPS(data.id);
      alert("¡QR de Retiro Validado! El paquete está EN CAMINO.");
    } else if (accionEscaneo === "ENTREGADO") {
      setEnvios(
        envios.map((e) => (e.id === data.id ? { ...e, estado: "ENTREGADO" } : e))
      );
      alert("¡QR de Entrega Validado! Pago liberado a tu billetera.");
    }

    setEscanearParaId(null);
  };

  return (
    <div style={{ padding: "20px", overflowY: "auto", height: "100%", backgroundColor: "#f8fafc" }}>
      <h2 style={{ color: "#0b192c" }}>Panel del Conductor PiiTrack</h2>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiTitle}>Saldo Acumulado en Billetera</span>
          <span style={styles.kpiValue}>${totalGanado.toLocaleString()} ARS</span>
          <button style={styles.withdrawBtn}>Transferir a mi CBU/CVU</button>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiTitle}>Envíos Completados</span>
          <span style={styles.kpiValue}>{misTomados.filter((e) => e.estado === "ENTREGADO").length}</span>
        </div>
      </div>

      {escanearParaId && (
        <div style={{ marginBottom: "20px" }}>
          <EscanerQR onScanSuccess={handleScanExitoso} onCancel={() => setEscanearParaId(null)} />
        </div>
      )}

      <h3>Solicitudes Abiertas en el Corredor</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        {pendientes.length === 0 && <p style={{ color: "#64748b" }}>No hay envíos pendientes en la ruta actualmente.</p>}
        {pendientes.map((e) => (
          <div key={e.id} style={styles.cardItem}>
            <h4>
              {e.origen} ➔ {e.destino}
            </h4>
            <p style={{ fontSize: "13px" }}>
              Paquete: <b>{e.paquete}</b>
            </p>
            <p style={{ color: "#166534", fontSize: "16px" }}>
              Ganancia: <b>${e.gananciaConductor.toLocaleString()} ARS</b>
            </p>
            {!e.conductor && (
              <button onClick={() => tomarEnvio(e.id)} style={styles.primaryButton}>
                Tomar Solicitud
              </button>
            )}
          </div>
        ))}
      </div>

      <h3>Mis Viajes Asignados</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "15px" }}>
        {misTomados.map((e) => (
          <div key={e.id} style={{ ...styles.cardItem, borderLeft: "4px solid #0b192c" }}>
            <h4>
              {e.id}: {e.origen} ➔ {e.destino}
            </h4>
            <p>
              Estado actual: <b>{e.estado}</b>
            </p>

            {e.estado === "PENDIENTE" && (
              <button
                onClick={() => {
                  setEscanearParaId(e.id);
                  setAccionEscaneo("RETIRO");
                }}
                style={{ ...styles.primaryButton, backgroundColor: "#0284c7" }}
              >
                📷 Escanear QR de Retiro
              </button>
            )}

            {e.estado === "EN_CAMINO" && (
              <button
                onClick={() => {
                  setEscanearParaId(e.id);
                  setAccionEscaneo("ENTREGADO");
                }}
                style={{ ...styles.primaryButton, backgroundColor: "#16a34a" }}
              >
                📷 Escanear QR de Entrega
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- PANEL ADMIN ---
function PanelAdmin({ envios }) {
  const gmvTotal = envios.reduce((acc, curr) => acc + curr.montoTotal, 0);
  const comisionesTotales = envios.reduce((acc, curr) => acc + curr.comisionApp, 0);
  const pagosAConductores = envios.reduce((acc, curr) => acc + curr.gananciaConductor, 0);

  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%", backgroundColor: "#f1f5f9" }}>
      <h2 style={{ margin: "0 0 20px 0", color: "#0b192c" }}>📊 Dashboard Ejecutivo PiiTrack</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiTitle}>GMV Transaccionado</span>
          <span style={{ ...styles.kpiValue, color: "#0284c7" }}>${gmvTotal.toLocaleString()} ARS</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiTitle}>Comisión PiiTrack (20%)</span>
          <span style={{ ...styles.kpiValue, color: "#16a34a" }}>${comisionesTotales.toLocaleString()} ARS</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiTitle}>Liquidado a Conductores</span>
          <span style={styles.kpiValue}>${pagosAConductores.toLocaleString()} ARS</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiTitle}>Envíos Totales</span>
          <span style={styles.kpiValue}>{envios.length}</span>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3>Historial de Operaciones en el Corredor</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "10px" }}>ID</th>
              <th>Emisor</th>
              <th>Origen / Destino</th>
              <th>Total ($)</th>
              <th>Conductor ($)</th>
              <th>PiiTrack (20%)</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {envios.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px" }}>
                  <b>{e.id}</b>
                </td>
                <td>{e.emisor}</td>
                <td>
                  {e.origen} ➔ {e.destino}
                </td>
                <td>${e.montoTotal.toLocaleString()}</td>
                <td style={{ color: "#166534" }}>${e.gananciaConductor.toLocaleString()}</td>
                <td style={{ color: "#0b192c" }}>
                  <b>${e.comisionApp.toLocaleString()}</b>
                </td>
                <td>
                  <span style={styles.badge}>{e.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- ESTILOS INLINE BRANDING PIITRACK ---
const styles = {
  loginContainer: { display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh", backgroundColor: "#0b192c" },
  loginCard: { width: "380px", padding: "32px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" },
  logoBadge: { display: "flex", alignItems: "center", gap: "8px" },
  logoTitle: { color: "#0b192c", margin: 0, fontSize: "28px", fontWeight: "bold", letterSpacing: "-0.5px" },
  logoSubtitle: { color: "#64748b", fontSize: "12px", marginBottom: "20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0" },
  userBadge: { fontSize: "13px", color: "#475569" },
  logoutBtn: { padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", fontSize: "12px" },
  sidebar: { width: "380px", padding: "20px", backgroundColor: "#fff", borderRight: "1px solid #e2e8f0", zIndex: 1000 },
  label: { fontSize: "12px", fontWeight: "bold", color: "#475569" },
  input: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" },
  select: { width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", marginTop: "4px" },
  primaryButton: { width: "100%", padding: "10px", backgroundColor: "#0b192c", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "8px" },
  secondaryBtn: { width: "100%", padding: "8px", backgroundColor: "#334155", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  withdrawBtn: { padding: "6px 12px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", marginTop: "8px" },
  boxInfo: { padding: "12px", backgroundColor: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0", marginTop: "10px" },
  cardItem: { padding: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#fff" },
  badge: { padding: "2px 8px", backgroundColor: "#e2e8f0", borderRadius: "10px", fontSize: "11px", fontWeight: "bold" },
  kpiCard: { padding: "16px", backgroundColor: "#ffffff", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" },
  kpiTitle: { fontSize: "12px", color: "#64748b", fontWeight: "bold" },
  kpiValue: { fontSize: "22px", fontWeight: "bold", color: "#0f172a", marginTop: "4px" },
};