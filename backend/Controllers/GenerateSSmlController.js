/* eslint-disable prettier/prettier */
const fs = require('fs');
const { Buffer } = require('buffer');
const serveStatic = require('serve-static');
const Quota = require('../models/Quota');
const IpAdress = require('./IpAdress');
const cheerio = require('cheerio');
const path = require('path');

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

exports.SenToGoogle= async (req, res) => {
  const { DefaultSSML, selectedLanguage,selectedVoiceGender , id ,  DocId} = req.body;
    // Create the request object
         const request = {
           input: { ssml: DefaultSSML },
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
           const folderName1 ='U'+ id ; // replace with dynamic folder name
           const folderName2 ='D'+ DocId; // replace with dynamic folder name
 
           const audioPath = path.join('audios', folderName1,  folderName2);
         
           // create directory if it doesn't exist
           if (!fs.existsSync(audioPath)) {
             fs.mkdirSync(audioPath, { recursive: true });
           }
         
           // Write the decoded audio content to a new file
           fs.writeFile(path.join(audioPath, 'audio.mp3'), decodedAudioContent, (err) => {
             if (err) throw err;
             console.log('File created!');
           });
         
           // Send the response to the client with the file path 
           res.send({ message: 'OK!!!', url: `${IpAdress.IP}/audios/${folderName1}/${folderName2}/audio.mp3`, SSML: DefaultSSML });
           return;
         } else {
           res.status(400).send({ message: 'Error: audio content not found' });
         }
       
}
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
      res.status(200).json({message: 'you must charge your account'});

    }
    else if (quota.quota_number >= quota.max_value && quota.quota_type == 'free') {
      res.status(200).json({ message: 'free mode is disabled now!! , please go premium' });

    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};


exports.DisplayTags = async (req, res) => {
  const { DefaultSSML } = req.body;
  console.log('DefaultSSML', DefaultSSML)
  const results = [];
  const idMap = new Map();
  let idCounter = 1;

  const $ = cheerio.load(DefaultSSML, { xmlMode: true });



  function logElement(element, depth = 1) {
    const name = $(element)[0].name;
    const text = $(element).text().trim();
    const value = Object.entries($(element)[0].attribs).map(([name, value]) => `${name} = '${value}'`).join(' ');
    let id;

    if (idMap.has(text)) {
      id = idMap.get(text);
    } else {
      id = idCounter++;
      idMap.set(text, id);
    }

    // Handle <break> tags
    if (name === 'break') {
      const time = $(element).attr('time');
      results.push({ name, text, value: `time = '${time}'`, id });
    } else {
      results.push({ name, text, value, id });
    }

    $(element).children().each((index, childElement) => {
      logElement(childElement, depth + 1);
    });
  }

  $('speak').children().each((index, element) => {
    logElement(element);
  });

  console.log('results::: ', results);

  const result = [];

  results.forEach(item => {
    const existingItem = result.find(resultItem => resultItem.text === item.text);
    if (existingItem) {
      const existingTag = existingItem.tag.find(tagItem => tagItem.name === item.name);
      if (existingTag) {
        existingTag.value = item.value;
      } else {
        existingItem.tag.push({ name: item.name, value: item.value });
      }
    } else {
      let tagArr = [];
      if (item.name !== '') {
        tagArr.push({ name: item.name, value: item.value });
      }
      result.push({ text: item.text, tag: tagArr });
    }
  });

  console.log('newresult1 : ', JSON.stringify(result.map(item => ({ text: item.text, tag: item.tag.map(tagItem => ({ name: tagItem.name, value: tagItem.value })) })), null, 2));

  let mlString = '<speak>';

  result.forEach(item => {
    if (item.tag.length === 0) {
      mlString += item.text;
    } else {
      let tags = '';
      item.tag.forEach(tagItem => {
        if (tagItem.name !== '' && tagItem.value !== '') {
          tags += `<${tagItem.name} ${tagItem.value}>`;
        }
      });
      mlString += `${tags}${item.text}`;
            tags.split('').reverse().join('').slice(2).split('').reverse().join('');
      item.tag.forEach(tagItem => {
        if (tagItem.name !== '' && tagItem.value !== '') {
          mlString += `</${tagItem.name}>`;
        }
      });
    }
  });

  mlString += '</speak>';
  console.log('mlString : ', mlString);

  res.send({ SSMLArr: results, mlString: mlString, newresult1: result });
};



