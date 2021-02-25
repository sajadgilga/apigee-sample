const express = require('express')
const app = express()
const port = 9000

app.get('/v0/test/hello', (req, res) => {
	console.log('GET test/hello called', req)
	res.send('Hello World!')
})

app.listen(port, () => {
	  console.log(`Example app listening at http://localhost:${port}`)
})
