import "../dist/output.css"
import { fromUnixTime} from 'date-fns'


const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
const searchBar = document.getElementById("searchBar") as HTMLInputElement;
const temperature = document.getElementById("temperature") as HTMLParagraphElement;
const wind = document.getElementById("wind") as HTMLParagraphElement;
const weather = document.getElementById("weather") as HTMLParagraphElement;
let city = document.getElementById("city") as HTMLHeadingElement;
let celsius = document.getElementById("celsius") as HTMLInputElement;
let fahrenheit = document.getElementById("fahrenheit") as HTMLInputElement;
let dateTime = document.getElementById("dateTime") as HTMLParagraphElement;
let sunrise = document.getElementById("sunrise") as HTMLParagraphElement;
let sunset = document.getElementById("sunset") as HTMLParagraphElement;
let humidity = document.getElementById("humidity") as HTMLParagraphElement;
const hourlyDailyToggle = document.getElementById("hourlyDailyToggle") as HTMLInputElement;
let currentWeatherIcon = document.getElementById("currentWeatherIcon") as HTMLDivElement;
let previousLatitude: string;
let previousLongitude: string;
let units = 'imperial';
let temperatureUnit = 'F';
let speedUnit = 'mph'
let data: JSON;

let includeState: RegExp = new RegExp('[a-z,-. ]*, ?[a-z]{2}, ?[a-z]{2}', 'mi');
let patternMinusState: RegExp = new RegExp('^[a-z-. ]*, ?[a-z]{2}$', 'mi');

submitBtn.onclick = (e) => {
  e.preventDefault();
  if (includeState.test(searchBar.value) === true || patternMinusState.test(searchBar.value) === true) {
    locationByName(searchBar)
    searchBar.value = "";
  } else if (searchBar.value === "") {
    return;
  } else {
    document.getElementById("searchAlert")?.classList.toggle("hidden");
    searchBar.value = "";
    setTimeout(() => {
      document.getElementById("searchAlert")?.classList.toggle("hidden");
    }, 5000);
    return;
  }
};

async function getWeather(apiCall: string): Promise<any> {
  try {
    let output = await fetch(apiCall, { mode: "cors" });
    if (output.status === 200) {
      let data = await output.json();
      console.log(data)
      // @ts-ignore
      let dataCity = `${data.name}, ${data.sys.country}`
      // @ts-ignore
      let dataTemp = `${Math.floor(data.main.temp)}°${temperatureUnit}`;
      // @ts-ignore
      const currentDateTime = await accurateTime(data.timezone, data.dt)
      const sunriseTime = "⬆️☀️  Sunrise: " + await (await accurateTime(data.timezone, data.sys.sunrise)).slice(11, 16);
      const sunsetTime = "⬇️☀️  Sunset: " + await (await accurateTime(data.timezone, data.sys.sunset)).slice(11, 16);
      let humidityPercent = `🥵  Humidity: ${data.main.humidity}%`
      let dataWind: string;
      if (units === 'metric') {
        dataWind = `🌬️  ${Math.floor((data.wind.speed) * (18 / 5))}${speedUnit}`;
      } else {
        dataWind = `🌬️  ${Math.floor(data.wind.speed)}${speedUnit}`;
      }

      // @ts-ignore
      let dataWeather = `Weather: ${data.weather[0].main}`;
      previousLatitude = data.coord.lat;
      previousLongitude = data.coord.lon;
      oneCall(previousLatitude, previousLongitude);
      return [currentDateTime, dataCity, dataTemp, dataWind, dataWeather, sunriseTime, sunsetTime, humidityPercent];
    }
  }
  catch (err) {
    console.log(err)
    // error function or default location
    return err;
  }
}

window.onload = () => {
  searchBar.value = "Amsterdam, NL";
  submitBtn.click();
  searchBar.value = "";
}

let locationBtn = document.getElementById("location") as HTMLButtonElement;

locationBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(function (position) {
    locationByCords(position.coords.latitude, position.coords.longitude);
  })
};

