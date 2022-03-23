declare module '@tomtom-international/web-sdk-plugin-searchbox'

export type weatherData = {
    currentWeather: string,
    temperature: number,
    timezoneOffset: number,
    currentUnixTime: number,
    sunriseUnixTime: number,
    sunsetUnixTime: number,
    humidity: number,
    wind: number,
    daily: Array,
    hourly: Array
}