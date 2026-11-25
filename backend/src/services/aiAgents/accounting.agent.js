import { logAiExecution } from './aiLogger.js';
import { getExchangeRate } from '../externalApis/bccr.service.js';

export async function executeAccountingAgent({ transactions, period = 'Noviembre 2026', userId }) {
  const start = Date.now();
  const bccr = await getExchangeRate();
  const tipoCambioVenta = bccr.venta || 512.40;

  const items = Array.isArray(transactions) && transactions.length > 0 ? transactions : [
    { concepto: 'Consultas Médicas Medicina General (15 consultas)', tipo: 'ingreso', monto: 450000, moneda: 'CRC' },
    { concepto: 'Procedimientos Especializados Cardiología (4 ecocardiogramas)', tipo: 'ingreso', monto: 560000, moneda: 'CRC' },
    { concepto: 'Licenciamiento Software de Seguridad & Cifrado Cloud', tipo: 'gasto', monto: 180, moneda: 'USD' },
    { concepto: 'Suministros Médicos y Reactivos de Laboratorio', tipo: 'gasto', monto: 195000, moneda: 'CRC' },
    { concepto: 'Honorarios Especialistas Médicos', tipo: 'gasto', monto: 380000, moneda: 'CRC' }
  ];

  let totalIngresosCRC = 0;
  let totalGastosCRC = 0;

  const clasificadas = items.map(item => {
    const isUSD = item.moneda === 'USD';
    const montoEnCRC = isUSD ? item.monto * tipoCambioVenta : item.monto;

    if (item.tipo === 'ingreso') {
      totalIngresosCRC += montoEnCRC;
    } else {
      totalGastosCRC += montoEnCRC;
    }

    return {
      ...item,
      montoEquivalenteCRC: Math.round(montoEnCRC),
      categoriaContable: item.tipo === 'ingreso' ? 'Ingresos Operacionales de Salud' : 'Costos Operativos y Tecnología'
    };
  });

  const utilidadNetaCRC = totalIngresosCRC - totalGastosCRC;
  const margenOperativo = totalIngresosCRC > 0 ? ((utilidadNetaCRC / totalIngresosCRC) * 100).toFixed(1) : 0;

  const result = {
    agent: 'Agente Contable y Financiero MediVault',
    periodo: period,
    tasaCambioBCCR: {
      venta: tipoCambioVenta,
      compra: bccr.compra,
      fuente: bccr.source
    },
    resumen: {
      totalIngresosCRC: Math.round(totalIngresosCRC),
      totalGastosCRC: Math.round(totalGastosCRC),
      utilidadNetaCRC: Math.round(utilidadNetaCRC),
      utilidadNetaUSD: (utilidadNetaCRC / tipoCambioVenta).toFixed(2),
      margenOperativoPorcentaje: `${margenOperativo}%`
    },
    partidasClasificadas: clasificadas,
    diagnosticoFinanciero: margenOperativo > 20
      ? 'Salud financiera sólida. El margen supera el umbral operativo del 20% para el sector salud.'
      : 'Atención: Márgenes reducidos por costos de suministros.'
  };

  await logAiExecution(
    'Agente Contable',
    userId,
    `Periodo: ${period} - Transacciones: ${items.length}`,
    `Utilidad neta: CRC ₡${result.resumen.totalIngresosCRC - result.resumen.totalGastosCRC}`,
    Date.now() - start
  );

  return result;
}