exports.UpdateTags = async (req, res) => {
  const { tabData, id, DocId, selectedLanguage, selectedVoiceGender } = req.body;
  let mlString = '<speak>';
  let tagStack = [];

  tabData.forEach((item) => {

    if (item.tag.length === 0 || (item.tag.length === 1 && item.tag[0].name === '' && item.tag[0].value === '')) {
      mlString += item.text;
    } else {
      let tags = '';
      item.tag.forEach((tagItem) => {
        if (tagItem.name !== '' && tagItem.value !== '') {
          if (tagItem.name == 'break') { tags += `<${tagItem.name} ${tagItem.value} />` }
          else {
            tags += `<${tagItem.name} ${tagItem.value}>`;
        }
              tagStack.push(tagItem.name);
        }

      });
              mlString += tags + item.text;
      item.tag.forEach((tagItem) => {
        if (tagItem.name !== '' && tagItem.value !== '') {
          if (tagItem.name !== 'break') {
            const closingTag = `</${tagStack.pop()}>`
              mlString += closingTag;

          }


        }
      });
    }
  });

  mlString += '</speak>';

  /* **** */
  try {
    // Find the quota document with matching id
    const quota = await Quota.findOne({ userid: id }); // Use QuotaID instead of id
    console.log('id : ', id)
    if (!quota) {
      // Return a 404 error if no matching quota is found
      console.log('Quota not found');
      return;
    }
    if (mlString.length + quota.quota_number >= quota.max_value && quota.quota_number < quota.max_value) {
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

      await Quota.updateOne({ userid: id }, { $inc: { quota_number: mlString.length } });
      const request = {
        input: { ssml: mlString },
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
        const folderName1 = 'U' + id; // replace with dynamic folder name
        const folderName2 = 'D' + DocId; // replace with dynamic folder name
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 8);
        const audioFileName = `audio_${timestamp}_${randomString}.mp3`;


        // const audioPath = path.join('audios', folderName1, folderName2);
        const audioPath = path.join(__dirname, '..', 'audios', folderName1, folderName2).replace(/\//g, '\\');

        // Check if audio directory exists and has write permission
        fs.access(audioPath, fs.constants.F_OK | fs.constants.W_OK, (err) => {
          if (err) {
            console.log('Error accessing audio directory:', err);
          } else {
            console.log('Audio directory exists and has write permission', audioPath);
          }
        });

        // create directory if it doesn't exist
        if (!fs.existsSync(audioPath)) {
          fs.mkdirSync(audioPath, { recursive: true });
        }

        // Write the decoded audio content to a new file
        fs.writeFile(path.join(audioPath, audioFileName), decodedAudioContent, (err) => {
          if (err) throw err;
          console.log('File created!');
        });

        // Send the response to the client with the file path
        res.send({
          mlString: mlString, message: 'OK!!!', url: `${IpAdress.IP} / audios / ${folderName1} / ${folderName2} / ${audioFileName}`, SSML: mlString });
    } else {
      res.status(400).send({ message: 'Error: audio content not found' });
    }

  }
  
  
  } catch (error) {
  console.error(error);
  res.status(500).send('Internal server error');
}

  /* *** */



  //res.send({ mlString: mlString });
};





