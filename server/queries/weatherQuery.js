const rp = require('request-promise')
const darkSkyAPIKey = process.env.DARK_SKY_API_KEY
const googleAPIKey = process.env.GOOGLE_API_KEY

const getCoords = async (city, state) => {
  let newLocation = city.replace(' ', '+')
  let options = {
    uri: `https://maps.googleapis.com/maps/api/geocode/json?address=${newLocation},+${state}&key=${googleAPIKey}`,
    json: true
  }

  let geolocation = await rp(options)

  if (geolocation.err) {res.json({error: geolocation.err})}
  else if (!geolocation.results[0]){
    return {error: 'Invalid location'}
  } else {
    let geoCoords = {
      lat: geolocation.results[0].geometry.location.lat,
      lng: geolocation.results[0].geometry.location.lng
    }
    return geoCoords
  }
}

const fetchWeather = async (geoCoords, date) => {
    let options = {
      url: `https://api.darksky.net/forecast/${darkSkyAPIKey}/${geoCoords.lat},${geoCoords.lng},${date}T00:00:00?exclude=currently,flags`,
      json: true
    }

    let weather = await rp(options)

    if (weather.err) res.json({error: weather.err})
    else{
        return weather
    }
}

module.exports = {
  fetchWeather: fetchWeather,
  getCoords: getCoords
}
