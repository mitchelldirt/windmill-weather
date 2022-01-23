import './output.css'
const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
const searchBar = document.getElementById("searchBar") as HTMLInputElement;
let data : JSON;

submitBtn.onclick = (e) => {
  e.preventDefault();
  getWeather(searchBar).then(Response => {
    console.log(Response.main.temp);
  })
};

async function getWeather(input: HTMLInputElement): Promise<any> {
  try {
  let output = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${input.value}&units=imperial&appid=79994613e7af015836a5a0e8225ca668`, 
  { mode: "cors" }
  );
  if (output.status === 200) {
    data = await output.json();
    console.log(data.main.temp);
    console.log(data)
    return data;
  }
}
catch(err) {
  console.log(err)
  return;
}
}

