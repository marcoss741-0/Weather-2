const btnSearch = document.querySelector(".btn-search");
const inputCity = document.querySelector(".input-city");
const notFoundSection = document.querySelector(".not-found");
const searchCitySection = document.querySelector(".search-city");
const weatherInfoSection = document.querySelector(".weather-info");

const locationCityTxt = document.querySelector(".location-city");
const currentDateTxt = document.querySelector(".current-date");
const weatherTempTxt = document.querySelector(".weather-temperature");
const weatherDescTxt = document.querySelector(".weather-description");
const weatherIconImg = document.querySelector(".weather-icon");
const humidityValueTxt = document.querySelector(".humidity-value");
const windValueTxt = document.querySelector(".wind-value");
const forecastSection = document.querySelector(".forecast-item-container");
const currentDateSection = document.querySelector(".current-date");

const apiKey = "61b3c5745262d6c554532ecb61abab3d";

btnSearch.addEventListener("click", async () => {
  let city = inputCity.value;
  if (city.trim() != "") {
    await updateWeatherInfos(city);
    inputCity.value = "";
    inputCity.blur();
  }
});

inputCity.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    let city = inputCity.value;
    if (city.trim() != "") {
      await updateWeatherInfos(city);
      inputCity.value = "";
      inputCity.blur();
    }
  }
});

var dateTodayText = new Date();
const dtOptions = { day: "2-digit", month: "short", weekday: "long" };
const dtFormat = dateTodayText.toLocaleDateString("pt-BR", dtOptions);
currentDateSection.textContent = dtFormat;

async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${encodeURI(
    city
  )}&units=metric&appid=${apiKey}&lang=pt_br`;

  const data = await fetch(apiUrl).then((response) => response.json());
  return data;
}

async function updateWeatherInfos(city) {
  const dados = await getFetchData("weather", city);

  if (dados.cod != "200") {
    showDisplaySection(notFoundSection);
    return;
  }

  await updateWeatherDataOnScreen(dados);
  await updateForecastInfos(city);
}

async function updateForecastInfos(city) {
  const forecastData = await getFetchData("forecast", city);
  const timeTaken = "12:00:00";
  const todayDate = new Date()
    .toLocaleDateString("pt-BR", { timeZone: "UTC" })
    .split("T")[0];

  forecastSection.innerHTML = "";
  forecastData.list.forEach((forecastWeather) => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) &&
      !forecastWeather.dt_txt.includes(todayDate)
    ) {
      updateForecastItem(forecastWeather);
    }
  });
}

async function updateForecastItem(forecastItemData) {
  const { dt_txt, main, weather } = forecastItemData;
  const { temp } = main;
  const { id, description } = weather[0];

  const date = new Date(dt_txt);
  const dateOptions = { day: "2-digit", month: "short" };
  const dateFormatted = date.toLocaleDateString("pt-BR", dateOptions);

  const forecastItem = `<div class="forecast-item">
                        <h5 class="forecast-item-date regular-text">${dateFormatted}</h5>
                        <img
                          src="../assets/weather/${await getWeatherIcon(
                            id
                          )}.svg"
                          alt="Weather-icon"
                          class="forecast-item-img"
                        />
                        <h5 class="forecast-item-temperature">${Math.round(
                          temp
                        )}°C</h5>
                        <p class="forecast-item-description">${description}</p>
                      </div>
          `;

  forecastSection.insertAdjacentHTML("beforeend", forecastItem);
  console.log(await getWeatherIcon(id));
}

async function updateWeatherDataOnScreen(data) {
  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, description }],
    wind: { speed },
  } = data;

  locationCityTxt.textContent = country;
  weatherTempTxt.textContent = `${Math.round(temp)}°C`;
  weatherDescTxt.textContent = description;
  humidityValueTxt.textContent = `${humidity}%`;
  windValueTxt.textContent = `${speed} km/h`;

  weatherIconImg.src = `assets/weather/${await getWeatherIcon(id)}.svg`;

  showDisplaySection(weatherInfoSection);
}

async function getWeatherIcon(weatherId) {
  switch (true) {
    case weatherId <= 232:
      return "thunderstorm";
    case weatherId <= 321:
      return "drizzle";
    case weatherId <= 531:
      return "rain";
    case weatherId <= 622:
      return "snow";
    case weatherId <= 781:
      return "atmosphere";
    case weatherId <= 800:
      return "clear";
    default:
      return "clouds";
  }
}

function showDisplaySection(section) {
  [notFoundSection, searchCitySection, weatherInfoSection].forEach((sec) => {
    sec.style.display = "none";
  });
  section.style.display = "flex";
}
