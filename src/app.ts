import "../dist/output.css";
import { fromUnixTime } from "date-fns";
import { weatherData } from "./types";
import { services } from "@tomtom-international/web-sdk-services";
import SearchBox from "@tomtom-international/web-sdk-plugin-searchbox";

const temperature = document.getElementById("temperature") as HTMLParagraphElement;
const wind = document.getElementById("wind") as HTMLParagraphElement;
const weather = document.getElementById("weather") as HTMLParagraphElement;
const hourlyDailyToggle = document.getElementById("hourlyDailyToggle") as HTMLInputElement;
const sunIcon = document.getElementById("sunIcon") as HTMLImageElement;
const moonIcon = document.getElementById("moonIcon") as HTMLImageElement;
const darkModeBtn = document.getElementById("darkModeToggle") as HTMLButtonElement;
const htmlTag = document.querySelector("html") as HTMLElement;
const city = document.getElementById("city") as HTMLHeadingElement;
const celsius = document.getElementById("celsius") as HTMLInputElement;
const fahrenheit = document.getElementById("fahrenheit") as HTMLInputElement;
const dateTime = document.getElementById("dateTime") as HTMLParagraphElement;
const sunrise = document.getElementById("sunrise") as HTMLParagraphElement;
const sunset = document.getElementById("sunset") as HTMLParagraphElement;
const humidity = document.getElementById("humidity") as HTMLParagraphElement;
const currentWeatherIcon = document.getElementById("currentWeatherIcon") as HTMLDivElement;
const searchBarContainer = document.getElementById("searchContainer") as HTMLDivElement;
const locationBtn = document.getElementById("location") as HTMLButtonElement;

let units = "imperial";
let temperatureUnit = "F";
let speedUnit = "mph";
let previousLatitude: string;
let previousLongitude: string;
let previousData: weatherData;

window.onload = () => {
  locationByCords("42.789379", "-86.107201");
};

darkModeBtn.onclick = (e) => {
  e.preventDefault();
  htmlTag.classList.toggle("dark");
  sunIcon.classList.toggle("hidden");
  moonIcon.classList.toggle("hidden");
};

fahrenheit.onclick = () => {
  units = "imperial";
  temperatureUnit = "F";
  speedUnit = "mph";
  currentWeather(previousData);
  oneCall(previousData);
};

celsius.onclick = () => {
  units = "metric";
  temperatureUnit = "C";
  speedUnit = "kph";
  currentWeather(previousData);
  oneCall(previousData);
};

// Option for the search bar which includes TomTom fuzzy search and autocomplete
// Set `idxSet` to Geo and `resultSet` to only how addresses and not places of interest
const options = {
  idleTimePress: 100,
  minNumberOfCharacters: 3,
  searchOptions: {
    key: "ZEb5L8GGP8z6EbW61xwLPg0AVdpKak7W",
    language: "en-GB",
    idxSet: "Geo"
  },
  autocompleteOptions: {
    key: "ZEb5L8GGP8z6EbW61xwLPg0AVdpKak7W",
    language: "en-GB",
    resultSet: "Address"
  },
  noResultsMessage: "No results found."
};

const ttSearchBox = new SearchBox(services, options);
const searchBoxHTML = ttSearchBox.getSearchBoxHTML();
searchBarContainer.appendChild(searchBoxHTML);

ttSearchBox.on("tomtom.searchbox.resultselected", async function (data: any) {
  city.innerHTML = `${data.data.text}, ${data.data.result.address.countryCode}`;
  locationByCords(data.data.result.position.lat, data.data.result.position.lng);
  return;
});

async function accurateTime(timeZoneOffset: number, unixTime: number): Promise<string> {
  const localDate = new Date();
  const localDiff = localDate.getTimezoneOffset();
  const totalDiffUnix = (((timeZoneOffset / 60) + localDiff) * 60);
  const date = fromUnixTime(unixTime + totalDiffUnix).toString().slice(0, 10);
  const time = fromUnixTime(unixTime + totalDiffUnix).toString().slice(16, 21);
  return `${date} ${time}`;
}

// Gets the users latitude and longitude and then runs function to fill the screen with data
async function getCoords() {
  navigator.geolocation.getCurrentPosition(function (position) {
    previousLatitude = position.coords.latitude.toString();
    previousLongitude = position.coords.longitude.toString();
    locationByCords(previousLatitude, previousLongitude);
    setCityName(previousLatitude, previousLongitude);
  });
}

async function setCityName(lat: string, long: string) {
  const namedLocation = await fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=1&appid=79994613e7af015836a5a0e8225ca668`, { mode: "cors" });
  if (namedLocation.status === 200) {
    const output = await namedLocation.json();
    if (output[0].country === "US") {
      city.innerHTML = `${output[0].name}, ${output[0].state}, ${output[0].country}`;
      return;
    }
    city.innerHTML = `${output[0].name}, ${output[0].country}`;
  }
}

locationBtn.onclick = function getCurrentLocation() {
  getCoords();
};

async function locationByCords(lat: string, long: string) {
  const apiCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely,alerts
  &units=${units}&appid=79994613e7af015836a5a0e8225ca668`;
  try {
    const output = await fetch(apiCall, { mode: "cors" });
    if (output.status === 200) {
      const data = await output.json();
      console.log(data);
      previousData = createWeatherObject(data);
      currentWeather(previousData);
      oneCall(previousData);
    }
  } catch (err) {
    console.log(err);
    return err;
  }
}

