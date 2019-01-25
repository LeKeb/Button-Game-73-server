const express = require('express')
const PORT = process.env.PORT || 5000

express()
	.get('/test', (req, res) => {
		res.send('Message received')
	})
	.post('/click', (req, res) => {
		
	})
	.listen(PORT, () => console.log('Listening on ${ PORT }'))