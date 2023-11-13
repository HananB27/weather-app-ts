import React, { useEffect, useState } from 'react';
import { fetchWeatherApi } from 'openmeteo';
import './index.css';

interface WeatherFetcherProps {
  latitude: number;
  longitude: number;
}

interface WeatherData {
  daily: {
    time: Date[];
    temperature2mMax: number[];
    temperature2mMin: number[];
  };
  current: {
    time: Date;
    apparentTemperature: number;
    isDay: number | boolean;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
  };
}

const WeatherFetcher: React.FC<WeatherFetcherProps> = ({ latitude, longitude }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const params = {
        latitude,
        longitude,
        current: ["apparent_temperature", "is_day", "precipitation", "rain", "showers", "snowfall"],
        daily: ["temperature_2m_max", "temperature_2m_min"],
      };

      try {
        const responses = await fetchWeatherApi(
            process.env.REACT_APP_API_URL!,
            params,
            {
                apiKey: process.env.REACT_APP_API_KEY!,
            } as any
        );

        const response = responses[0];
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const daily = response.daily()!;
        const current = response.current()!;

        const weatherData: WeatherData = {
          current: {
            time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
            apparentTemperature: current.variables(0)!.value(),
            isDay: current.variables(1)!.value(),
            precipitation: current.variables(2)!.value(),
            rain: current.variables(3)!.value(),
            showers: current.variables(4)!.value(),
            snowfall: current.variables(5)!.value(),
          },
          daily: {
            time: range(
              Number(daily.time()),
              Number(daily.timeEnd()),
              daily.interval()
            ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
            temperature2mMax: Array.from(daily.variables(0)!.valuesArray()!),
            temperature2mMin: Array.from(daily.variables(1)!.valuesArray()!),
          },
        };

        setWeatherData(weatherData);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchData();
  }, [latitude, longitude]);

  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  if (!weatherData) {
    return <div>Loading weather data...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Daily Forecast</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {weatherData.daily.time.map((time, index) => (
          <div
            key={index}
            className="p-4 bg-white rounded-md shadow-md"
          >
            <p className="font-semibold text-lg">
              {time.toLocaleDateString(undefined, { weekday: 'long' })}
            </p>
            <p className="text-gray-600">Max Temperature: {Math.round(weatherData.daily.temperature2mMax[index])} °C</p>
            <p className="text-gray-600">Min Temperature: {Math.round(weatherData.daily.temperature2mMin[index])} °C</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Current Weather</h2>
        <div className="p-4 bg-white rounded-md shadow-md">
          <p className="font-semibold text-lg">
            {weatherData.current.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-gray-600">Apparent Temperature: {Math.round(weatherData.current.apparentTemperature)} °C</p>
          <p className="text-gray-600">Is Day: {weatherData.current.isDay ? 'Yes' : 'No'}</p>
          <p className="text-gray-600">Precipitation: {weatherData.current.precipitation}</p>
          <p className="text-gray-600">Rain: {weatherData.current.rain}</p>
          <p className="text-gray-600">Showers: {weatherData.current.showers}</p>
          <p className="text-gray-600">Snowfall: {weatherData.current.snowfall}</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherFetcher;
