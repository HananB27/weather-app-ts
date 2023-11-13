import React from 'react';
import WeatherFetcher from './WeatherFetcher';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="bg-gray-200 min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Weather App</h1>
      <WeatherFetcher latitude={43.8486} longitude={18.3564} />
    </div>
  );
};

export default App;