import { getExchangeRate } from '../services/externalApis/bccr.service.js';
import { queryContributor } from '../services/externalApis/hacienda.service.js';
import { getHealthWeather } from '../services/externalApis/weather.service.js';

export async function getBccrRate(req, res, next) {
  try {
    const rate = await getExchangeRate();
    res.status(200).json({
      success: true,
      data: rate
    });
  } catch (err) {
    next(err);
  }
}

export async function lookupContributor(req, res, next) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar el parámetro de identificación (cédula física o jurídica)'
      });
    }

    const contributor = await queryContributor(id);
    res.status(200).json({
      success: true,
      data: contributor
    });
  } catch (err) {
    next(err);
  }
}

export async function getWeatherAlerts(req, res, next) {
  try {
    const weather = await getHealthWeather();
    res.status(200).json({
      success: true,
      data: weather
    });
  } catch (err) {
    next(err);
  }
}
