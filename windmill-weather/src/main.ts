import '../dist/assets/index.42a6aa9c.css'
const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;
const searchBar = document.getElementById("searchBar") as HTMLInputElement;

submitBtn.onclick = (e) => {
  e.preventDefault();
  getWeather(searchBar)
};

async function getWeather(input: HTMLInputElement): Promise<void> {
  try {
  let output = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${input.value}&units=imperial&appid=79994613e7af015836a5a0e8225ca668`, 
  { mode: "cors" }
  );
  if (output.status === 200) {
    let data = await output.json();
    console.log(data)
  }
}
catch(err) {
  console.log(err)
}
}

