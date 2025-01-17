import React, { useState, useEffect } from 'react';
import '../index.css';
import axios from 'axios';
import WeatherDetails from './WeatherDetails';
import ForecastCard from './ForecastCard';


export default function Home() {
  const [weather, setWeather] = useState('');
  const [forecast, setForecast] = useState([]);
  const [units, setUnits] = useState('metric');
  const [showForecast, setShowForecast] = useState(false);
  const [inputType, setInputType] = useState("city");

  const apiKey = 'Your_Api_Key'; //api removed for security reasons(find api key info from readme.md )

  const handleInputTypeChange = (e) => {
    setInputType(e.target.value);
  };

  const renderTemperature = (value) => {
    if (units === 'metric') {
      return `${value}°C`;
    }
    if (units === 'imperial') {
      return `${value}°F`;
    }
    return `${value}K`;
  };

  // Function to fetch weather data
  const fetchWeatherData = async (loc, lat, lon, units) => {
    let url;
    if (loc) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${apiKey}&units=${units}`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    }

    try {
      const res = await axios.get(url);
      return {
        descp: res.data.weather[0].description,
        temp: res.data.main.temp,
        city: res.data.name,
        humidity: res.data.main.humidity,
        wind: res.data.wind.speed,
        feel: res.data.main.feels_like,
      };
    } catch (error) {
      console.error('Error occurred while fetching API data.');
      throw error;
    }
  };

  // Function to fetch weather data for 7 days (forecast)
  const fetchForecastData = async (loc, lat, lon, units) => {
    let forecastURL;
    if (loc) {
      forecastURL = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${loc}&cnt=7&APPID=eec48f1630281ec926acbcbb20931f70&units=${units}`;
    } else if (lat && lon) {
      forecastURL = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&APPID=eec48f1630281ec926acbcbb20931f70&units=${units}`;
    }

    try {
      const forecastRes = await axios.get(forecastURL);
      const forecastData = forecastRes.data.list.map((day) => ({
        date: day.dt,
        temperature: day.temp.day,
        description: day.weather[0].description,
        humidity: day.humidity,
        wind: day.speed,
      }));
      return forecastData;
    } catch (error) {
      console.error('Error occurred while fetching forecast data.');
      throw error;
    }
  };

  const apiCall = async (e) => {
    e.preventDefault();
    let loc = "";
    let lat = "";
    let lon = "";

    if (inputType === "city") {
      loc = e.target.elements.loc.value;
    } else if (inputType === "coordinates") {
      lat = e.target.elements.lat.value;
      lon = e.target.elements.lon.value;
    }

    try {
      const [newWeatherData, forecastData] = await Promise.all([
        fetchWeatherData(loc, lat, lon, units),
        fetchForecastData(loc, lat, lon, units),
      ]);

      setWeather(newWeatherData);
      setForecast(forecastData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        //Error handeling done using try and catch block .
        alert("Please enter valid city name or coordinates.");
      } else {
        console.error("Error occurred while fetching API data.");
      }
    }
  };

  const toggleForecast = () => {
    setShowForecast(!showForecast);
  };

  const updateWeatherData = async (selectedUnit = units) => {
    if (weather && weather.city) {
      try {
        const [newWeatherData, forecastData] = await Promise.all([
          fetchWeatherData(weather.city, null,
            null, selectedUnit),
          fetchForecastData(weather.city, null,
            null, selectedUnit),
        ]);
        setWeather(newWeatherData);
        setForecast(forecastData);
        setUnits(selectedUnit);
      } catch (error) {
        // Handle error if needed
      }
    }
  };

  useEffect(() => {
    updateWeatherData();
  }, [units]);

  const handleUnitChange = (selectedUnit) => {
    updateWeatherData(selectedUnit);
  };

  return (
     //On clicking the button of GetWeather the api gets called and fetched and data is displayed.
    <div className="app">
      <div className="search">
        <form onSubmit={apiCall}>
          <select
            onChange={handleInputTypeChange}
            className="dropdown-menu"
            value={inputType}
          >
            <option value="city">Enter City</option>
            <option value="coordinates">Enter Latitude and Longitude</option>
          </select>

          {inputType === "city" ? (
            <input type="text" placeholder="Enter your city" name="loc" />
          ) : (
            <>
              <input type="text" placeholder="Enter latitude" name="lat" />
              <input type="text" placeholder="Enter longitude" name="lon" />
            </>
          )}

          <button className=" ml-4 px-8 py-2.5 mt-4 transition-all ease-in duration-75 bg-gradient-to-r from-purple-950 from-20% via-purple-900 via-60% to-purple-800 to-80% rounded-full hover:scale-105 font-bold">
            Get Weather
          </button>
        </form>

        {weather && (
          <WeatherDetails
            units={units}
            handleUnitChange={handleUnitChange}
            weather={weather}
            renderTemperature={renderTemperature}
          />
        )}

        {/* Toggle button for forecast */}
        <button
          className="ml-4 px-8 py-2.5 mt-4 transition-all ease-in duration-75 bg-gradient-to-r from-purple-950 from-20% via-purple-900 via-60% to-purple-800 to-80% rounded-full hover:scale-105 font-bold"
          onClick={toggleForecast}
        >
          {showForecast ? 'Hide Forecast' : 'Show Forecast'}
        </button>

        {/* Render the forecast if showForecast is true */}
        {showForecast && (
          <div className="forecast-row">
            {forecast.map((day) => (
              <ForecastCard
                key={day.date}
                date={new Date(day.date * 1000).toDateString()} 
                temperature={day.temperature}
                description={day.description}
                humidity={day.humidity}
                wind={day.wind}
                units={units}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}