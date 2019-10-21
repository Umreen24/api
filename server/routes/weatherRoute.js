const express = require('express')
const rp = require('request-promise')
const {check, validationResult } = require('express-validator')
const weatherRouter = express.Router()
const darkSkyAPIKey = process.env.DARK_SKY_API_KEY
const googleAPIKey = process.env.GOOGLE_API_KEY

//db config
const { Client } = require('pg')
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})
client.connect()

//weather query string validation
weatherRouter.get('/', [
    check('city').isString().withMessage('City must be a string'),
    check('state').isString().withMessage('State must be a string'),
    check('weather_date').matches(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/).withMessage('Date must be a valid date'),
    check('key').isIn(process.env.API_CLIENT_KEY.split(',')).withMessage('Invalid client key')

], (req, res) => {

    //check for any user input errors
    const inputError = validationResult(req)
    if (!inputError.isEmpty()) {
        return res.status(422).json({ errors: inputError.array()})
    }

    //defining query variables
    const city = req.query.city
    const state = req.query.state
    const weather_date = req.query.weather_date
    const key = req.query.key
    const date_format = new Intl.DateTimeFormat('en-us', { dateStyle: 'short' })
    const current_date = date_format.format(new Date())

    //checking api call limit
    client.query(`SELECT to_char(last_date :: DATE, 'mm/dd/yyyy') as last_date, api_calls FROM api_key_limit WHERE key = '${key}'`)
    .then(d => {
        let api_last_date = d.rows[0].last_date
        let api_calls = d.rows[0].api_calls
        if (api_last_date != current_date)
        {
            client.query(`UPDATE api_key_limit SET api_calls = 1, last_date = '${current_date}' WHERE key = '${key}'`)
        }
        else if (api_last_date === current_date && api_calls < process.env.API_CLIENT_MAX)
        {
            client.query(`UPDATE api_key_limit SET api_calls = api_calls + 1 WHERE key = '${key}'`)
        }
        else {
            return res.status(422).json({ errors: 'API call limit reached'}) 
        }
    })

    //google geocoding
    let newLocation = city.replace(/ /g, '+')
    let options = {
      uri: `https://maps.googleapis.com/maps/api/geocode/json?address=${newLocation},+${state}&key=${googleAPIKey}`,
      json: true
    }
    
    //weather query for a specific day
    rp(options)
        .then(data => geoCoords = {
            lat: data.results[0].geometry.location.lat,
            lng: data.results[0].geometry.location.lng
        })
        .then(geoCoords => {
            let options = {
              url: `https://api.darksky.net/forecast/${darkSkyAPIKey}/${geoCoords.lat},${geoCoords.lng},${weather_date}T00:00:00?exclude=currently,flags`,
              json: true
            }
            rp(options)
            .then(r => {
                let weatherResponseObj = {
                    city: req.query.city,
                    state: req.query.state,
                    weather_date: req.query.weather_date,
                    summary: r.daily.data[0].summary,
                    high_temp: r.daily.data[0].temperatureHigh,
                    low_temp: r.daily.data[0].temperatureLow
                }
                res.json({weatherResponse: weatherResponseObj})
            })
        })
})

module.exports = weatherRouter