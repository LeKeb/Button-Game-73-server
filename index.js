const BinaryFile = require('binary-file')
const express = require('express')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
})

function click() {
	if (typeof click.counter == 'undefined') {
		const dataFile = new BinaryFile('./data', 'r')
		(async function(){
			try {
				await dataFile.open()
				click.counter = await dataFile.readUInt32()
				await dataFile.close()
				console.log('Read data file successfully')
			} catch (err) {
				console.log('Error when reading data file')
				click.counter = 0
			}
		})()
	}
	const clicks = ++click.counter
	
	updateDataFile(clicks)
	
	return clicks
}

function updateDataFile(clicks) {
	const dataFile = new BinaryFile('./data', 'w')
		(async function(){
			try {
				await dataFile.open()
				await dataFile.writeUInt32(clicks)
				await dataFile.close()
				console.log('Write data file successfully')
			} catch (err) {
				console.log('Error when writing data file')
			}
		})()
}

express()
	.use(bodyParser.json())
	
	.get('/', (req, res) => {
		res.send('This is a simple button click game')
	})
	
	.get('/winners', async (req, res) => {
		try {
			const client = await pool.connect()
			const result = await client.query('SELECT * FROM winners_table')
			const winners = { 'winners': (result) ? result.rows : null}
			res.send(winners)
			client.release()
		} catch (error) {
			console.error(err)
			res.status(500)
			res.send('Something went wrong when retrieving winners!')
		}
	})
	
	.post('/', (req, res) => {
		var clicks = click()
		response = {}
		if (clicks % 500 === 0) {
			response.prize = 500
			updateWinners({"name": req.body.name, "prize": 500})
		} else if (clicks % 200 === 0) {
			response.prize = 200
			updateWinners({"name": req.body.name, "prize": 200})
		} else if (clicks % 100 === 0) {
			response.prize = 100
			updateWinners({"name": req.body.name, "prize": 100})
		} else {
			response.prize = 0
		}
		response.next_win = 100 - clicks % 100
		res.send(response)
	})
	
	.listen(PORT, () => console.log(`Listening on port: ${PORT}`))

async function updateWinners(winner) {
	try {
		const client = await pool.connect()
		const result = await client.query(
			'INSERT INTO winners_table (name, prize) VALUES($1, $2) RETURNING id'
			, [winner.name, winner.prize])
		console.log('new winner inserted with id: ' + result.rows[0].id)
		client.release()
	} catch (error) {
		console.error(err)
	}
}
	
