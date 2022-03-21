import "../dist/output.css"
import { fromUnixTime } from 'date-fns'
import { services } from '@tomtom-international/web-sdk-services';
import SearchBox from '@tomtom-international/web-sdk-plugin-searchbox';

const temperature = document.getElementById("temperature") as HTMLParagraphElement;
const wind = document.getElementById("wind") as HTMLParagraphElement;
const weather = document.getElementById("weather") as HTMLParagraphElement;
const hourlyDailyToggle = document.getElementById("hourlyDailyToggle") as HTMLInputElement;
const sunIcon = document.getElementById("sunIcon") as HTMLImageElement;
const moonIcon = document.getElementById("moonIcon") as HTMLImageElement;
const darkModeBtn = document.getElementById("darkModeToggle") as HTMLButtonElement;
const htmlTag = document.querySelector("html") as HTMLElement;
let city = document.getElementById("city") as HTMLHeadingElement;
let celsius = document.getElementById("celsius") as HTMLInputElement;
let fahrenheit = document.getElementById("fahrenheit") as HTMLInputElement;
let dateTime = document.getElementById("dateTime") as HTMLParagraphElement;
let sunrise = document.getElementById("sunrise") as HTMLParagraphElement;
let sunset = document.getElementById("sunset") as HTMLParagraphElement;
let humidity = document.getElementById("humidity") as HTMLParagraphElement;
let currentWeatherIcon = document.getElementById("currentWeatherIcon") as HTMLDivElement;
let searchBarContainer = document.getElementById('searchContainer') as HTMLDivElement;
let locationBtn = document.getElementById("location") as HTMLButtonElement;

let units = 'imperial';
let temperatureUnit = 'F';
let speedUnit = 'mph';
let previousLatitude: string;
let previousLongitude: string;
let previousData: JSON;

window.onload = () => {
  locationByCords('42.789379', '-86.107201')
}

darkModeBtn.onclick = (e) => {
  e.preventDefault();
  htmlTag.classList.toggle("dark");
  sunIcon.classList.toggle("hidden");
  moonIcon.classList.toggle("hidden")
}

fahrenheit.onclick = () => {
  units = 'imperial'
  temperatureUnit = 'F'
  speedUnit = 'mph'
  currentWeather(previousData);
  oneCall(previousData);
}

celsius.onclick = () => {
  units = 'metric'
  temperatureUnit = 'C'
  speedUnit = 'kph'
  currentWeather(previousData);
  oneCall(previousData);
}

// Option for the search bar which includes TomTom fuzzy search and autocomplete
// Set `idxSet` to Geo and `resultSet` to only how addresses and not places of interest
let options = {
  idleTimePress: 100,
  minNumberOfCharacters: 3,
  searchOptions: {
    key: 'ZEb5L8GGP8z6EbW61xwLPg0AVdpKak7W',
    language: 'en-GB',
    idxSet: 'Geo'
  },
  autocompleteOptions: {
    key: 'ZEb5L8GGP8z6EbW61xwLPg0AVdpKak7W',
    language: 'en-GB',
    resultSet: 'Address'
  },
  noResultsMessage: 'No results found.'
}

const ttSearchBox = new SearchBox(services, options);
const searchBoxHTML = ttSearchBox.getSearchBoxHTML();
searchBarContainer.appendChild(searchBoxHTML);

ttSearchBox.on('tomtom.searchbox.resultselected', async function (data) {
  //@ts-ignore
  city.innerHTML = `${data.data.text}, ${data.data.result.address.countryCode}`
  //@ts-ignore
  locationByCords(data.data.result.position.lat, data.data.result.position.lng);
  return;
});

async function accurateTime(timeZoneOffset: number, unixTime: number): Promise<string> {
  const localDate = new Date();
  let localDiff = localDate.getTimezoneOffset();
  let totalDiffUnix = (((timeZoneOffset / 60) + localDiff) * 60);
  let date = fromUnixTime(unixTime + totalDiffUnix).toString().slice(0, 10);
  let time = fromUnixTime(unixTime + totalDiffUnix).toString().slice(16, 21);
  return `${date} ${time}`
}

// Gets the users latitude and longitude and then runs function to fill the screen with data
async function getCoords() {
  navigator.geolocation.getCurrentPosition(function (position) {
    previousLatitude = position.coords.latitude.toString();
    previousLongitude = position.coords.longitude.toString();
    locationByCords(previousLatitude, previousLongitude);
    setCityName(previousLatitude, previousLongitude);
  })
};

async function setCityName(lat: string, long: string) {
  let namedLocation = await fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=1&appid=79994613e7af015836a5a0e8225ca668`, { mode: "cors" })
  if (namedLocation.status === 200) {
    let output = await namedLocation.json();
    if (output[0].country === "US") {
      city.innerHTML = `${output[0].name}, ${output[0].state}, ${output[0].country}`;
      return;
    }
    city.innerHTML = `${output[0].name}, ${output[0].country}`;
  }
}

locationBtn.onclick = function getCurrentLocation() {
  getCoords()
}

async function locationByCords(lat: any, long: any) {
  let apiCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely,alerts
  &units=${units}&appid=79994613e7af015836a5a0e8225ca668`;
  try {
    let output = await fetch(apiCall, { mode: "cors" });
    if (output.status === 200) {
      let data = await output.json();
      console.log(data)
      previousData = data;
      currentWeather(previousData);
      oneCall(previousData);
    }
  } catch (err) {
    console.log(err)
    return err
  }
}

