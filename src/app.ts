import "../dist/output.css"
const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
const searchBar = document.getElementById("searchBar") as HTMLInputElement;
const temperature = document.getElementById("temperature") as HTMLParagraphElement;
const wind = document.getElementById("wind") as HTMLParagraphElement;
const weather = document.getElementById("weather") as HTMLParagraphElement;
let city = document.getElementById("city") as HTMLHeadingElement;
let celsius = document.getElementById("celsius") as HTMLInputElement;
let fahrenheit = document.getElementById("fahrenheit") as HTMLInputElement;
let previousLatitude: string;
let previousLongitude: string;
let data: JSON;

submitBtn.onclick = (e) => {
  e.preventDefault();
  locationByName(searchBar)
  searchBar.value = "";
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
      let dataTemp = whichTemperature(data.main.temp);
      // @ts-ignore
      let dataWind = `Wind Speed: ${Math.floor(data.wind.speed)}mp/h`;
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
  searchBar.value = "Amsterdam";
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
  let apiCall = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=imperial&appid=79994613e7af015836a5a0e8225ca668`
  return getWeather(apiCall).then(Response => {
    city.innerHTML = Response[0];
    temperature.innerHTML = Response[1];
    wind.innerHTML = Response[2];
    weather.innerHTML = Response[3];
  })
}

function locationByName(input: HTMLInputElement) {
  let apiCall = `https://api.openweathermap.org/data/2.5/weather?q=${input.value}&units=imperial&appid=79994613e7af015836a5a0e8225ca668`;
  return getWeather(apiCall).then(Response => {
    city.innerHTML = Response[0];
    temperature.innerHTML = Response[1];
    wind.innerHTML = Response[2];
    weather.innerHTML = Response[3];
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

function whichTemperature(input: string): string {
  if (celsius.checked === true) {
    return `Temperature: ${Math.floor((+input - 32) / 1.8)}°C`;
  } else {
    return `Temperature: ${Math.round(+input)}°F`;
  }
}

fahrenheit.onclick = () => {
  //@ts-ignore
  locationByCords(previousLatitude, previousLongitude);
}

celsius.onclick = () => {
  //@ts-ignore
  locationByCords(previousLatitude, previousLongitude);
}