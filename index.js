const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

async function click() {
	if (typeof click.counter == 'undefined') {
		try {
			const client = await pool.connect();
			const result = await client.query('SELECT * FROM clicks_table');
			click.counter = result.rows[0].clicks;
			console.log('read from clicks_table complete');
			client.release();
		} catch (error) {
			console.error(error);
			click.counter = 0;
		}
	}
	
	const clicks = ++click.counter;
	
	updateClicksStorage(clicks);
	
	return clicks;
}

async function updateClicksStorage(clicks) {
	try {
		const client = await pool.connect();
		const result = await client.query(
			'UPDATE clicks_table SET clicks = $1 WHERE clicks = clicks'
			, [clicks]);
		console.log('clicks_table updated');
		client.release();
	} catch (error) {
		console.error(error);
	}
}

express()
	.use(bodyParser.json())
	
	.get('/', (req, res) => {
		res.send('This is a simple button click game' +
		'<br><br>The server code can be found <a href="https://github.com/LeKeb/Button-Game-73-server">here</a>.' +
		'<br>The game code can be found <a href="https://github.com/LeKeb/Button-Game-73-client">here</a>.');
	})
	
	.get('/winners', async (req, res) => {
		try {
			const client = await pool.connect();
			const result = await client.query('SELECT * FROM winners_table');
			const winners = { 'winners': (result) ? result.rows : null};
			res.send(winners);
			client.release();
		} catch (error) {
			console.error(error);
			res.status(500);
			res.send('Something went wrong when retrieving winners!');
		}
	})
	
	.post('/', async (req, res) => {
		var clicks = await click();
		response = {};
		if (clicks % 500 === 0) {
			response.prize = 500;
			updateWinners({"name": req.body.name, "prize": 500});
		} else if (clicks % 200 === 0) {
			response.prize = 200;
			updateWinners({"name": req.body.name, "prize": 200});
		} else if (clicks % 100 === 0) {
			response.prize = 100;
			updateWinners({"name": req.body.name, "prize": 100});
		} else {
			response.prize = 0;
		}
		response.next_win = 100 - clicks % 100;
		res.send(response);
	})
	
	.listen(PORT, () => console.log(`Listening on port: ${PORT}`))

async function updateWinners(winner) {
	try {
		const client = await pool.connect();
		const result = await client.query(
			'INSERT INTO winners_table (name, prize) VALUES($1, $2) RETURNING id'
			, [winner.name, winner.prize]);
		console.log('new winner inserted with id: ' + result.rows[0].id);
		client.release();
	} catch (error) {
		console.error(error);
	}
}
	
