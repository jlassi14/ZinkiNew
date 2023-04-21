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


const ssmlTagToEmojiMap = {
  'speak': ' ', // tallef el speak tag famesh besoin lih ( 5ali string fih espace )
  'break': '😴😴😴',
  'emphasis': '🔍🔍🔍',
  'prosody': '🔊🔊🔊',
  'say-as': '🗣️🗣️🗣️',
  // Add more mappings as needed
};

const replaceSsmlTagsWithEmojis = (ssmlText) => {
  let emojiText = ssmlText;

  // Replace self-closing SSML tags with emojis based on the mapping
  const selfClosingRegex = /<(\w+)\s+([^>]+)?\/>/g;
  const selfClosingMatches = emojiText.match(selfClosingRegex);

  if (selfClosingMatches) {
    for (const match of selfClosingMatches) {
      const tagWithAttrs = match.substring(1, match.length - 2);
      const [ssmlTag, attrs] = tagWithAttrs.split(/\s+/);
      const emoji = ssmlTagToEmojiMap[ssmlTag] || match;
      emojiText = emojiText.replace(match, emoji);
    }
  }

  // Replace opening and closing SSML tags with emojis based on the mapping
  const regex = /<(\w+)\s+([^>]+)?>|<\/(\w+)>/g;
  const matches = emojiText.match(regex);

  if (matches) {
    for (const match of matches) {
      if (match.startsWith('</')) {
        const ssmlTag = match.substring(2, match.length - 1);
        const emoji = ssmlTagToEmojiMap[ssmlTag] || match;
        emojiText = emojiText.replace(match, emoji);
      } else {
        const tagWithAttrs = match.substring(1, match.length - 1);
        const [ssmlTag, attrs] = tagWithAttrs.split(/\s+/);
        const emoji = ssmlTagToEmojiMap[ssmlTag] || match;
        emojiText = emojiText.replace(match, emoji);
      }
    }
  }

  // Replace initial SSML tags with emojis based on the mapping
  const initialRegex = /^<(\w+)>/;
  const initialMatch = emojiText.match(initialRegex);

  if (initialMatch) {
    const ssmlTag = initialMatch[1];
    const emoji = ssmlTagToEmojiMap[ssmlTag] || initialMatch[0];
    emojiText = emojiText.replace(initialRegex, emoji);
  }

  return emojiText;
};


let ssml = '<speak><emphasis level="strong">To be</emphasis><break time="200ms"/> or not to be, <break time="400ms"/><emphasis level="moderate">that</emphasis>is the question.<break time="400ms"/>Whether tis nobler in the mind to sufferThe slings and arrows of outrageous fortune,<break time="200ms"/>Or to take arms against a sea of troublesAnd by opposing end them.</speak>'

let rst = replaceSsmlTagsWithEmojis(ssml)

console.log(rst)




app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});