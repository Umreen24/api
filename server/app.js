//packages/config
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const PORT = process.env.PORT || 8000

//middleware
app.use(cors())
app.use(express.json())

//routes
const weatherRouter = require('./routes/weatherRoute')
const rentRouter = require('./routes/rentRoute')
app.use('/weather', weatherRouter)
app.use('/rent', rentRouter)

//root route 
app.get('/', (req, res) => {
    res.send('Where Should I Live API! Please see readme for API instructions.')
})

//server
app.listen(PORT, () => {
    console.log(`Weather-Rent app is running on port ${PORT}!`)
})