exports.TesteSsml = async (req, res) => {


  const {SSMLTags ,DefaultSSML, selectedLanguage, selectedVoiceGender, id, DocId } = req.body;
  let insideTag = false;
  let MyNewSSML = DefaultSSML;



  try {
    // Find the quota document with matching id
    const quota = await Quota.findOne({ userid: id }); // Use QuotaID instead of id
    console.log('id : ', id)
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
      let NewArr = [];

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
                openingTags = `<${SSMLTags[i].tag} ${SSMLTags[i].value} />`;
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
      const tags = extractTags(MyNewSSML);
      console.log('tags: ', tags);
      //check if tags are valid 
      NewArr = extractTagValues(tags);
      console.log('result11: ', NewArr);
      const check = checkTags(NewArr)
      console.log(checkTags(check));

      // true
      if (check == 'ok') {
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
          const folderName1 = 'U' + id; // replace with dynamic folder name
          const folderName2 = 'D' + DocId; // replace with dynamic folder name
          const timestamp = new Date().getTime();
          const randomString = Math.random().toString(36).substring(2, 8);
          const audioFileName = `audio_${timestamp}_${randomString}.mp3`;


          // const audioPath = path.join('audios', folderName1, folderName2);
          const audioPath = path.join(__dirname, '..', 'audios', folderName1, folderName2).replace(/\//g, '\\');

          // Check if audio directory exists and has write permission
          fs.access(audioPath, fs.constants.F_OK | fs.constants.W_OK, (err) => {
            if (err) {
              console.log('Error accessing audio directory:', err);
            } else {
              console.log('Audio directory exists and has write permission', audioPath);
            }
          });

          // create directory if it doesn't exist
          if (!fs.existsSync(audioPath)) {
            fs.mkdirSync(audioPath, { recursive: true });
          }

          // Write the decoded audio content to a new file
          fs.writeFile(path.join(audioPath, audioFileName), decodedAudioContent, (err) => {
            if (err) throw err;
            console.log('File created!');
          });

          // Send the response to the client with the file path
          res.send({
            message: 'OK!!!', url: `${IpAdress.IP} / audios / ${folderName1} / ${folderName2} / ${audioFileName}`, SSML: MyNewSSML });
      } else {
        res.status(400).send({ message: 'Error: audio content not found' });
      }
    }
      else {
      res.send({ message: 'not ok' });

    }
  }
  
  } catch (error) {
  console.error(error);
  res.status(500).send('Internal server error');
}



  // Return the updated SSML
 // return res.status(200).json({ SSML: MyNewSSML });
}


function extractTags(ssml) {
  const tagRegex = /<([^>]+)(?:\s+[^>]+)*>/g;
  const tags = [];
  let match;

  while ((match = tagRegex.exec(ssml))) {
    tags.push(match[1]);
  }

  return tags;
}

function extractTagValues(tags) {
  const result = [];

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    let tagname = '';
    let tagvalue = '';
    let tagVOFvalue = '';

    // extract the tag name
    const spaceIndex = tag.indexOf(' ');
    if (spaceIndex !== -1) {
      tagname = tag.slice(0, spaceIndex);
      const attributesString = tag.slice(spaceIndex + 1, -1);
      console.log("attributesString", attributesString);
      // extract the tag attributes
      const attributes = attributesString.split('" ');
      console.log("attributes", attributes);

      for (let j = 0; j < attributes.length; j++) {
        const attribute = attributes[j];
        const equalsIndex = attribute.indexOf('=');
        const name = attribute.slice(0, equalsIndex);
        const value = attribute.slice(equalsIndex + 2);
        console.log("attribute1111", attribute);
        console.log("equalsIndex", equalsIndex);
        console.log("name", name);
        console.log("value", value);

        tagvalue = name;
        tagVOFvalue = value;
      }
    } else {
      tagname = tag;
    }

    // add the result to the array
    result.push({
      tagname,
      tagvalue,
      tagVOFvalue
    });
  }

  return result;
}

function checkTags(tags) {
  const openTags = new Set();
  for (let i = 0; i < tags.length; i++) {
    const currentTag = tags[i];
    if (currentTag.tagvalue && currentTag.tagvalue !== '' && currentTag.tagname !== 'break') {
      if (currentTag.tagname[0] === '/') { // closing tag
        openTags.delete(currentTag.tagname.substring(1)); // remove matching opening tag from set
      } else { // opening tag
        openTags.add(currentTag.tagname);
      }
    }
    if (openTags.has(currentTag.tagname) && currentTag.tagvalue && currentTag.tagvalue !== '') {
      // check if current tag is a nested tag with same name and value as its parent
      for (let j = i + 1; j < tags.length; j++) {
        const nestedTag = tags[j];
        if (nestedTag.tagname === currentTag.tagname && nestedTag.tagvalue === currentTag.tagvalue) {
          return 'this is an invalid config pleas reconfig your voice and make sure that you dont have 2 confige inside each other ';
        }
        if (nestedTag.tagname === `/${currentTag.tagname}`) { 
          break;
      }
    }
  }
}
return 'ok';
}
