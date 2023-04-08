/* eslint-disable prettier/prettier */
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true,limit :'100mb' }));
// parse application/json
app.use(bodyParser.json());
// Instantiates a client

app.use('/audio', express.static(__dirname + '/audio.mp3'));



require('./Routes/index')(app);




const input = "<speak> hi every one<say-as interpret-as='ordinal'>3rd</say-as><emphasis level='strong'>important</emphasis>Hello, world!</speak>";
const num = 0;

  let position = 0;
  let insideTag = false;

  for (let i = 0; i < input.length; i++) {
    if (input[i] === "<") {
      insideTag = true;
    } else if (input[i] === ">") {
      insideTag = false;
    } else if (!insideTag) {
      if (num === position) {
        console.log(i);
      }
      position++;
    }
  }

  


mongoose.connect('mongodb://127.0.0.1:27017/ZinkDB', {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
	console.log('mongodb connected successfully');
}).catch((err)=>{
	console.log(err);
});







app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});