function locationByCords(lat: any, long: any) {
  let apiCall = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=${units}&appid=79994613e7af015836a5a0e8225ca668`
  return getWeather(apiCall).then(Response => {
    console.log(Response[0])
    city.innerHTML = Response[1];
    temperature.innerHTML = Response[2];
    wind.innerHTML = Response[3];
    weather.innerHTML = Response[4];
    currentWeatherIcon.innerHTML = weatherEmojis(Response[4].slice(9));
    dateTime.innerHTML = Response[0];
    sunrise.innerHTML = Response[5]
    sunset.innerHTML = Response[6]
    humidity.innerHTML = Response[7];
  })
}

function locationByName(input: HTMLInputElement) {
  let apiCall = `https://api.openweathermap.org/data/2.5/weather?q=${input.value}&units=${units}&appid=6a9b62a8dc1c79ef3c28a15de1a5634a
  `;
  return getWeather(apiCall).then(Response => {
    city.innerHTML = Response[1];
    temperature.innerHTML = Response[2];
    wind.innerHTML = Response[3];
    weather.innerHTML = Response[4];
    currentWeatherIcon.innerHTML = weatherEmojis(Response[4].slice(9));
    dateTime.innerHTML = Response[0];
    sunrise.innerHTML = Response[5]
    sunset.innerHTML = Response[6]
    humidity.innerHTML = Response[7];
  })
};

let sunIcon = document.getElementById("sunIcon") as HTMLImageElement;
let moonIcon = document.getElementById("moonIcon") as HTMLImageElement;
let darkModeBtn = document.getElementById("darkModeToggle") as HTMLButtonElement;
let htmlTag = document.querySelector("html") as HTMLElement;
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
  locationByCords(previousLatitude, previousLongitude);
}

celsius.onclick = () => {
  units = 'metric'
  temperatureUnit = 'C'
  speedUnit = 'kph'
  locationByCords(previousLatitude, previousLongitude);
}

function getDateTime(): string {
  let current = new Date();
  let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
  let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
  let dateTime = cDate + ' ' + cTime;
  return dateTime;
}

async function accurateTime(timeZoneOffset: number, unixTime: number): Promise<string> {
  const localDate = new Date();
  let localDiff = localDate.getTimezoneOffset();

  let totalDiffUnix = (((timeZoneOffset / 60) + localDiff) * 60);

  let date = fromUnixTime(unixTime + totalDiffUnix).toString().slice(0, 10);
  let time = fromUnixTime(unixTime + totalDiffUnix).toString().slice(16, 21);


  return `${date} ${time}`
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
  oneCall(previousLatitude, previousLongitude);
}

function oneCall(lat: string, lon: string): void {
  if (hourlyDailyToggle.checked == true) {
    oneCallDaily(lat, lon);
  } else {
    oneCallHourly(lat, lon);
  }
}

async function oneCallDaily(lat: string, lon: string): Promise<any> {
  try {
    let output = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,alerts&units=${units}&appid=79994613e7af015836a5a0e8225ca668`, { mode: "cors" });
    if (output.status === 200) {
      let data = await output.json();
      console.log(data)
      let timeOrDay = document.getElementsByClassName("timeOrDay");
      let highTemps = document.getElementsByClassName("highTemp");
      let lowTemps = document.getElementsByClassName("lowTemp");
      let weatherIcons = document.getElementsByClassName("hourlyDailyWeather");

      for (let i = 0; i < timeOrDay.length; i++) {
        let day = await accurateTime(data.timezone_offset, data.daily[i + 1].dt);
        timeOrDay[i].innerHTML = daysOfTheWeek(day.slice(0, day.indexOf(" "))) 
      }

      for (let i = 0; i < highTemps.length; i++) {let day = await accurateTime(data.timezone_offset, data.daily[i + 1].dt);
        highTemps[i].innerHTML = `⬆️  ${Math.floor(data.daily[i + 1].temp.max)}°${temperatureUnit}`
      }

      for (let i = 0; i < lowTemps.length; i++) {
        lowTemps[i].classList.toggle("hidden")
         lowTemps[i].innerHTML = `⬇️  ${Math.floor(data.daily[i + 1].temp.min)}°${temperatureUnit}`
      }

      for (let i = 0; i < weatherIcons.length; i++) {
        weatherIcons[i].innerHTML = weatherEmojis(data.daily[i + 1].weather[0].main); 
      }

      return data;
    }
  } catch (err) {
    console.log(err)
    // error function or default location
    return err;
  }
}

async function oneCallHourly(lat: string, lon: string): Promise<any> {
  try {
    let output = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,alerts&units=${units}&appid=79994613e7af015836a5a0e8225ca668`, { mode: "cors" });
    if (output.status === 200) {
      let data = await output.json();
      console.log(data)
      let timeOrDay = document.getElementsByClassName("timeOrDay");
      let temps = document.getElementsByClassName("highTemp");
      let weatherIcons = document.getElementsByClassName("hourlyDailyWeather");

      for (let i = 0; i < timeOrDay.length; i++) {
        let hour = await accurateTime(data.timezone_offset, data.hourly[i + 1].dt);
        timeOrDay[i].innerHTML = hour.slice(11, 16);
      }

      for (let i = 0; i < temps.length; i++) {
        temps[i].innerHTML = `${Math.floor(data.hourly[i + 1].temp)}°${temperatureUnit}`
      }

      for (let i = 0; i < weatherIcons.length; i++) {
        weatherIcons[i].innerHTML = weatherEmojis(data.hourly[i + 1].weather[0].main); 
      }

      return data;
    }
  } catch (err) {
    console.log(err)
    // error function or default location
    return err;
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
  switch(weather) {
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