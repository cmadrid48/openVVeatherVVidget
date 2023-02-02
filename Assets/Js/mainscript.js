
// - API documentation https://openweathermap.org/api

var apiKey = "a0c534041aa3fde2d7aeae2499471ee7";

var searchFormEl = document.querySelector('#search-form');
var cityInputEl = document.querySelector('#city');
var searchHistoryEl = document.querySelector('#search-history');
var searchListEl = document.querySelector('#search-list');
var cityDateEl = document.querySelector('#city-date');
var iconEl = document.querySelector('#current-icon');
var tempEl = document.querySelector('#current-temp');
var windEl = document.querySelector('#current-wind');
var humidityEl = document.querySelector('#current-humidity');
var futureConditionsEl = document.querySelector('#future-conditions');
var futureHeaderEl = document.querySelector('#future-conditions-header');

// formSubmitHandler clears user input, and searches users input if null, user will be prompted "please enter a city to search".
var formSubmitHandler = function (event) {
    event.preventDefault();

    var city = cityInputEl.value.trim();

    if (city) {
        cleanFutureConditions();
        getCurrentWeather(city);

        cityInputEl.value = '';
    } else {
        alert('Please enter a city to search');
    }
};

// getCurrentWeather takes a search term as an argument and runs a fetch request to Open Weather Map's Current Weather API.
// The function will write the fetched current weather data to the HTML page and pass the coordinates of the user's search to get5DayWeather.
var getCurrentWeather = function (searchTerm) {
    var openWeatherMapApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchTerm}&appid=${apiKey}&units=imperial`;

    fetch(openWeatherMapApiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    // Create the Weather Icon
                    var iconImgEl = document.createElement('img');
                    iconImgEl.setAttribute("src", `https://openweathermap.org/img/w/${data.weather[0].icon}.png`);

                    // Format the current date
                    var date = new Date(data.dt*1000);
                    date = date.toLocaleDateString();

                    cityDateEl.textContent = `${data.name} (${date})`;
                    cityDateEl.appendChild(iconImgEl);
                    tempEl.textContent = `Temp: ${data.main.temp} F`;
                    windEl.textContent = `Wind: ${data.wind.speed} MPH`;
                    humidityEl.textContent = `Humidity: ${data.main.humidity} %`;

                    updateSearchHistory(data.name);
                    get5DayWeather(data.coord.lat, data.coord.lon);

                });
            } else {
                alert('Error: ' + response.statusText + ' when making request to Open Weather Map');
            }
        })
        .catch(function (error) {
            alert('Unable to connect to Open Weather Map');
        });
}

// get5DayWeather runs a fetch request to Open Weather Map's 5 Day Forecast API using coordinates.
// The API response contains a list of 40 timestamps including every 3 hours starting from the current hour.
// The function will parse through the feteched data using timeIndices and write the fetched 5 day forecast to the HTML page.
var timeIndices = [8,16,24,32,39];
var get5DayWeather = function (lat, lon) {
    var fiveDayWeatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    fetch(fiveDayWeatherApiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    console.log(data);
                    timeIndices.forEach(function(i) {
                        var weatherContainer = document.createElement('div');
                        var dateEl = document.createElement('h4');
                        var iconEl = document.createElement('img');
                        var dataListEl = document.createElement('ul');
                        var tempEl = document.createElement('li');
                        var windEl = document.createElement('li');
                        var humidityEl = document.createElement('li');

                        weatherContainer.setAttribute("class", "small-card");
                        // Format date string
                        var date = new Date(data.list[i].dt*1000);
                        date = date.toLocaleDateString();
                        
                        iconEl.setAttribute("src", `https://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png`);

                        dateEl.textContent = `${date}`;
                        dateEl.appendChild(iconEl);
                        tempEl.textContent = `Temp: ${data.list[i].main.temp} F`;
                        windEl.textContent = `Wind: ${data.list[i].wind.speed} MPH`;
                        humidityEl.textContent = `Humidity: ${data.list[i].main.humidity} %`;

                        futureHeaderEl.setAttribute("style", "visibility: set");
                        weatherContainer.appendChild(dateEl);
                        dataListEl.appendChild(tempEl);
                        dataListEl.appendChild(windEl);
                        dataListEl.appendChild(humidityEl);
                        weatherContainer.appendChild(dataListEl);
                        futureConditionsEl.appendChild(weatherContainer);
                    })
                })
            } else {
                alert('Error: ' + response.statusText + ' when making request to 5 Day Weather Forecast');
            }
        })
        .catch(function (error) {
            alert('Unable to connect to 5 Day Weather Forecast');
        });

}

// updateSearchHistory will traverse through the current search history and add the current searchTerm to the history if not already listed.
var searchHistory = [];
var updateSearchHistory = function (searchTerm) {
    if (searchHistory.length) {
        var searchExists = false;
        for (var i = 0; i < searchHistory.length; i++) {
            if (searchHistory[i] == searchTerm) {
                searchExists = true;
            }
        }

        if (!searchExists) {
            console.log("pushing to search history");
            searchHistory.push(searchTerm);
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
            addButton(searchTerm);
        }
    }
    else {
        console.log("starting new search history");
        searchHistory.push(searchTerm);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        renderSearchHistory();
    }
}

// Pulls the stored search history and renders to page if available.
function init() {
    var storedData = JSON.parse(localStorage.getItem("searchHistory"));
    if (storedData !== null) {
        searchHistory = storedData;
        renderSearchHistory();
    }
}

function addButton(btnText) {
    var buttonEl = document.createElement('btn');
    var listEl = document.createElement('li');

    buttonEl.textContent = btnText;

    listEl.appendChild(buttonEl);
    searchListEl.appendChild(listEl);
}

function renderSearchHistory() {
    searchHistory.forEach(function(entry) {
        console.log(entry);
        var buttonEl = document.createElement('btn');
        var listEl = document.createElement('li');

        buttonEl.textContent = entry;

        listEl.appendChild(buttonEl);
        searchListEl.appendChild(listEl);
    })
}

var buttonClickHandler= function(event) {
    event.preventDefault();

    cleanFutureConditions();
    getCurrentWeather(event.srcElement.textContent);
}

function cleanFutureConditions() {
    if (futureConditionsEl.children.length) {
        var count = futureConditionsEl.children.length;
        for (var i = 0; i < count; i++) {
            futureConditionsEl.removeChild(futureConditionsEl.children[0]);
        }
    }
    futureHeaderEl.setAttribute("style", "visibility: hidden");
}

init();
searchFormEl.addEventListener('submit', formSubmitHandler);
searchHistoryEl.addEventListener('click', buttonClickHandler);