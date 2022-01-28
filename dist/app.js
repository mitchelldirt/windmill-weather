"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../dist/output.css");
const submitBtn = document.getElementById("submitBtn");
const searchBar = document.getElementById("searchBar");
const temperature = document.getElementById("temperature");
const wind = document.getElementById("wind");
const weather = document.getElementById("weather");
let city = document.getElementById("city");
let data;
submitBtn.onclick = (e) => {
    e.preventDefault();
    getWeather(searchBar).then(Response => {
        city.innerHTML = Response[0];
        temperature.innerHTML = Response[1];
        wind.innerHTML = Response[2];
        weather.innerHTML = Response[3];
    });
    searchBar.value = "";
};
function getWeather(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let output = yield fetch(`https://api.openweathermap.org/data/2.5/weather?q=${input.value}&units=imperial&appid=79994613e7af015836a5a0e8225ca668`, { mode: "cors" });
            if (output.status === 200) {
                data = yield output.json();
                console.log(data);
                // @ts-ignore
                let dataCity = `${data.name}, ${data.sys.country}`;
                // @ts-ignore
                let dataTemp = `Temperature: ${Math.floor(data.main.temp)}°F`;
                // @ts-ignore
                let dataWind = `Wind Speed: ${Math.floor(data.wind.speed)}mp/h`;
                // @ts-ignore
                let dataWeather = `Weather: ${data.weather[0].main}`;
                return [dataCity, dataTemp, dataWind, dataWeather];
            }
        }
        catch (err) {
            console.log(err);
            // error function or default location
            return err;
        }
    });
}
window.onload = () => {
    searchBar.value = "Amsterdam";
    submitBtn.click();
    searchBar.value = "";
};
