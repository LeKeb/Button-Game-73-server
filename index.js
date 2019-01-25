const express = require('express')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 5000

const winners = [
	
];

var clicks = 0;

express()
	.use(bodyParser.json())
	
	.get('/winners', (req, res) => {
		res.send(winners)
	})
	
	.post('/', (req, res) => {
		clicks++;
		response = {}
		if (clicks % 500 === 0) {
			response.prize = 500
			winners.push({"name": req.body.name, "prize": 500})
		} else if (clicks % 200 === 0) {
			response.prize = 200
			winners.push({"name": req.body.name, "prize": 200})
		} else if (clicks % 100 === 0) {
			response.prize = 100
			winners.push({"name": req.body.name, "prize": 100})
		} else {
			response.prize = 0
		}
		response.next_win = 100 - clicks % 100;
		res.send(response)
	})
	
	.listen(PORT, () => console.log(`Listening on port: ${PORT}`))