function createWeatherObject(data: any) {
  const weatherObject = {
    currentWeather: data.current.weather[0].main,
    temperature: data.current.temp,
    timezoneOffset: data.timezone_offset,
    currentUnixTime: data.current.dt,
    sunriseUnixTime: data.current.sunrise,
    sunsetUnixTime: data.current.sunset,
    humidity: data.current.humidity,
    wind: data.current.wind_speed,
    daily: data.daily,
    hourly: data.hourly
  };
  console.log(weatherObject);
  return weatherObject;
}

async function currentWeather(results: weatherData) {
  temperature.innerHTML = `<p class="font-semibold">Current Temperature:</p>  ${Math.floor(results.temperature)}°${temperatureUnit}`;
  dateTime.innerHTML = await accurateTime(results.timezoneOffset, results.currentUnixTime);
  sunrise.innerHTML = "⬆️☀️  Sunrise: " + (await accurateTime(results.timezoneOffset, results.sunriseUnixTime)).slice(11, 16);
  sunset.innerHTML = "⬇️☀️  Sunset: " + (await accurateTime(results.timezoneOffset, results.sunsetUnixTime)).slice(11, 16);
  humidity.innerHTML = `  🥵  Humidity: ${results.humidity}%`;
  if (units === "metric") {
    wind.innerHTML = `  🌬️  Wind: ${Math.floor((results.wind) * (18 / 5))}${speedUnit}`;
  } else {
    wind.innerHTML = `  🌬️  Wind: ${Math.floor(results.wind)}${speedUnit}`;
  }
  weather.innerHTML = `Weather: ${results.currentWeather}`;
  currentWeatherIcon.innerHTML = weatherEmojis(results.currentWeather);
}

hourlyDailyToggle.onclick = () => {
  if (hourlyDailyToggle.checked == false) {
    // Gets rid of the low temp which should be hidden on the hourly display :)
    const lowTemps = document.getElementsByClassName("lowTemp");
    for (const element of lowTemps) {
      if (hourlyDailyToggle.checked == false) {
        element.classList.toggle("hidden");
      }
    }
  }
  oneCall(previousData);
};

function oneCall(data: weatherData): void {
  if (hourlyDailyToggle.checked == true) {
    oneCallDaily(data);
  } else {
    oneCallHourly(data);
  }
}

async function oneCallDaily(results: weatherData) {
  const timeOrDay = document.getElementsByClassName("timeOrDay");
  const highTemps = document.getElementsByClassName("highTemp");
  const lowTemps = document.getElementsByClassName("lowTemp");
  const weatherIcons = document.getElementsByClassName("hourlyDailyWeather");

  for (let i = 0; i < timeOrDay.length; i++) {
    const day = await accurateTime(results.timezoneOffset, results.daily[i + 1].dt);
    timeOrDay[i].innerHTML = daysOfTheWeek(day.slice(0, day.indexOf(" ")));
  }

  for (let i = 0; i < highTemps.length; i++) {
    highTemps[i].innerHTML = `⬆️  ${Math.floor(results.daily[i + 1].temp.max)}°${temperatureUnit}`;
  }

  for (let i = 0; i < lowTemps.length; i++) {
    lowTemps[i].classList.toggle("hidden");
    lowTemps[i].innerHTML = `⬇️  ${Math.floor(results.daily[i + 1].temp.min)}°${temperatureUnit}`;
  }

  for (let i = 0; i < weatherIcons.length; i++) {
    weatherIcons[i].innerHTML = weatherEmojis(results.daily[i + 1].weather[0].main);
  }
}

async function oneCallHourly(results: weatherData) {
  try {
    const timeOrDay = document.getElementsByClassName("timeOrDay");
    const temps = document.getElementsByClassName("highTemp");
    const weatherIcons = document.getElementsByClassName("hourlyDailyWeather");

    for (let i = 0; i < timeOrDay.length; i++) {
      const hour = await accurateTime(results.timezoneOffset, results.hourly[i + 1].dt);
      timeOrDay[i].innerHTML = hour.slice(11, 16);

    }

    for (let i = 0; i < temps.length; i++) {
      temps[i].innerHTML = `${Math.floor(results.hourly[i + 1].temp)}°${temperatureUnit}`;
    }

    for (let i = 0; i < weatherIcons.length; i++) {
      weatherIcons[i].innerHTML = weatherEmojis(results.hourly[i + 1].weather[0].main);
    }
  } catch (err) {
    console.log(err);
    return err;
  }
}

function daysOfTheWeek(abb: string): string {
  switch (abb) {
    case "Mon":
      return "Monday";
      break;
    case "Tue":
      return "Tuesday";
      break;
    case "Wed":
      return "Wednesday";
      break;
    case "Thu":
      return "Thursday";
      break;
    case "Fri":
      return "Friday";
      break;
    case "Sat":
      return "Saturday";
      break;
    case "Sun":
      return "Sunday";
      break;
  }
  return "undefined";
}

function weatherEmojis(weather: string): string {
  const currentTime = new Date().getHours();
  switch (weather) {
    case "Thunderstorm":
      return "⛈️";
      break;
    case "Drizzle":
      return "🌧️";
      break;
    case "Rain":
      return "☔";
      break;
    case "Snow":
      return "🌨️";
      break;
    case "Atmosphere":
      return "🌫️";
      break;
    case "Clear":
      if (currentTime >= 17) {
        return "🌕";
        break;
      } else {
        return "☀️";
        break;
      }
    case "Clouds":
      return "☁️";
      break;
  }
  return "❓";
}