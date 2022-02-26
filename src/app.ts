import "../dist/output.css"
const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
const searchBar = document.getElementById("searchBar") as HTMLInputElement;
const temperature = document.getElementById("temperature") as HTMLParagraphElement;
const wind = document.getElementById("wind") as HTMLParagraphElement;
const weather = document.getElementById("weather") as HTMLParagraphElement;
let city = document.getElementById("city") as HTMLHeadingElement;
let celsius = document.getElementById("celsius") as HTMLInputElement;
let fahrenheit = document.getElementById("fahrenheit") as HTMLInputElement;
let dateTime = document.getElementById("dateTime") as HTMLParagraphElement;
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
  } else if(searchBar.value === "") {
    return;
  }else {
  alert("ayo stop");
  searchBar.value = "";
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
      let dataWind;
      if (units === 'metric') {
        dataWind = `${Math.floor((data.wind.speed) * (18 / 5))}${speedUnit}`;
      } else {
        dataWind = `${Math.floor(data.wind.speed)}${speedUnit}`;
      }

      // @ts-ignore
      let dataWeather = `Weather: ${data.weather[0].main}`;
      previousLatitude = data.coord.lat;
      previousLongitude = data.coord.lon;
      return [dataCity, dataTemp, dataWind, dataWeather];
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
    city.innerHTML = Response[0];
    temperature.innerHTML = Response[1];
    wind.innerHTML = Response[2];
    weather.innerHTML = Response[3];
    dateTime.innerHTML = getDateTime();
  })
}

function locationByName(input: HTMLInputElement) {
  let apiCall = `https://api.openweathermap.org/data/2.5/weather?q=${input.value}&units=${units}&appid=79994613e7af015836a5a0e8225ca668`;
  return getWeather(apiCall).then(Response => {
    city.innerHTML = Response[0];
    temperature.innerHTML = Response[1];
    wind.innerHTML = Response[2];
    weather.innerHTML = Response[3];
    dateTime.innerHTML = getDateTime();
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
  temperatureUnit = 'f'
  speedUnit = 'mph'
  locationByCords(previousLatitude, previousLongitude);
}

celsius.onclick = () => {
  units = 'metric'
  temperatureUnit = 'c'
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