async function currentWeather(results: JSON) {
  // @ts-ignore
  temperature.innerHTML = `<p class="font-semibold">Current Temperature:</p>  ${Math.floor(results.current.temp)}°${temperatureUnit}`;
  // @ts-ignore
  dateTime.innerHTML = await accurateTime(results.timezone_offset, results.current.dt)
  //@ts-ignore
  sunrise.innerHTML = "⬆️☀️  Sunrise: " + (await accurateTime(results.timezone_offset, results.current.sunrise)).slice(11, 16);
  //@ts-ignore
  sunset.innerHTML = "⬇️☀️  Sunset: " + (await accurateTime(results.timezone_offset, results.current.sunset)).slice(11, 16);
  //@ts-ignore
  humidity.innerHTML = `  🥵  Humidity: ${results.current.humidity}%`
  if (units === 'metric') {
    //@ts-ignore
    wind.innerHTML = `  🌬️  Wind: ${Math.floor((results.current.wind_speed) * (18 / 5))}${speedUnit}`;
  } else {
    //@ts-ignore
    wind.innerHTML = `  🌬️  Wind: ${Math.floor(results.current.wind_speed)}${speedUnit}`;
  }

  // @ts-ignore
  weather.innerHTML = `Weather: ${results.current.weather[0].main}`;
  //@ts-ignore
  currentWeatherIcon.innerHTML = weatherEmojis(results.current.weather[0].main)
}

hourlyDailyToggle.onclick = () => {
  if (hourlyDailyToggle.checked == false) {
    // Gets rid of the low temp which should be hidden on the hourly display :)
    let lowTemps = document.getElementsByClassName("lowTemp");
    for (let element of lowTemps) {
      if (hourlyDailyToggle.checked == false) {
        element.classList.toggle("hidden")
      }
    }
  }
  oneCall(previousData);
}

function oneCall(data: JSON): void {
  if (hourlyDailyToggle.checked == true) {
    oneCallDaily(data);
  } else {
    oneCallHourly(data);
  }
}

async function oneCallDaily(results: JSON) {
  let timeOrDay = document.getElementsByClassName("timeOrDay");
  let highTemps = document.getElementsByClassName("highTemp");
  let lowTemps = document.getElementsByClassName("lowTemp");
  let weatherIcons = document.getElementsByClassName("hourlyDailyWeather");

  for (let i = 0; i < timeOrDay.length; i++) {
    //@ts-ignore
    let day = await accurateTime(results.timezone_offset, results.daily[i + 1].dt);
    //@ts-ignore
    timeOrDay[i].innerHTML = daysOfTheWeek(day.slice(0, day.indexOf(" ")))
  }

  for (let i = 0; i < highTemps.length; i++) {
    //@ts-ignore
    let day = accurateTime(results.timezone_offset, results.daily[i + 1].dt);
    //@ts-ignore
    highTemps[i].innerHTML = `⬆️  ${Math.floor(results.daily[i + 1].temp.max)}°${temperatureUnit}`
  }

  for (let i = 0; i < lowTemps.length; i++) {
    lowTemps[i].classList.toggle("hidden")
    //@ts-ignore
    lowTemps[i].innerHTML = `⬇️  ${Math.floor(results.daily[i + 1].temp.min)}°${temperatureUnit}`
  }

  for (let i = 0; i < weatherIcons.length; i++) {
    //@ts-ignore
    weatherIcons[i].innerHTML = weatherEmojis(results.daily[i + 1].weather[0].main);
  }
}

async function oneCallHourly(results: JSON) {
  try {
    let timeOrDay = document.getElementsByClassName("timeOrDay");
    let temps = document.getElementsByClassName("highTemp");
    let weatherIcons = document.getElementsByClassName("hourlyDailyWeather");

    for (let i = 0; i < timeOrDay.length; i++) {
      //@ts-ignore

      let hour = await accurateTime(results.timezone_offset, results.hourly[i + 1].dt)
      timeOrDay[i].innerHTML = hour.slice(11, 16);

    }

    for (let i = 0; i < temps.length; i++) {
      //@ts-ignore
      temps[i].innerHTML = `${Math.floor(results.hourly[i + 1].temp)}°${temperatureUnit}`
    }

    for (let i = 0; i < weatherIcons.length; i++) {
      //@ts-ignore
      weatherIcons[i].innerHTML = weatherEmojis(results.hourly[i + 1].weather[0].main);
    }
  } catch (err) {
    console.log(err)
    return err
  }
}

function daysOfTheWeek(abb: string): string {
  switch (abb) {
    case "Mon":
      return "Monday"
      break;
    case "Tue":
      return "Tuesday"
      break;
    case "Wed":
      return "Wednesday"
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
  return "undefined"
}

function weatherEmojis(weather: string): string {
  switch (weather) {
    case "Thunderstorm":
      return "⛈️"
      break;
    case "Drizzle":
      return "🌧️"
      break;
    case "Rain":
      return "☔"
      break;
    case "Snow":
      return "🌨️";
      break;
    case "Atmosphere":
      return "🌫️";
      break;
    case "Clear":
      let currentTime = new Date().getHours()
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
  return "❓"
}