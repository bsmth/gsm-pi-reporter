const express = require('express')
const bodyParser = require("body-parser");
const app = express()
const path = require('path')
const PORT = process.env.PORT || 5000


const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

console.log(process.env.DATABASE_URL)

var moment = require('moment');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM events_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/http', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .post('/', async (req, res) => {
    try {
      var description = JSON.stringify(req.body)
      const client = await pool.connect()
      const result = await client.query('INSERT INTO events_table (timestamp, description) VALUES ($1, $2)', [moment().utcOffset(120).format('LLLL'), description], (error, results) => {
        if (error) {
          throw error
        }
        res.status(201).send(`event added`)
        client.release();
      })
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
