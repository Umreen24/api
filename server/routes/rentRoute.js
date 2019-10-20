const express = require('express')
const rentRoute = express.Router()
const {check, validationResult} = require('express-validator')

//db config
const pgp = require('pg-promise')()
const connectionString = process.env.DATABASE_URL
const db = pgp(connectionString)

rentRoute.get('/', [
    // check('compare', 'Incorrect string entered').isIn(['greater', 'less']),
    check('rent', 'Rent must be a number').isInt()
    // check('quantity', 'Must be a number').isInt()
    // check('key', 'Invalid API key').equals(process.env.DB_KEY)

], (req, res) => {

    const inputError = validationResult(req)
    if(!inputError.isEmpty()){
        res.status(400).json({errors: inputError.array()})
    }

    // const compare = req.query.compare
    const rent = req.query.rent
    // const quantity = req.query.quantity
    // compare === 'greater' ? compare === '>' : compare === '<'
    console.log(rent)

    db.any(`SELECT city, state, avg_rent FROM city_rents WHERE avg_rent > $1 LIMIT 5`, [rent])
    .then(city_rents => city_rents[0] ? res.json(city_rents) : res.json({errors: 'No cities matched your rent criteria'}))
    .catch(() => res.json({errors: 'No cities matched your rent criteria'}))
})

module.exports = rentRoute