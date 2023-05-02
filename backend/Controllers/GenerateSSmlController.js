/* eslint-disable prettier/prettier */
const fs = require('fs');
const { Buffer } = require('buffer');
const serveStatic = require('serve-static');
const Quota = require('../Models/Quota');
const IpAdress = require('./IpAdress');
const cheerio = require('cheerio');

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
      userid: userId,
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
  const { id } = req.params; // Update parameter name to QuotaID

  try {
    // Find the quota document with matching id
    const quota = await Quota.findOne({ userid: id }); // Use QuotaID instead of id

    if (!quota) {
      // Return a 404 error if no matching quota is found
      res.status(404).send('Quota not found');
      return;
    }

    if (quota.quota_number >= quota.max_value && quota.quota_type == 'premium') {
      res.status(200).json('you must charge your account');

    }
    else if (quota.quota_number >= quota.max_value && quota.quota_type == 'free') {
      res.status(200).json({ message: 'free mode is disabled now!! , please go premium' });

    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};



exports.UpdateTags = async (req, res) => {
  console.log('req.body:', JSON.stringify(req.body) );
  const { tabData } = req.body;
  console.log('tabData:', JSON.stringify(tabData));
  let mlString = '<speak>';
  let tagStack = [];

  tabData.forEach((item) => {
    if (item.tag.length === 0 || (item.tag.length === 1 && item.tag[0].name === '' && item.tag[0].value === '')) {
      mlString += item.text;
    } else {
      let tags = '';
      item.tag.forEach((tagItem) => {
        if (tagItem.name !== '' && tagItem.value !== '') {
          tags += `<${tagItem.name} ${tagItem.value}>`;
            tagStack.push(tagItem.name);
        }
      });
            mlString += tags + item.text;
      item.tag.forEach((tagItem) => {
        if (tagItem.name !== '' && tagItem.value !== '') {
          const closingTag = `</${tagStack.pop()}>`;
          mlString += closingTag;
        }
      });
    }
  });

  mlString += '</speak>';
  console.log('nowwwww yesss', JSON.stringify(mlString))
  res.send({ mlString: mlString });
  
};





exports.TesteSsml = async (req, res) => {


  const { DefaultSSML, SSMLTags, selectedLanguage, selectedVoiceGender, id } = req.body;
  let insideTag = false;
  let MyNewSSML = DefaultSSML;



  try {
    // Find the quota document with matching id
    const quota = await Quota.findOne({ userid: id }); // Use QuotaID instead of id

    if (!quota) {
      // Return a 404 error if no matching quota is found
      console.log('Quota not found');
      return;
    }
    if (DefaultSSML.length + quota.quota_number >= quota.max_value && quota.quota_number < quota.max_value) {
      res.send({ message: 'this is a long config , you must recharge your account to be able configure your voice ' });

    }

    else if (quota.quota_number >= quota.max_value && quota.quota_type == 'premium') {
      res.send({ message: 'you must charge your account' });

    }

    else if (quota.quota_number >= quota.max_value && quota.quota_type == 'free') {
      res.send({ message: 'free mode is disabled now!! , please go premium' });

    }

    else {
      console.log('everything is OK..!')

      await Quota.updateOne({ userid: id }, { $inc: { quota_number: DefaultSSML.length } });

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
            if (SSMLTags[i].StartPos === position) {
              if (SSMLTags[i].tag === 'break') {
                openingTags = `<${SSMLTags[i].tag} ${SSMLTags[i].value}/>`;
              } else {
                openingTags = `<${SSMLTags[i].tag} ${SSMLTags[i].value}>`;
              }
              const X = MyNewSSML.slice(0, j);
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
            if (SSMLTags[i].EndPos === position) {

              if (SSMLTags[i].tag === 'break') {
                closingTags = ``;
              } else {
                closingTags = `</${SSMLTags[i].tag}>`;
              }
              const X = MyNewSSML.slice(0, j);
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
          languageCode: selectedLanguage, ssmlGender: selectedVoiceGender
        },
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
        res.send({ message: 'OK', url: `${IpAdress.IP}/audio`, SSML: MyNewSSML });
        return;
      } else {
        res.status(400).send({ message: 'Error: audio content not found' });
      }


    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }



  // Return the updated SSML
  // return res.status(200).json({ SSML: MyNewSSML });
}



