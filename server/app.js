require('dotenv').config()
const express = require('express')
const app = express()
const PORT = 5000

app.get('/', (req, res) => {
    res.send('Where Should I Live?')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}!`)
})