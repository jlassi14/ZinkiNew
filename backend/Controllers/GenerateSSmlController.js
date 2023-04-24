/* eslint-disable prettier/prettier */
const fs = require('fs');
const { Buffer } = require('buffer');
const serveStatic = require('serve-static');
const Quota = require('../Models/Quota');

exports.Quota = async (req, res) => {
  const { userId, Quota_Type } = req.body;
  let max_value;

  // Set max_value based on Quota_Type
  if (Quota_Type === 'free') {
    max_value = 4000;
  } else if (Quota_Type === 'premium') {
    max_value = 6000;
  } else {
    // Return an error if Quota_Type is not valid
    res.status(400).send('Invalid Quota_Type');
    return;
  }

  try {
    // Create a new Quota document
    const quota = new Quota({
      userid:userId,
      quota_number: '0',
      quota_type: Quota_Type,
      max_value,
    });

    // Save the document to the database
    await quota.save();

    res.status(200).json({ message: 'Quota added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};


exports.getQuotaById = async (req, res) => {
  const {id} = req.params; // Update parameter name to QuotaID

  try {
    // Find the quota document with matching id
    const quota = await Quota.findOne({ userid: id }); // Use QuotaID instead of id

    if (!quota) {
      // Return a 404 error if no matching quota is found
      res.status(404).send('Quota not found');
      return;
    }

    if (quota.quota_number>=quota.max_value&& quota.quota_type =='premium') {   
       res.status(200).json( 'you must charge your account');

    }
    else if (quota.quota_number>=quota.max_value&& quota.quota_type =='free') {   
      res.status(200).json( {message: 'free mode is disabled now!! , please go premium'});

   }

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};






exports.GenerateSsml = async (req, res) => {
  const { Text, StartPos, EndPos, DefaultSSML, SSMLTags } = req.body;

  // Generate the opening and closing tags for each specified SSML tag
  const openingTags = SSMLTags.map(tag => `<${tag.tag} ${tag.value}>`).join('');
  const closingTags = SSMLTags.map(tag => `</${tag.tag}>`).reverse().join('');

  // Insert the specified SSML tags at the specified position in the text
  const Start = Text.slice(0, StartPos);
  const End = Text.slice(EndPos);
  const Middle = `${openingTags}${Text.slice(StartPos, EndPos)}${closingTags}`;
  const Ssml = `${Start}<speak>${Middle}${End}</speak>`;



  let count = 0;
  let pos = -1;
  for (let i = 0; i < DefaultSSML.length; i++) {
    const c = DefaultSSML.charAt(i);
    if (c === "<") {
      count++;
    } else if (c === ">") {
      count--;
    } else if (count === 0) {
      //  if (c === " ") {pos++;}
      pos++;
      if (pos === StartPos || pos === EndPos) {
        if (pos === StartPos) {

          const X = DefaultSSML.slice(0, i);
          const Y = DefaultSSML.slice(i);
          const updateddefaultssml = X + openingTags + Y;

          console.log('updateddefaultssml StartPos : ', updateddefaultssml);
          console.log('X:', X);
          console.log('Y:', Y);
          console.log(`SSML generated: ${Start}<speak>${openingTags}${Text.slice(StartPos, EndPos)}${closingTags}${End}</speak>`);
        }
      }
      if (pos === StartPos && pos !== EndPos) {
        const X = DefaultSSML.slice(0, i);
        const Y = DefaultSSML.slice(i + EndPos - StartPos);
        const updateddefaultssml = X + openingTags + Text.slice(StartPos, EndPos) + closingTags + Y;
        console.log('====================================');
        console.log('====================================');

        console.log('updateddefaultssmlllllll:', updateddefaultssml);
        console.log('====================================');
        console.log('====================================');

        console.log('X:', X);
        console.log('Y:', Y);
        console.log('====================================');
        console.log('Text.slice(StartPos, EndPos)', Text.slice(StartPos, EndPos + 1), StartPos, EndPos, ' StartPos [ ', Text[StartPos], ' ] ', ' EndPos[ ', Text[EndPos], ' ] ',);
        console.log('====================================');
        console.log('====================================');
        console.log('closingTags', closingTags);
        console.log('====================================');
        console.log(`SSML generated: ${Start}<speak>${openingTags}${Text.slice(StartPos, EndPos)}${closingTags}${End}</speak>`);

        // Create the request object
        const request = {
          input: { ssml: Ssml },
          voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
          audioConfig: { audioEncoding: 'MP3' }
        };

        // Send the request to the Text-to-Speech API
        const response = await fetch('https://texttospeech.googleapis.com/v1beta1/text:synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-goog-api-key': 'AIzaSyBpKakDqYNOO4jegJsZ5X5Md-0NBLezJU0' },
          body: JSON.stringify(request)
        });

        const responseData = await response.json();
        const audioContent = responseData.audioContent;
        console.log('====================================');
        console.log(audioContent);
        console.log('====================================');
        // Send the response to the client

        if (audioContent) {
          const decodedAudioContent = Buffer.from(audioContent.toString('base64'), 'base64');
          // Write the decoded audio content to a new file
          fs.writeFile('audio.mp3', decodedAudioContent, (err) => {
            if (err) throw err;
            console.log('File created!');
          });
          // rest of the code
        } else {
          res.status(400).send({ message: 'Error: audio content not found' });
        }


        // Send the response to the client
        res.send({ message: 'SSML generated successfully! if (pos === StartPos ) ', Ssml: Ssml, updateddefaultssml: updateddefaultssml });


        return;
      } else if (pos === EndPos) {
        const X = DefaultSSML.slice(0, i);
        const Y = DefaultSSML.slice(i);
        const updateddefaultssml = X + closingTags + Y;

        console.log('updateddefaultssml:', updateddefaultssml);
        console.log('X:', X);
        console.log('Y:', Y);
        console.log(`SSML generated: ${Start}<speak>${openingTags}${Text.slice(StartPos, EndPos)}${closingTags}${End}</speak>`);
        res.send({ message: "SSML generated successfully! else if (pos === EndPos)", Ssml: Ssml, updateddefaultssml: ` ${updateddefaultssml}` });

      }

    }
  }

  console.log(`SSML generated: ${Ssml}`);
};






exports.GenerateSsml = async (req, res) => {
  const { Text, StartPos, EndPos, DefaultSSML, SSMLTags } = req.body;

  // Generate the opening and closing tags for each specified SSML tag
  const openingTags = SSMLTags.map(tag => `<${tag.tag} ${tag.value}>`).join('');
  const closingTags = SSMLTags.map(tag => `</${tag.tag}>`).reverse().join('');

  // Insert the specified SSML tags at the specified position in the text
  const Start = Text.slice(0, StartPos);
  const End = Text.slice(EndPos);
  const Middle = `${openingTags}${Text.slice(StartPos, EndPos)}${closingTags}`;
  const Ssml = `${Start}<speak>${Middle}${End}</speak>`;



  let count = 0;
  let pos = -1;
  for (let i = 0; i < DefaultSSML.length; i++) {
    const c = DefaultSSML.charAt(i);
    if (c === "<") {
      count++;
    } else if (c === ">") {
      count--;
    } else if (count === 0) {
      //  if (c === " ") {pos++;}
      pos++;
      if (pos === StartPos || pos === EndPos) {
        if (pos === StartPos) {

          const X = DefaultSSML.slice(0, i);
          const Y = DefaultSSML.slice(i);
          const updateddefaultssml = X + openingTags + Y;

          console.log('updateddefaultssml StartPos : ', updateddefaultssml);
          console.log('X:', X);
          console.log('Y:', Y);
          console.log(`SSML generated: ${Start}<speak>${openingTags}${Text.slice(StartPos, EndPos)}${closingTags}${End}</speak>`);
        }
      }
      if (pos === StartPos && pos !== EndPos) {
        const X = DefaultSSML.slice(0, i);
        const Y = DefaultSSML.slice(i + EndPos - StartPos);
        const updateddefaultssml = X + openingTags + Text.slice(StartPos, EndPos) + closingTags + Y;
        console.log('====================================');
        console.log('====================================');

        console.log('updateddefaultssmlllllll:', updateddefaultssml);
        console.log('====================================');
        console.log('====================================');

        console.log('X:', X);
        console.log('Y:', Y);
        console.log('====================================');
        console.log('Text.slice(StartPos, EndPos)', Text.slice(StartPos, EndPos + 1), StartPos, EndPos, ' StartPos [ ', Text[StartPos], ' ] ', ' EndPos[ ', Text[EndPos], ' ] ',);
        console.log('====================================');
        console.log('====================================');
        console.log('closingTags', closingTags);
        console.log('====================================');
        console.log(`SSML generated: ${Start}<speak>${openingTags}${Text.slice(StartPos, EndPos)}${closingTags}${End}</speak>`);




        // Send the response to the client
        res.send({ message: 'SSML generated successfully! if (pos === StartPos ) ', Ssml: Ssml, updateddefaultssml: updateddefaultssml });


        return;
      } else if (pos === EndPos) {
        const X = DefaultSSML.slice(0, i);
        const Y = DefaultSSML.slice(i);
        const updateddefaultssml = X + closingTags + Y;

        console.log('updateddefaultssml:', updateddefaultssml);
        console.log('X:', X);
        console.log('Y:', Y);
        console.log(`SSML generated: ${Start}<speak>${openingTags}${Text.slice(StartPos, EndPos)}${closingTags}${End}</speak>`);
        res.send({ message: "SSML generated successfully! else if (pos === EndPos)", Ssml: Ssml, updateddefaultssml: ` ${updateddefaultssml}` });

      }

    }
  }

  console.log(`SSML generated: ${Ssml}`);
};


exports.TesteSsml = async (req, res) => {


  const { DefaultSSML, SSMLTags, selectedLanguage,selectedVoiceGender } = req.body;
  let insideTag = false;
  let MyNewSSML = DefaultSSML;
  
/*
  const {id} = req.params; // Update parameter name to QuotaID

  try {
    // Find the quota document with matching id
    const quota = await Quota.findOne({ userid: id }); // Use QuotaID instead of id

    if (!quota) {
      // Return a 404 error if no matching quota is found
      res.status(404).send('Quota not found');
      return;
    }

    if (quota.quota_number>=quota.max_value&& quota.quota_type =='premium') {   
       res.status(200).json( 'you must charge your account');

    }
    else if (quota.quota_number>=quota.max_value&& quota.quota_type =='free') {   
      res.status(200).json( {message: 'free mode are disabled , please go premium'});

   }

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }*/


  // Add opening tags
  for (let i = 0; i < SSMLTags.length; i++) {
    let position = 0;
    let openingTags = '';
    for (let j = 0; j < MyNewSSML.length; j++) {
      if (MyNewSSML[j] === "<") {
        insideTag = true;
      } else if (MyNewSSML[j] === ">") {
        insideTag = false;
      } else if (!insideTag) {
        if (SSMLTags[i].StartPos === position ) {
          if (SSMLTags[i].tag === 'break') {
            openingTags = `<${SSMLTags[i].tag} ${SSMLTags[i].value}/>`;
          } else {
            openingTags = `<${SSMLTags[i].tag} ${SSMLTags[i].value}>`;
          }
                    const X = MyNewSSML.slice(0,  j);
          const Y = MyNewSSML.slice(j);

          const updatedSSML = X + openingTags + Y;
          MyNewSSML = updatedSSML;

         // console.log('Added opening tag:', openingTags);
          //console.log('Updated SSML:', MyNewSSML);
        }
        position++;
      }
    }
  }
  
  // Add closing tags
  for (let i = 0; i < SSMLTags.length; i++) {
    let position = 0;
    let closingTags = '';
    for (let j = 0; j < MyNewSSML.length; j++) {
      if (MyNewSSML[j] === "<") {
        insideTag = true;
      } else if (MyNewSSML[j] === ">") {
        insideTag = false;
      } else if (!insideTag) {
        if (SSMLTags[i].EndPos === position ) {

          if (SSMLTags[i].tag === 'break') {
            closingTags = ``;
          } else {
            closingTags = `</${SSMLTags[i].tag}>`;
          }
          const X = MyNewSSML.slice(0,  j);
          const Y = MyNewSSML.slice(j);

          const updatedSSML = X + closingTags + Y;
          MyNewSSML = updatedSSML;

          //console.log('Added closing tag:', closingTags);
          //console.log('Updated SSML:', MyNewSSML);
        }
        position++;
      }
    }
  }

   // Create the request object
        const request = {
          input: { ssml: MyNewSSML },
          voice: {
            languageCode: selectedLanguage, ssmlGender: selectedVoiceGender  },
          audioConfig: { audioEncoding: 'MP3' }
        };

        // Send the request to the Text-to-Speech API
        const response = await fetch('https://texttospeech.googleapis.com/v1beta1/text:synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-goog-api-key': 'AIzaSyBpKakDqYNOO4jegJsZ5X5Md-0NBLezJU0' },
          body: JSON.stringify(request)
        });

        const responseData = await response.json();
        const audioContent = responseData.audioContent;

        if (audioContent) {
          const decodedAudioContent = Buffer.from(audioContent.toString('base64'), 'base64');
          // Write the decoded audio content to a new file
          fs.writeFile('audio.mp3', decodedAudioContent, (err) => {
            if (err) throw err;
            console.log('File created!');
          });
          // Send the response to the client with the file path 
          res.send({ message: 'SSML generated successfully! ',  url: `http://192.168.1.5:3000/audio` , SSML: MyNewSSML  });
          return;
        } else {
          res.status(400).send({ message: 'Error: audio content not found' });
        }

  // Return the updated SSML
 // return res.status(200).json({ SSML: MyNewSSML });
}



