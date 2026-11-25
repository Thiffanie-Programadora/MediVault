import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CurrencyIcon, ShieldIcon, CheckIcon, AlertTriangleIcon, RefreshIcon } from '../components/Icons';

export default function ExternalApisView() {
  // BCCR State
  const [exchangeRate, setExchangeRate] = useState(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeError, setExchangeError] = useState('');
  const [amountUsd, setAmountUsd] = useState(100);

  // Hacienda State
  const [idNumber, setIdNumber] = useState('117890123');
  const [taxpayerData, setTaxpayerData] = useState(null);
  const [taxpayerLoading, setTaxpayerLoading] = useState(false);
  const [taxpayerError, setTaxpayerError] = useState('');

  // Weather State
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  useEffect(() => {
    fetchExchangeRate();
    fetchWeather();
  }, []);

  const fetchExchangeRate = async () => {
    setExchangeLoading(true);
    setExchangeError('');
    try {
      const res = await api.getExchangeRate();
      setExchangeRate(res.data);
    } catch (err) {
      setExchangeError(err.message || 'Error al consultar tipo de cambio BCCR');
    } finally {
      setExchangeLoading(false);
    }
  };

  const handleConsultTaxpayer = async (e) => {
    if (e) e.preventDefault();
    if (!idNumber.trim()) return;
    setTaxpayerLoading(true);
    setTaxpayerError('');
    setTaxpayerData(null);
    try {
      const res = await api.consultTaxpayer(idNumber.trim());
      setTaxpayerData(res.data);
    } catch (err) {
      setTaxpayerError(err.message || 'Error al validar cédula en Hacienda');
    } finally {
      setTaxpayerLoading(false);
    }
  };

  const fetchWeather = async () => {
    setWeatherLoading(true);
    setWeatherError('');
    try {
      const res = await api.getHealthWeather(9.9281, -84.0907); // San José, CR
      setWeatherData(res.data);
    } catch (err) {
      setWeatherError(err.message || 'Error al consultar clima en Open-Meteo');
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-dark)', marginBottom: '0.5rem' }}>
          Consumo de APIs Externas en Tiempo Real
        </h1>
        <p style={{ color: 'var(--color-slate-light)', maxWidth: '800px', lineHeight: 1.6 }}>
          Integración segura y desacoplada mediante backend proxy hacia el Banco Central de Costa Rica (BCCR),
          Ministerio de Hacienda (ATV Tributaria) y Open-Meteo (Variables Meteorológicas para Salud y Asma).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* API 1: BCCR */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.12)', color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CurrencyIcon />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>BCCR - Tipo de Cambio</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)' }}>Indicador 317 & 318 (USD/CRC)</span>
              </div>
            </div>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={fetchExchangeRate} disabled={exchangeLoading}>
              <RefreshIcon style={{ animation: exchangeLoading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)', marginBottom: '1rem' }}>
            Cotización oficial del BCCR consumida por el backend con caché de 1 hora para cálculo de aranceles y facturación médica bimonetaria.
          </p>

          {exchangeError && (
            <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
              <AlertTriangleIcon /> {exchangeError}
            </div>
          )}

          {exchangeRate && (
            <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)' }}>Compra:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-navy-dark)' }}>₡{exchangeRate.compra ? exchangeRate.compra.toFixed(2) : '518.50'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)' }}>Venta:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-cyan)' }}>₡{exchangeRate.venta ? exchangeRate.venta.toFixed(2) : '524.20'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-slate-light)' }}>
                <span>Fuente: {exchangeRate.source || 'BCCR'}</span>
                <span>{exchangeRate.cached ? 'Caché Activa' : 'Directo'}</span>
              </div>
            </div>
          )}

          {/* Calculator */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              Conversor de Honorarios Médicos (USD a CRC):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                className="input-field"
                style={{ padding: '0.5rem', fontSize: '0.85rem', width: '100px' }}
                value={amountUsd}
                onChange={(e) => setAmountUsd(Number(e.target.value))}
              />
              <div style={{ flex: 1, background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-cyan)' }}>
                ≈ ₡{((exchangeRate?.venta || 524.20) * amountUsd).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* API 2: Hacienda */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldIcon />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Ministerio de Hacienda</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)' }}>Validación de Cédulas Tributarias</span>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)', marginBottom: '1rem' }}>
            Verificación de razón social y condición tributaria de médicos colegiados y proveedores en el API de Hacienda Costa Rica.
          </p>

          <form onSubmit={handleConsultTaxpayer} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: 3101123456"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} disabled={taxpayerLoading}>
              {taxpayerLoading ? 'Buscando...' : 'Consultar'}
            </button>
          </form>

          {taxpayerError && (
            <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
              <AlertTriangleIcon /> {taxpayerError}
            </div>
          )}

          {taxpayerData && (
            <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--color-navy-dark)', marginBottom: '0.4rem' }}>
                {taxpayerData.nombre || 'Nombre no disponible'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: 'var(--color-slate-light)' }}>
                <span>Identificación:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-navy-dark)' }}>{taxpayerData.identificacion || idNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: 'var(--color-slate-light)' }}>
                <span>Situación Tributaria:</span>
                <span className="badge badge-colaborador" style={{ fontSize: '0.7rem' }}>
                  {taxpayerData.situacion?.estado || 'INSCRITO'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate-light)' }}>
                <span>Régimen:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{taxpayerData.regimen || 'Tradicional'}</span>
              </div>
            </div>
          )}
        </div>

        {/* API 3: Open-Meteo Clima & Salud */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ☁️
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Open-Meteo Salud</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)' }}>San José, Costa Rica (9.92°N, -84.09°W)</span>
              </div>
            </div>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={fetchWeather} disabled={weatherLoading}>
              <RefreshIcon style={{ animation: weatherLoading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)', marginBottom: '1rem' }}>
            Correlación ambiental clínica: temperatura, humedad relativa y probabilidad de lluvia para monitoreo preventivo de afecciones respiratorias.
          </p>

          {weatherError && (
            <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
              <AlertTriangleIcon /> {weatherError}
            </div>
          )}

          {weatherData && (
            <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ background: '#fff', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)' }}>Temperatura</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-dark)' }}>{weatherData.temperature}°C</div>
                </div>
                <div style={{ background: '#fff', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)' }}>Humedad Relativa</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-cyan)' }}>{weatherData.relative_humidity}%</div>
                </div>
              </div>

              {weatherData.health_recommendation && (
                <div style={{ padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(2, 132, 199, 0.08)', borderLeft: '3px solid var(--color-cyan)', fontSize: '0.8rem', color: 'var(--color-navy-dark)' }}>
                  <strong>Alerta Médica:</strong> {weatherData.health_recommendation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
