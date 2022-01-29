import "../dist/output.css"
const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
const searchBar = document.getElementById("searchBar") as HTMLInputElement;
const temperature = document.getElementById("temperature") as HTMLParagraphElement;
const wind = document.getElementById("wind") as HTMLParagraphElement;
const weather = document.getElementById("weather") as HTMLParagraphElement;
let city = document.getElementById("city") as HTMLHeadingElement;
let data : JSON;

submitBtn.onclick = (e) => {
  e.preventDefault();
  getWeather(searchBar).then(Response => {
    city.innerHTML = Response[0];
    temperature.innerHTML = Response[1];
    wind.innerHTML = Response[2];
    weather.innerHTML = Response[3];
  })
  searchBar.value = "";
};

async function getWeather(input: HTMLInputElement): Promise<any> {
  try {
  let output = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${input.value}&units=imperial&appid=79994613e7af015836a5a0e8225ca668`, 
  { mode: "cors" }
  );
  if (output.status === 200) {
    data = await output.json();
    console.log(data)
    // @ts-ignore
    let dataCity = `${data.name}, ${data.sys.country}`
    // @ts-ignore
    let dataTemp = `Temperature: ${Math.floor(data.main.temp)}°F`;
    // @ts-ignore
    let dataWind = `Wind Speed: ${Math.floor(data.wind.speed)}mp/h`;
    // @ts-ignore
    let dataWeather = `Weather: ${data.weather[0].main}`;
    return [dataCity, dataTemp, dataWind, dataWeather];
  }
}
catch(err) {
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

