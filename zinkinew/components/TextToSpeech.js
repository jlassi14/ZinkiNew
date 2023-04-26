import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, SafeAreaView, ScrollView, } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextInput, Button, Menu, Divider, Provider, Card, IconButton } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import Soundplayer from './Soundplayer';
import { Picker } from '@react-native-picker/picker';
import SQLite from 'react-native-sqlite-storage';
import iso6391 from 'iso-639-1'


const TextToSpeech = () => {


    const [dbOpened, setDbOpened] = useState(false);
    var [defaultSSMLFromDB, setDefaultSSMLFromDB] = useState("");
    var [textFromDB, settextFromDB] = useState("");
    var [urlFromDB, seturlFromDB] = useState("");
    const [url, setUrl] = useState(null);
    const TTS_API_KEY = 'AIzaSyBpKakDqYNOO4jegJsZ5X5Md-0NBLezJU0';
    const TTS_LANGUAGES_API_URL = `https://texttospeech.googleapis.com/v1beta1/voices?key=${TTS_API_KEY}`;


    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [lastSelection, setLastSelection] = useState({ start: 0, end: 0, selectedText: '' });
    const showNavBar = selection.start !== selection.end;
    const showAppBar = selection.start == selection.end;
    //const showListenButton = selection.start !== selection.end;
    const [selectedLanguage, setSelectedLanguage] = useState('Choose option');
    const [selectedVoiceGender, setSelectedVoiceGender] = useState('Choose option');
    const [languages, setLanguages] = useState([]);
    const [inputFocused, setInputFocused] = useState(false);
    const [SSMLTags, setSSMLTags] = useState([]);
    const [text, setText] = useState('');
    // const [DefaultSSML, SetDefaultSSML] = useState("<speak>To be or not to be that is the q.s </speak>");
    const [visible, setVisible] = React.useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);










    const [modalBreakVisible, setModalBreakVisible] = useState(false);
    const [modalPitchVisible, setModalPitchVisible] = useState(false);
    const [modalRateVisible, setModalRateVisible] = useState(false);
    const [modalVolumeVisible, setModalVolumeVisible] = useState(false);
    const [modalParaVisible, setModalParaVisible] = useState(false);
    const [modalSentenceVisible, setModalSentenceVisible] = useState(false);
    const [modalSpellVisible, setModalSpellVisible] = useState(false);
    const [modalEmphasisVisible, setModalEmphasisVisible] = useState(false);
    const [modalAbbVisible, setModalAbbVisible] = useState(false);
    const [modalOrdinalVisible, setModalOrdinalVisible] = useState(false);
    const [modalCardinalVisible, setModalCardinalVisible] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);













    const [breakInfo, setBreakInfo] = useState({ tag: 'break', value: 1, StartPos: selection.start, EndPos: selection.end });
    const [pitchInfo, setPitchInfo] = useState({ tag: 'prosody', value: 'x-low', StartPos: lastSelection.start, EndPos: lastSelection.end });
    const [rateInfo, setRateInfo] = useState({ tag: 'prosody', value: 'x-slow', StartPos: lastSelection.start, EndPos: lastSelection.end });
    const [volumeInfo, setVolumeInfo] = useState({ tag: 'prosody', value: 'silent', StartPos: lastSelection.start, EndPos: lastSelection.end });
    const [paraInfo, setParaInfo] = useState({ tag: 'p', value: '', StartPos: lastSelection.start, EndPos: lastSelection.end });
    const [sentenceInfo, setSentenceInfo] = useState({ tag: 's', value: '', StartPos: lastSelection.start, EndPos: lastSelection.end });
    const [spellInfo, setSpellInfo] = useState({ tag: 'say-as', value: 'interpret-as=\'verbatim\'', StartPos: lastSelection.start, EndPos: lastSelection.end });
    const [emphasisInfo, setEmphasisInfo] = useState({ tag: 'emphasis', value: 'none', StartPos: lastSelection.start, EndPos: lastSelection.end });
    const [abbInfo, setAbbInfo] = useState({ tag: 'sub ', value: '', StartPos: lastSelection.start, EndPos: lastSelection.end });
    const [ordinalInfo, setOrdinalInfo] = useState({ tag: 'say-as', value: 'interpret-as=\'ordinal\'', StartPos: lastSelection.start, EndPos: lastSelection.end });
    const [cardinalInfo, setCardinalInfo] = useState({ tag: 'say-as', value: 'interpret-as=\'cardinal\'', StartPos: lastSelection.start, EndPos: lastSelection.end });
    const [inputValue, setInputValue] = useState('');




    const resetCurrentChanges = () => {
        if (SSMLTags.length > 0) {
            setSSMLTags([]);
        }
        setShowDiscardModal(false);
    };

    const handleLayout = event => {
        const { width, height } = event.nativeEvent.layout;
        // do something with width and height
    }
    const resetDefaultSSML = async () => {

        const db = SQLite.openDatabase({ name: 'ZinkiDB', location: 'default' });
        console.log('Old DefaultSSML', defaultSSMLFromDB);
        // Define the default SSML value
        const newDefaultSSML = `<speak>${textFromDB} </speak>`;

        try {
            const response = await fetch('http://192.168.1.16:3000/GenerateSSML/ResetAll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newDefaultSSML, selectedLanguage, selectedVoiceGender })

            });
            const responseData = await response.json();
            // Do something with the response data
            console.log('responseData', responseData);
            if (response.ok) {
                console.log('Configs sent to server');
                setUrl(responseData.url); // Set the url state with the responseData.url value
                // Execute an SQL query to update the DefaultSSML and Url fields of the DOCS table
                db.transaction(tx => {
                    tx.executeSql(
                        'UPDATE DOCS SET DefaultSSML = ?, Url = ? WHERE id = ? AND UserId = ?',
                        [newDefaultSSML, '', 4, 33], // Replace with the actual values of id and UserId, and set the Url to an empty string
                        (tx, result) => {
                            console.log('DefaultSSML updated successfully', newDefaultSSML);
                        },
                        error => {
                            console.log('Error updating DefaultSSML:', error);
                        }
                    );
                });
            } else {
                console.log('Error sending configs to server');
            }
        } catch (error) {
            console.log('Error sending configs to server:', error.message);
        }
        setShowResetModal(false);
    };



    const onLanguageChange = (value) => {
        setSelectedLanguage(value);
    };

    const onVoiceGenderChange = (value) => {
        setSelectedVoiceGender(value);

    };

    useEffect(() => {
        fetch(TTS_LANGUAGES_API_URL)
            .then(response => response.json())
            .then(data => {
                const languageCodesSet = new Set();
                const languageLabelMap = new Map(); // map object to store unique labels
                data.voices
                    .filter(voice => voice.languageCodes.length > 0 && iso6391.getName(voice.languageCodes[0].split('-')[0]) !== "")
                    .forEach(({ languageCodes }) => {
                        languageCodes.forEach(code => {
                            if (!languageCodesSet.has(code)) {
                                languageCodesSet.add(code);
                                const label = iso6391.getName(code.split('-')[0]);
                                if (!languageLabelMap.has(label)) { // store the first occurrence of the label
                                    languageLabelMap.set(label, { label, value: code });
                                }
                            }
                        });
                    });
                const availableLanguages = Array.from(languageLabelMap.values()).sort((a, b) => a.label.localeCompare(b.label)); // extract the values of the map object as an array
                setLanguages(availableLanguages);
            })
            .catch(error => console.error(error));
    }, []);
    console.log('labellllllllllllllllllllllllllllllll', languages);
    console.log('selected langugeeeeeeeeee', selectedLanguage);
    console.log('voice genderrrrrrrrr', selectedVoiceGender);





    const getLanguagesBySelectedVoiceGender = (selectedGender) => {
        return languages.filter(language => language.gender === selectedGender || selectedGender === 'Choose option');
    };
    const filteredLanguages = getLanguagesBySelectedVoiceGender(selectedVoiceGender);
    const handleSelectionChange = (event) => {
        const { start, end } = event.nativeEvent.selection;
        if (start !== end) {
            setLastSelection({ start, end });
            const selectedText = textFromDB.substring(start, end);
            setLastSelection({ start, end, selectedText });
        }

        setSelection({ start, end });
    };

    const onSliderValueChange = (value) => {
        setBreakInfo({ ...breakInfo, value });
    };

    const onBreakSubmit = useCallback(() => {
        if (breakInfo.value > 0) {
            const updatedBreakInfo = {
                ...breakInfo, StartPos: selection.start, EndPos: selection.end, value: `time= '${breakInfo.value}s'`
            };
            const newSSMLTags = [...SSMLTags, updatedBreakInfo];
            setSSMLTags(newSSMLTags);
        }
        setBreakInfo({ tag: 'break', value: 1, StartPos: 0, EndPos: 0 });
        setModalBreakVisible(false);
        console.log('Break duration:', breakInfo.value);
        console.log('Break start:', selection.start);
        console.log('Break end:', selection.end);
        console.log('Config tag:', breakInfo.tag);
        console.log('SSMLTags tab:', SSMLTags);
    }, [breakInfo, selection, SSMLTags]);

    const onPitchSubmit = useCallback(() => {
        if (pitchInfo.value === 'low' || pitchInfo.value === 'x-low' || pitchInfo.value === 'medium' || pitchInfo.value === 'high' || pitchInfo.value === 'x-high') {
            const updatedPitchInfo = {
                ...pitchInfo, StartPos: lastSelection.start, EndPos: lastSelection.end, value: `pitch= '${pitchInfo.value}'`
            };
            const newSSMLTags = [...SSMLTags, updatedPitchInfo];
            setSSMLTags(newSSMLTags);
        }
        setPitchInfo({ tag: 'prosody', value: 'x-low', StartPos: 0, EndPos: 0 });
        setModalPitchVisible(false);
    }, [pitchInfo, lastSelection, SSMLTags]);

    const onRateSubmit = useCallback(() => {
        if (rateInfo.value === 'slow' || rateInfo.value === 'x-slow' || rateInfo.value === 'medium' || rateInfo.value === 'fast' || rateInfo.value === 'x-fast') {
            const updatedRateInfo = {
                ...rateInfo, StartPos: lastSelection.start, EndPos: lastSelection.end, value: `rate= '${rateInfo.value}'`
            };
            const newSSMLTags = [...SSMLTags, updatedRateInfo];
            setSSMLTags(newSSMLTags);
        }
        setRateInfo({ tag: 'prosody', value: 'x-slow', StartPos: 0, EndPos: 0 });
        setModalRateVisible(false);
    }, [rateInfo, lastSelection, SSMLTags]);

    const onVolumeSubmit = useCallback(() => {
        if (volumeInfo.value === 'silent' || volumeInfo.value === 'x-soft' || volumeInfo.value === 'soft' || volumeInfo.value === 'medium' || volumeInfo.value === 'loud' || volumeInfo.value === 'x-loud') {
            const updatedVolumeInfo = {
                ...volumeInfo, StartPos: lastSelection.start, EndPos: lastSelection.end, value: `volume= '${volumeInfo.value}'`
            };
            const newSSMLTags = [...SSMLTags, updatedVolumeInfo];
            setSSMLTags(newSSMLTags);
        }
        setVolumeInfo({ tag: 'prosody', value: 'silent', StartPos: 0, EndPos: 0 });
        setModalVolumeVisible(false);
    }, [volumeInfo, lastSelection, SSMLTags]);

    const onSentenceSubmit = useCallback(() => {

        const updatedSentenceInfo = {
            ...sentenceInfo, StartPos: lastSelection.start, EndPos: lastSelection.end
        };
        const newSSMLTags = [...SSMLTags, updatedSentenceInfo];
        setSSMLTags(newSSMLTags);

        setSentenceInfo({ tag: 's', value: '', StartPos: 0, EndPos: 0 });
        setModalSentenceVisible(false);
    }, [sentenceInfo, lastSelection, SSMLTags]);

    const onParaSubmit = useCallback(() => {

        const updatedParaInfo = {
            ...paraInfo, StartPos: lastSelection.start, EndPos: lastSelection.end
        };
        const newSSMLTags = [...SSMLTags, updatedParaInfo];
        setSSMLTags(newSSMLTags);

        setParaInfo({ tag: 'p', value: '', StartPos: 0, EndPos: 0 });
        setModalParaVisible(false);
    }, [paraInfo, lastSelection, SSMLTags]);

    const onSpellSubmit = useCallback(() => {

        const updatedSpellInfo = {
            ...spellInfo, StartPos: lastSelection.start, EndPos: lastSelection.end
        };
        const newSSMLTags = [...SSMLTags, updatedSpellInfo];
        setSSMLTags(newSSMLTags);

        setSpellInfo({ tag: 'say-as', value: 'interpret-as=\'verbatim\'', StartPos: 0, EndPos: 0 });
        setModalSpellVisible(false);
    }, [spellInfo, lastSelection, SSMLTags]);

    const onEmphasisSubmit = useCallback(() => {
        if (emphasisInfo.value === 'none' || emphasisInfo.value === 'reduced' || emphasisInfo.value === 'moderate' || emphasisInfo.value === 'strong') {
            const updatedEmphasisInfo = {
                ...emphasisInfo, StartPos: lastSelection.start, EndPos: lastSelection.end, value: `level='${emphasisInfo.value}'`
            };
            const newSSMLTags = [...SSMLTags, updatedEmphasisInfo];
            setSSMLTags(newSSMLTags);
        }
        setEmphasisInfo({ tag: 'emphasis', value: 'none', StartPos: 0, EndPos: 0 });
        setModalEmphasisVisible(false);
    }, [emphasisInfo, lastSelection, SSMLTags]);

    const onOrdinalSubmit = useCallback(() => {
        const selectedText = textFromDB.substring(lastSelection.start, lastSelection.end);
        const isNumber = isNaN(selectedText) === false;
        if (isNumber) {

            const updatedOrdinalInfo = {
                ...ordinalInfo, StartPos: lastSelection.start, EndPos: lastSelection.end
            };
            const newSSMLTags = [...SSMLTags, updatedOrdinalInfo];
            setSSMLTags(newSSMLTags);
        }
        setOrdinalInfo({ tag: 'say-as', value: 'interpret-as=\'ordinal\'', StartPos: 0, EndPos: 0 });
        setModalOrdinalVisible(false);
    }, [ordinalInfo, lastSelection, SSMLTags,]);

    const onCardinalSubmit = useCallback(() => {
        const selectedText = textFromDB.substring(lastSelection.start, lastSelection.end);
        const isNumber = isNaN(selectedText) === false;
        if (isNumber) {

            const updateCardinalInfo = {
                ...cardinalInfo, StartPos: lastSelection.start, EndPos: lastSelection.end
            };
            const newSSMLTags = [...SSMLTags, updateCardinalInfo];
            setSSMLTags(newSSMLTags);
        }
        setCardinalInfo({ tag: 'say-as', value: 'interpret-as=\'cardinal\'', StartPos: 0, EndPos: 0 });
        setModalCardinalVisible(false);
    }, [cardinalInfo, lastSelection, SSMLTags]);

    const onAbbSubmit = useCallback((inputval) => {
        console.log('inpuuuut', inputValue)
        const updatedAbbInfo = {
            ...abbInfo, value: `alias='${inputValue}'`, StartPos: lastSelection.start, EndPos: lastSelection.end
        };
        const newSSMLTags = [...SSMLTags, updatedAbbInfo];
        setSSMLTags(newSSMLTags);

        setAbbInfo({ tag: 'sub', value: '', StartPos: 0, EndPos: 0 });
        setModalAbbVisible(false);


    }, [abbInfo, lastSelection, SSMLTags, inputValue]);
    const cancelAbb = () => {
        setModalAbbVisible(false);

    };



    const onRateSetAsDefault = useCallback(() => {
        const updatedRateInfo = {
            ...rateInfo, StartPos: lastSelection.start, EndPos: lastSelection.end, value: `rate= 'default'`
        };
        const newSSMLTags = [...SSMLTags, updatedRateInfo];
        setSSMLTags(newSSMLTags);
        setRateInfo({ tag: 'prosody', value: 'default', StartPos: 0, EndPos: 0 });
        setModalRateVisible(false);
    }, [rateInfo, lastSelection, SSMLTags]);

    const onPitchSetAsDefault = useCallback(() => {
        const updatedPitchInfo = {
            ...pitchInfo, StartPos: lastSelection.start, EndPos: lastSelection.end, value: `pitch= 'default'`
        };
        const newSSMLTags = [...SSMLTags, updatedPitchInfo];
        setSSMLTags(newSSMLTags);
        setPitchInfo({ tag: 'prosody', value: 'default', StartPos: 0, EndPos: 0 });
        setModalPitchVisible(false);
    }, [pitchInfo, selection, SSMLTags]);

    const onVolumeSetAsDefault = useCallback(() => {
        const updatedVolumeInfo = {
            ...volumeInfo, StartPos: lastSelection.start, EndPos: lastSelection.end, value: `volume= 'default'`
        };
        const newSSMLTags = [...SSMLTags, updatedVolumeInfo];
        setSSMLTags(newSSMLTags);
        setVolumeInfo({ tag: 'prosody', value: 'silent', StartPos: 0, EndPos: 0 });
        setModalVolumeVisible(false);
    }, [volumeInfo, selection, SSMLTags]);

    const onEmphasisSetAsDefault = useCallback(() => {
        const updatedEmphasisInfo = {
            ...emphasisInfo, StartPos: lastSelection.start, EndPos: lastSelection.end, value: `level= 'moderate'`
        };
        const newSSMLTags = [...SSMLTags, updatedEmphasisInfo];
        setSSMLTags(newSSMLTags);
        setEmphasisInfo({ tag: 'emphasis', value: 'moderate', StartPos: 0, EndPos: 0 });
        setModalEmphasisVisible(false);
    }, [emphasisInfo, selection, SSMLTags]);


    useEffect(() => {
        const createTableSql = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    tel TEXT,
    password TEXT
  );
`;

        const createDocsTableSql = `
CREATE TABLE IF NOT EXISTS DOCS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  Text TEXT,
  Type TEXT,
  DefaultSSMl TEXT,
  UserId INTEGER,
  Url TEXT,
  FOREIGN KEY (UserId) REFERENCES users(id)
);
`;


        const insertUserSql = `
  INSERT INTO users (name, email, tel, password)
  VALUES (?, ?, ?, ?);
`;

        const insertDocsSql = `
  INSERT INTO DOCS (Text, Type, DefaultSSMl, UserId, Url)
  VALUES (?, ?, ?, ?, ?);
`;



        // Open the database
        // Open the database
        const db = SQLite.openDatabase({ name: 'ZinkiDB', location: 'default' });

        /*
        
                // Execute a DELETE query on users
        db.transaction((tx) => {
            tx.executeSql(
              'DELETE FROM users WHERE id IN (?, ?)',
            [26, 27],
              (tx, result) => {
                console.log('Data deleted successfully');
              },
              (error) => {
                console.log('Error executing SQL statement:', error);
              }
            );
          });
        
          // Execute a DELETE query on Docs
        db.transaction((tx) => {
            tx.executeSql(
              'DELETE FROM Docs ',
            [],
              (tx, result) => {
                console.log('Data deleted successfully');
              },
              (error) => {
                console.log('Error executing SQL statement:', error);
              }
            );
          });*/


        // Execute a SELECT query on users
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM users WHERE id = ?',
                [4],
                (tx, results) => {
                    const users = results.rows.raw();
                    console.log('Users:', users);
                },
                (error) => {
                    console.log('Error executing SQL statement:', error);
                }
            );
        });

        // Execute a SELECT query on Docs
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM DOCS WHERE id = ? AND UserId = ?',
                [15, 33],
                (tx, results) => {
                    const users = results.rows.raw();
                    console.log('Docs:', users);
                    const defaultSSML = results.rows.raw()[0]?.DefaultSSMl ?? "";
                    const Text = results.rows.raw()[0]?.Text ?? "";
                    const Url = results.rows.raw()[0]?.Url ?? "";

                    setDefaultSSMLFromDB(defaultSSML);
                    settextFromDB(Text);
                    console.log('=================defaultSSMLFromDB===================');
                    console.log(defaultSSMLFromDB);
                    console.log('=================defaultSSMLFromDB===================');

                    console.log('=================textFromDB===================');
                    console.log(textFromDB);
                    console.log('=================textFromDB===================');
                    seturlFromDB(Url);

                    console.log('=================textFromDB===================');
                    console.log(textFromDB);
                    console.log('=================urlFromDB===================');
                    console.log(urlFromDB);

                },
                (error) => {
                    console.log('Error executing Docs SQL statement:', error);
                }
            );
        });

        // Create the "users" table if it doesn't already exist
        db.transaction((tx) => {
            tx.executeSql(createTableSql, [], (_, result) => {
                console.log('Table created successfully');
            }, (_, error) => {
                console.log('Error creating table:', error);
            });
        });

        // Create the "Docs" table if it doesn't already exist

        db.transaction((tx) => {
            tx.executeSql(createDocsTableSql, [], (_, result) => {
                console.log('Table Docs created successfully');
            }, (_, error) => {
                console.log('Error creating Docs table:', error);
            });
        });

        // Insert a new user into the "users" table

        /* db.transaction((tx) => {
              tx.executeSql(insertUserSql, ['Omar Jlassi', 'Omar.Jlassi@gmail.com', '92131827', 'azerty123'], (_, result) => {
                  console.log('User inserted successfully');
                  const lastInsertId = result.insertId;
                  //console.log('User inserted successfully with ID ','${ lastInsertId });
  
                  fetch('http://192.168.0.133:3000/GenerateSSML/Quota', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ userId: "789", Quota_Type: "premium", })
                  })
                      .then(response => {
                          if (!response.ok) {
                              throw new Error('Network response was not ok');
                          }
                          return response.text();
                      })
                      .then(text => {
                          console.log('text', text); // log the raw response data
                          try {
                              const data = JSON.parse(text); // try to parse the response as JSON
                              console.log(data); // handle response data from backend
                          } catch (err) {
                              console.error('Error parsing response:', err);
                              // handle the error here, e.g. show an error message to the user
                          }
                      })
                      .catch(error => {
                          console.error('There was a problem with the fetch operation:', error);
                          // handle the error here, e.g. show an error message to the user
                      });
              }, (_, error) => {
                  console.log('Error inserting user:', error);
              });
          });
  
          // Insert a new docs into the "Docs" table
  
  
          db.transaction((tx) => {
              tx.executeSql(insertDocsSql, ['3 مرحبا بكم في زنكي', 'image', '<speak>3 مرحبا بكم في زنكي </speak>', '33', 'http://192.168.0.133:3000/audio'], (_, result) => {
                  console.log('User inserted successfully');
              }, (_, error) => {
                  console.log('Error inserting Docs:', error);
              });
          });
  
          console.log('SSMLTags tab:', SSMLTags); 
  
  */

    }, [SSMLTags, defaultSSMLFromDB, textFromDB, urlFromDB]);

    useEffect(() => {
        console.log('input  vaalll:', inputValue);
    }, [inputValue]);



    const applyChanges = async () => {
        console.log('texttttttt', lastSelection.selectedText)
        try {
            const response = await fetch('http://192.168.1.16:3000/GenerateSSML/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({ DefaultSSML: defaultSSMLFromDB, SSMLTags, selectedLanguage, selectedVoiceGender })

            }); console.log('selected langugeeeeeeeeee', selectedLanguage);
            console.log('voice genderrrrrrrrr', selectedVoiceGender);

            const responseData = await response.json();
            // Do something with the response data
            console.log('responseData', responseData);

            if (response.ok) {
                console.log('Configs sent to server');
                setUrl(responseData.url); // Set the url state with the responseData.url value


                // Update the DefaultSSML in the database with the new value
                const db = SQLite.openDatabase({ name: 'ZinkiDB', location: 'default' });
                db.transaction((tx) => {
                    tx.executeSql(
                        'UPDATE DOCS SET DefaultSSMl = ? , Url = ? WHERE id = ? AND UserId = ?',
                        [responseData.SSML, responseData.url, 41, 33], // Replace with the actual values of id and UserId
                        (tx, result) => {
                            console.log('DefaultSSML updated successfully');
                        },
                        (error) => {
                            console.log('Error updating DefaultSSML:', error);
                        }
                    );
                });


                setSSMLTags([]);
            } else {
                console.log('Error sending configs to server');
            }
        } catch (error) {
            console.log('Error sending configs to server:', error.message);
        }
    };

    console.log(text)
    console.log(selection.start, selection.end)
    console.log(' selection end:', selection.end);
    console.log(' selection start:', selection.start);

    console.log(' last selection end :', lastSelection.end);
    console.log(' last selection start :', lastSelection.start);

    const handleMenuClick = (menuIndex) => {
        if (activeMenu === menuIndex) {
            setActiveMenu(null);
        } else {
            setActiveMenu(menuIndex);
        }
    };



    const renderSubMenu = (menuIndex) => {
        if (activeMenu === 0) {
            return (
                <View style={[styles.subMenu, { left: 1, zIndex: 20 }]}>
                    <View style={styles.subMenuHeader}>
                        <Icon name="reader-outline" size={24} color="#2B3270" />
                        <Text style={styles.subMenuHeaderText}>Text Structur</Text>
                    </View>
                    <View style={styles.subMenuContent}>
                        <TouchableOpacity style={styles.subMenuItem} onPress={() => { setModalParaVisible(true); setActiveMenu(-1); }}>
                            <Text style={styles.subMenuItemText}>Paragraph </Text>
                            <Icon name="reorder-three-outline" size={24} color="#2B3270" />

                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subMenuItem} onPress={() => { setModalSentenceVisible(true); setActiveMenu(-1); }}>
                            <Text style={styles.subMenuItemText}>Sentence </Text>
                            <Icon name="code-working-outline" size={24} color="#2B3270" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleMenuClick(0)}>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name="chevron-up-outline" size={24} color="#2B3270" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
        else if (activeMenu === 1) {

            return (

                <View style={[styles.subMenu, { left: 90, }]}>
                    <View style={styles.subMenuHeader}>
                        <Icon name="radio-outline" size={24} color="#2B3270" />
                        <Text style={styles.subMenuHeaderText}>Voice</Text>
                    </View>
                    <View style={styles.subMenuContent}>

                        <TouchableOpacity style={styles.subMenuItem} onPress={() => { setModalVolumeVisible(true); setActiveMenu(-1); }}>
                            <Text style={styles.subMenuItemText}>Volume</Text>
                            <Icon name="volume-medium-outline" size={24} color="#2B3270" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subMenuItem} onPress={() => { setModalRateVisible(true); setActiveMenu(-1); }}>
                            <Text style={styles.subMenuItemText}>Speed</Text>
                            <Icon name="speedometer-outline" size={24} color="#2B3270" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subMenuItem} onPress={() => { setModalPitchVisible(true); setActiveMenu(-1); }}>
                            <Text style={styles.subMenuItemText}>Tone</Text>
                            <Icon name="stats-chart-outline" size={24} color="#2B3270" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subMenuItem} onPress={() => { setModalEmphasisVisible(true); setActiveMenu(-1); }}>
                            <Text style={styles.subMenuItemText}>Emphasis</Text>
                            <Icon name="ear-outline" size={24} color="#2B3270" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleMenuClick(1)}>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name="chevron-up-outline" size={24} color="#2B3270" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );

        }
        else if (activeMenu === 2) {

            return (

                <View style={[styles.subMenu, { left: 180, zIndex: 20 }]}>
                    <View style={styles.subMenuHeader}>
                        <Icon name="ear-outline" size={24} color="#2B3270" />
                        <Text style={styles.subMenuHeaderText}>Pronounciation</Text>
                    </View>
                    <View style={styles.subMenuContent}>
                        <TouchableOpacity style={styles.subMenuItem}>
                            <Text style={styles.subMenuItemText} onPress={() => { setModalAbbVisible(true); setActiveMenu(-1); }}>Abbreviation</Text>
                            <Icon name="ios-text-outline" size={24} color="#2B3270" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subMenuItem} onPress={() => { setModalSpellVisible(true); setActiveMenu(-1); }}>
                            <Text style={styles.subMenuItemText}>Spell Out</Text>
                            <Icon name="md-chatbubble-ellipses-outline" size={24} color="#2B3270" />
                        </TouchableOpacity>
                        {/*<TouchableOpacity style={styles.subMenuItem}>
                                <Text style={styles.subMenuItemText}>Date</Text>
                                <Icon name="ios-calendar-outline" size={24} color="#2B3270" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.subMenuItem}>
                                <Text style={styles.subMenuItemText}>Time</Text>
                                <Icon name="ios-time-outline" size={24} color="#2B3270" />
                            </TouchableOpacity>*/}
                        <TouchableOpacity style={styles.subMenuItem} onPress={() => { setModalCardinalVisible(true); setActiveMenu(-1); }}>
                            <Text style={styles.subMenuItemText}>Cardinal number</Text>
                            <Icon name="stats-chart-outline" size={24} color="#2B3270" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.subMenuItem} onPress={() => { setModalOrdinalVisible(true); setActiveMenu(-1); }}>
                            <Text style={styles.subMenuItemText}>Ordinal number</Text>
                            <Icon name="build-outline" size={24} color="#2B3270" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleMenuClick(2)}>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name="chevron-up-outline" size={24} color="#2B3270" />
                            </View>
                        </TouchableOpacity>
                    </View>


                </View>

            );

        }
        return null;
    };

    return (
        <Provider>
            <SafeAreaView>
                <View style={styles.container}>


                    <View style={showAppBar ? styles.dropsContainer : styles.hidden}>
                        <View style={styles.pickerContainer}>
                            <View style={styles.dropdownContainer}>


                                <Picker
                                    dropdownIconRippleColor="#6CA4FC"
                                    dropdownIconColor="#2B3270"
                                    mode='dropdown'
                                    placeholder={{ label: 'Language', value: null }}
                                    style={styles.dropdown}
                                    selectedValue={selectedLanguage}
                                    onValueChange={onLanguageChange}
                                >

                                    <Picker.Item label="Choose option" value="Choose option" style={{ fontWeight: 'bold', color: 'gray' }} />
                                    {languages.map((language) => (
                                        <Picker.Item key={language.value} label={language.label} value={language.value} numberOfLines={1} />
                                    ))}

                                </Picker>

                            </View>
                        </View>
                        <View style={styles.pickerContainer}>
                            <View style={styles.dropdownContainer}>
                                <Picker
                                    dropdownIconRippleColor="#6CA4FC"
                                    dropdownIconColor="#2B3270"
                                    mode='dropdown'
                                    prompt="Voice gender"
                                    style={styles.dropdown}
                                    selectedValue={selectedVoiceGender}
                                    onValueChange={onVoiceGenderChange}>
                                    <Picker.Item label="Choose option" value="Choose option" style={{ fontWeight: 'bold', color: 'gray' }} />
                                    <Picker.Item label="Male" value="male" />
                                    <Picker.Item label="Female" value="female" />
                                </Picker>
                            </View>
                        </View>

                        <View>
                            <Menu
                                visible={visible}
                                onDismiss={closeMenu}
                                anchor={
                                    <TouchableOpacity style={styles.ellipsisMenuItem} onPress={openMenu}>
                                        <Icon name="ellipsis-vertical-sharp" size={24} color="#fff" />
                                    </TouchableOpacity>
                                }
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: 2,
                                    fontSize: 14,
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    width: 260,
                                }}
                            >
                                <View style={[styles.menuItemContainer, { height: 46 }]}>
                                    <Icon name="arrow-undo-outline" size={24} color={SSMLTags.length === 0 ? "#A9A9A9" : "#6CA4FC"} />
                                    <Menu.Item title="Reset current changes" onPress={() => {
                                        setShowDiscardModal(true);
                                        closeMenu();
                                    }} disabled={SSMLTags.length === 0} />
                                </View>
                                <View style={[styles.menuItemContainer, { height: 47 }]}>
                                    <Icon name="refresh" size={24} color={(selectedLanguage === 'Choose option' || selectedVoiceGender === 'Choose option') ? "#A9A9A9" : "#6CA4FC"} />
                                    <Menu.Item title="Reset" onPress={() => {
                                        setShowResetModal(true);
                                        closeMenu();
                                    }} disabled={selectedLanguage === 'Choose option' || selectedVoiceGender === 'Choose option'} />
                                </View>

                                <Divider />
                                <View style={[styles.menuItemContainer, { height: 46 }]}>
                                    <Icon name="eye-outline" size={24} color="#6CA4FC" />
                                    <Menu.Item title="Preview changes" onPress={() => { setShowPreviewModal(true); closeMenu(); }} />
                                </View>
                                <Divider />
                                <View style={[styles.menuItemContainer, { height: 46 }]}>
                                    <Icon name="analytics-outline" size={24} color="#6CA4FC" />
                                    <Menu.Item title="Quota" onPress={() => {

                                        closeMenu();
                                    }} />
                                </View>
                            </Menu>



                        </View>


                    </View>


                    <View style={showNavBar ? styles.navbar : styles.hidden}>
                        <TouchableOpacity onPress={() => handleMenuClick(0)} style={styles.menuItem}>
                            <Icon name="reader-outline" size={24} color="#fff" />
                            <Text style={styles.menuItemText}>Text Structure</Text>
                        </TouchableOpacity>
                        {renderSubMenu(0)}
                        <TouchableOpacity onPress={() => handleMenuClick(1)} style={styles.menuItem}>
                            <Icon name="radio-outline" size={24} color="#fff" />
                            <Text style={styles.menuItemText}>Voice</Text>
                        </TouchableOpacity>
                        {renderSubMenu(1)}
                        <TouchableOpacity onPress={() => handleMenuClick(2)} style={styles.menuItem}>
                            <Icon name="ear-outline" size={24} color="#fff" />
                            <Text style={styles.menuItemText}>Pronounciation</Text>
                        </TouchableOpacity>
                        {renderSubMenu(2)}

                    </View>

                    <View style={styles.containerInput} removeClippedSubviews={true}>
                        <TextInput
                            onFocus={() => setInputFocused(true)} // update inputFocused state when input is focused
                            onBlur={() => setInputFocused(false)}
                            onSelectionChange={handleSelectionChange}
                            placeholder="Enter text here..."
                            placeholderTextColor="#ccc"
                            selectionColor='#89CFF0'
                            activeUnderlineColor='transparent'
                            numberOfLines={13}
                            multiline={true}
                            onChangeText={(text) => setText(text)}
                            value={textFromDB}
                            mode="flat"
                            dense
                            style={styles.input}
                            underlineColor="#FFF"
                            contextMenuHidden={true}
                            showSoftInputOnFocus={false}

                        />

                    </View>
                    <View >
                        <View >
                            <TouchableOpacity
                                disabled={!inputFocused || selection.start !== selection.end}
                                style={selection.start !== selection.end || !inputFocused ? styles.disabledButton : styles.breakcircleButtonContainer}
                                onPress={() => { setModalBreakVisible(true); }}
                            >
                                <Icon name={"pause"} size={24} color={"#fff"} style={styles.breakIconContainer} />
                                <Text style={styles.buttonText}>Break</Text>
                            </TouchableOpacity>
                        </View>
                        {/*  <View style={!showListenButton && styles.hidden}>
                    <TouchableOpacity style={styles.playcircleButtonContainer}>
                        <Icon name={"play"} size={24} color={"#fff"} style={styles.playIconContainer} />
                        <Text style={styles.buttonText}>Listen</Text>
                    </TouchableOpacity>
                          </View>*/}

                        <View style={{ width: '100%', alignItems: 'center', }}>
                            <View style={{ width: 200, justifyContent: 'center', marginTop: 20, marginLeft: 'auto', marginRight: 'auto' }}>
                                <Button
                                    mode="outlined"
                                    disabled={SSMLTags.length === 0 || selectedLanguage === 'Choose option' || selectedVoiceGender === 'Choose option'}
                                    onPress={applyChanges}
                                    style={{
                                        borderRadius: 20,
                                        marginVertical: 8,
                                        borderColor: "#6CA4FC",
                                    }}
                                    contentStyle={{ height: 40 }}
                                    labelStyle={{ fontSize: 16 }}
                                    textColor="#6CA4FC"
                                >
                                    Apply Changes
                                </Button>
                            </View>
                        </View>
                        {isMenuVisible && (
                            <View style={styles.menuContainer}>
                                <TouchableOpacity onPress={() => setIsMenuVisible(false)}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center' }} >
                                        <Icon name="chevron-down-outline" size={24} color="#6CA4FC" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItemElip}>
                                    <Text style={styles.menuText}>Overview</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItemElip}>
                                    <Text style={[styles.menuText, { color: '#6CA4FC' }]}>Set Voice</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItemElip}>
                                    <Text style={[styles.menuText, { color: '#6CA4FC' }]}>Set Language</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>




                    <Modal animationType='slide' transparent={true} visible={modalBreakVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <TouchableOpacity onPress={() => setModalBreakVisible(false)}>
                                    <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Set Break Point Time</Text>

                                <View style={styles.modalBreakInputContainer}>
                                    <View style={styles.modalBreakDurationContainer}>

                                        <Slider
                                            style={{ width: '100%', height: 40, }}
                                            minimumValue={1}
                                            maximumValue={60}
                                            minimumTrackTintColor='#6CA4FC'
                                            maximumTrackTintColor='#C8C7CC'
                                            thumbTintColor='#6CA4FC'
                                            onValueChange={onSliderValueChange}
                                            step={1}
                                            value={breakInfo.duration}
                                        /><View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '98%', }}>
                                            <Text>1s</Text>
                                            <Text>60s</Text>
                                        </View>

                                        <Text style={{ alignSelf: 'center', color: '#2B3270', fontWeight: 'bold' }}>{breakInfo.value} s</Text>
                                    </View>
                                </View>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={() => setModalBreakVisible(false)}>
                                        <Text style={{ color: '#2B3270' }}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={onBreakSubmit}>
                                        <Text style={{ color: '#FFFFFF' }}>Submit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType='slide' transparent={true} visible={modalPitchVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>

                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setModalPitchVisible(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Set Tone Option</Text>

                                </View>

                                <View style={styles.modalBreakInputContainer}>

                                    <View style={styles.sliderContainer}>
                                        <Slider
                                            style={{ width: '100%', height: 40 }}
                                            minimumValue={0}
                                            maximumValue={4}
                                            minimumTrackTintColor='#6CA4FC'
                                            maximumTrackTintColor='#C8C7CC'
                                            thumbTintColor='#6CA4FC'
                                            onValueChange={(value) => {
                                                const options = ['x-low', 'low', 'medium', 'high', 'x-high'];
                                                setPitchInfo({
                                                    ...pitchInfo,
                                                    value: options[value]
                                                });
                                            }}
                                            step={1}
                                            value={['x-low', 'low', 'medium', 'high', 'x-high'].indexOf(pitchInfo.value)}
                                        />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '98%', }}>
                                            <Text style={{ color: 'gray' }}>x-low</Text>
                                            <Text style={{ color: 'gray' }}>x-High</Text>
                                        </View>

                                        <Text style={{ alignSelf: 'center', color: '#2B3270', fontWeight: 'bold' }}>{pitchInfo.value}</Text>
                                    </View>
                                </View>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={onPitchSubmit}>
                                        <Text style={{ color: '#FFFFFF' }}>Submit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={onPitchSetAsDefault}>
                                        <Text style={{ color: '#2B3270' }}>Set as Default</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType='slide' transparent={true} visible={modalRateVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>

                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setModalRateVisible(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Set Speed Option</Text>

                                </View>

                                <View style={styles.modalBreakInputContainer}>

                                    <View style={styles.sliderContainer}>
                                        <Slider
                                            style={{ width: '100%', height: 40 }}
                                            minimumValue={0}
                                            maximumValue={4}
                                            minimumTrackTintColor='#6CA4FC'
                                            maximumTrackTintColor='#C8C7CC'
                                            thumbTintColor='#6CA4FC'
                                            onValueChange={(value) => {
                                                const options = ['x-slow', 'slow', 'medium', 'fast', 'x-fast'];
                                                setRateInfo({
                                                    ...rateInfo,
                                                    value: options[value]
                                                });
                                            }}
                                            step={1}
                                            value={['x-slow', 'slow', 'medium', 'fast', 'x-fast'].indexOf(rateInfo.value)}
                                        />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '98%', }}>
                                            <Text style={{ color: 'gray' }}>x-slow</Text>
                                            <Text style={{ color: 'gray' }}>x-fast</Text>
                                        </View>

                                        <Text style={{ alignSelf: 'center', color: '#2B3270', fontWeight: 'bold' }}>{rateInfo.value}</Text>
                                    </View>
                                </View>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={onRateSubmit}>
                                        <Text style={{ color: '#FFFFFF' }}>Submit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={onRateSetAsDefault}>
                                        <Text style={{ color: '#2B3270' }}>Set as Default</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType='slide' transparent={true} visible={modalVolumeVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>

                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setModalVolumeVisible(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Set Volume Option</Text>

                                </View>

                                <View style={styles.modalBreakInputContainer}>

                                    <View style={styles.sliderContainer}>
                                        <Slider
                                            style={{ width: '100%', height: 40 }}
                                            minimumValue={0}
                                            maximumValue={5}
                                            minimumTrackTintColor='#6CA4FC'
                                            maximumTrackTintColor='#C8C7CC'
                                            thumbTintColor='#6CA4FC'
                                            onValueChange={(value) => {
                                                const options = ['silent', 'x-soft', 'soft', 'medium', 'loud', 'x-loud'];
                                                setVolumeInfo({
                                                    ...volumeInfo,
                                                    value: options[value]
                                                });
                                            }}
                                            step={1}
                                            value={['silent', 'x-soft', 'soft', 'medium', 'loud', 'x-loud'].indexOf(volumeInfo.value)}
                                        />
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '98%', }}>
                                            <Text style={{ color: 'gray' }}>silent</Text>
                                            <Text style={{ color: 'gray' }}>x-loud</Text>
                                        </View>

                                        <Text style={{ alignSelf: 'center', color: '#2B3270', fontWeight: 'bold' }}>{volumeInfo.value}</Text>
                                    </View>
                                </View>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={onVolumeSubmit}>
                                        <Text style={{ color: '#FFFFFF' }}>Submit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={onVolumeSetAsDefault}>
                                        <Text style={{ color: '#2B3270' }}>Set as Default</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType='slide' transparent={true} visible={modalSentenceVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>

                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setModalSentenceVisible(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Set sentence</Text>

                                </View>

                                <View style={styles.modalBreakInputContainer}>

                                    <Text style={{ marginTop: 20, color: 'gray' }}>Do you want to set the selected text as sentence ?</Text>

                                </View>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={() => onSentenceSubmit()}>
                                        <Text style={{ color: '#FFFFFF' }}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={() => setModalSentenceVisible(false)}>
                                        <Text style={{ color: '#2B3270' }}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType='slide' transparent={true} visible={modalParaVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>

                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setModalParaVisible(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Set paragraph</Text>

                                </View>

                                <View style={styles.modalBreakInputContainer}>

                                    <Text style={{ marginTop: 20, color: 'gray' }}>Do you want to set the selected text as paragraph ?</Text>

                                </View>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={() => onParaSubmit()}>
                                        <Text style={{ color: '#FFFFFF' }}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={() => setModalParaVisible(false)}>
                                        <Text style={{ color: '#2B3270' }}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType='slide' transparent={true} visible={modalSpellVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>

                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setModalSpellVisible(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Set a Spelling Word </Text>

                                </View>

                                <View style={styles.modalBreakInputContainer}>

                                    <Text style={{ marginTop: 20, color: 'gray' }}>Do you want to set <Text style={{ fontWeight: 'bold', color: '#2B3270' }}>{"\"" + lastSelection.selectedText + "\""}</Text> as a spelling word ?</Text>
                                </View>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={() => onSpellSubmit()}>
                                        <Text style={{ color: '#FFFFFF' }}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={() => setModalSpellVisible(false)}>
                                        <Text style={{ color: '#2B3270' }}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType='slide' transparent={true} visible={modalEmphasisVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>

                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setModalEmphasisVisible(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Set Emphasis Option</Text>

                                </View>

                                <View style={styles.modalBreakInputContainer}>

                                    <View style={styles.sliderContainer}>
                                        <Slider
                                            style={{ width: '100%', height: 40 }}
                                            minimumValue={0}
                                            maximumValue={3}
                                            minimumTrackTintColor='#6CA4FC'
                                            maximumTrackTintColor='#C8C7CC'
                                            thumbTintColor='#6CA4FC'
                                            onValueChange={(value) => {
                                                const options = ['none', 'reduced', 'moderate', 'strong'];
                                                setEmphasisInfo({
                                                    ...emphasisInfo,
                                                    value: options[value]
                                                });
                                            }}
                                            step={1}
                                            value={['none', 'reduced', 'moderate', 'strong'].indexOf(emphasisInfo.value)}
                                        />
                                        <View style={styles.modalOption}>
                                            <Text style={{ color: 'gray' }}>none</Text>
                                            <Text style={{ color: 'gray' }}>strong</Text>
                                        </View>

                                        <Text style={{ alignSelf: 'center', color: '#2B3270', fontWeight: 'bold' }}>{emphasisInfo.value}</Text>
                                    </View>
                                </View>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={onEmphasisSubmit}>
                                        <Text style={{ color: '#FFFFFF' }}>Submit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={onEmphasisSetAsDefault}>
                                        <Text style={{ color: '#2B3270' }}>Set as Default</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType='slide' transparent={true} visible={modalAbbVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setModalAbbVisible(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Set Unabbreviated Words </Text>
                                </View>
                                <View style={styles.modalBreakInputContainer}>
                                    <View style={styles.sliderContainer}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ color: '#2B3270', fontWeight: 'bold' }}>{"\"" + lastSelection.selectedText + "\""}</Text>
                                            <TextInput
                                                placeholder="Enter unabbreviated words here..."
                                                placeholderTextColor="#ccc"
                                                onChangeText={(text) => setInputValue(text)}
                                                value={inputValue}
                                                style={styles.Modalinput}
                                                underlineColor="#FFF"
                                                activeUnderlineColor='#6CA4FC'
                                                multiline={true}
                                                numberOfLines={2}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={() => onAbbSubmit(inputValue)}>
                                        <Text style={{ color: '#FFFFFF' }}>Submit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={cancelAbb}>
                                        <Text style={{ color: '#2B3270' }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType='slide' transparent={true} visible={modalCardinalVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setModalCardinalVisible(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Set Cardinal Number </Text>
                                </View>
                                <View style={styles.modalBreakInputContainer}>
                                    {isNaN(lastSelection.selectedText) ? (
                                        <View>
                                            <View style={{ flexDirection: 'row', marginTop: 20, marginRight: 15, alignItems: 'center', }}>
                                                <Icon name="alert-circle-outline" style={{ color: 'red' }} size={28} />
                                                <Text style={{ color: 'red', marginLeft: 10 }}>The selected text must be a number !</Text>
                                            </View>
                                            <View style={styles.modalButtonContainer}>
                                                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={() => setModalCardinalVisible(false)}>
                                                    <Text style={{ color: '#FFFFFF' }}>OK</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (<View>
                                        <Text style={{ marginTop: 20, color: 'gray' }}>Are you sure you want to set <Text style={{ fontWeight: 'bold', color: '#2B3270' }}>{"\"" + lastSelection.selectedText + "\""}</Text> as cardinal number ?</Text>

                                        <View style={styles.modalButtonContainer}>
                                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={() => onCardinalSubmit()}>
                                                <Text style={{ color: '#FFFFFF' }}>Yes</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={() => setModalCardinalVisible(false)}>
                                                <Text style={{ color: '#2B3270' }}>No</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    )}
                                </View>

                            </View>
                        </View>
                    </Modal>

                    <Modal animationType='slide' transparent={true} visible={modalOrdinalVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setModalOrdinalVisible(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Set Ordinal Number </Text>
                                </View>
                                <View style={styles.modalBreakInputContainer}>
                                    {isNaN(lastSelection.selectedText) ? (
                                        <View>
                                            <View style={{ flexDirection: 'row', marginTop: 20, marginRight: 15, alignItems: 'center', }}>
                                                <Icon name="alert-circle-outline" style={{ color: 'red' }} size={28} />
                                                <Text style={{ color: 'red', marginLeft: 10 }}>The selected text must be a number !</Text>
                                            </View>
                                            <View style={styles.modalButtonContainer}>
                                                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={() => setModalOrdinalVisible(false)}>
                                                    <Text style={{ color: '#FFFFFF' }}>OK</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (<View>
                                        <Text style={{ marginTop: 20, color: 'gray' }}>Are you sure you want to set <Text style={{ fontWeight: 'bold', color: '#2B3270' }}>{"\"" + lastSelection.selectedText + "\""}</Text> as ordinal number ?</Text>

                                        <View style={styles.modalButtonContainer}>
                                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={() => onOrdinalSubmit()}>
                                                <Text style={{ color: '#FFFFFF' }}>Yes</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={() => setModalOrdinalVisible(false)}>
                                                <Text style={{ color: '#2B3270' }}>No</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    )}
                                </View>

                            </View>
                        </View>
                    </Modal>
                    <Modal animationType='slide' transparent={true} visible={showDiscardModal}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>

                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setShowDiscardModal(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Reset current changes </Text>

                                </View>

                                <View style={styles.modalBreakInputContainer}>

                                    <Text style={{ marginTop: 20, color: 'gray' }}>Are you sure you want to reset the current changes ?</Text>
                                </View>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={() => resetCurrentChanges()}>
                                        <Text style={{ color: '#FFFFFF' }}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={() => setShowDiscardModal(false)}>
                                        <Text style={{ color: '#2B3270' }}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType='slide' transparent={true} visible={showResetModal}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>

                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setShowResetModal(false)}>
                                        <Icon name="close-circle-outline" size={24} color="gray" style={styles.modalCloseButton} />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Reset All changes </Text>

                                </View>

                                <View style={styles.modalBreakInputContainer}>

                                    <Text style={{ marginTop: 20, color: 'gray' }}>Are you sure you want to reset  all the changes you have done?</Text>
                                </View>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6CA4FC' }]} onPress={() => resetDefaultSSML()}>
                                        <Text style={{ color: '#FFFFFF' }}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EFEFF4' }]} onPress={() => setShowResetModal(false)}>
                                        <Text style={{ color: '#2B3270' }}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        visible={showPreviewModal}
                        animationType="slide"
                        transparent={true}
                    >
                        <Provider>
                            <View style={styles.previewModalContainer}>
                                <TouchableOpacity
                                    style={styles.separatorLine}
                                    onPress={() => setShowPreviewModal(false)}
                                />

                                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                                    {[1, 2, 3, 4, 5].map((card, index) => (
                                        <View key={index} style={styles.cardContainer}>
                                            <Card style={styles.card} elevation={4}>
                                                <Card.Title
                                                    title="Emphasis"
                                                    titleStyle={styles.title}
                                                    right={(props) => (
                                                        <IconButton
                                                            mode="contained-tonal"
                                                            icon="trash-can-outline"

                                                            iconColor="#FFF"
                                                            animated="true"
                                                            size={24}
                                                            //  onPress={handleDelete}
                                                            style={{
                                                                backgroundColor: "#E57373",
                                                                borderRadius: 50,
                                                                padding: 8,
                                                                shadowColor: '#000',
                                                                shadowOffset: { width: 0, height: 2 },
                                                                shadowOpacity: 0.8,
                                                                shadowRadius: 2,
                                                                elevation: 5,
                                                                marginLeft: 8,
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <Card.Content>
                                                    <Text style={styles.content}>
                                                        Card content new content new configs ard content new content new configsard content new content new configsard content new content new configs
                                                    </Text>
                                                    <Divider />
                                                </Card.Content>
                                                <Card.Actions style={styles.actions}>
                                                    <View style={styles.updatePickerContainer}>
                                                        <Text style={styles.strongText}>Strong</Text>
                                                        <View style={styles.pickerWrapper}>
                                                            <Picker
                                                                dropdownIconRippleColor="#6CA4FC"
                                                                dropdownIconColor="#2B3270"
                                                                mode="dropdown"
                                                                prompt="Voice gender"
                                                               
                                                                style={styles.updateDropdown}

                                                                selectedValue={selectedVoiceGender}
                                                                onValueChange={onVoiceGenderChange}
                                                            >
                                                                <Picker.Item
                                                                    label="Update option"
                                                                    value="Update option"
                                                                    style={{ fontWeight: 'bold', color: 'gray' }}
                                                                />
                                                                <Picker.Item label="Medium" value="Medium" />
                                                                <Picker.Item label="Low" value="Low" />
                                                            </Picker>
                                                        </View>
                                                    </View>
                                                </Card.Actions>
                                            </Card>


                                            {/*<View style={styles.card}>
                                            <ScrollView style={{ flex: 1 }}>
                                                <Text style={styles.cardText}>
                                                    Google Cloud Text-to-Speech
                                                </Text>
                                            </ScrollView>
                                            <TouchableOpacity style={styles.deleteButton}>
                                                <Icon
                                                    name="trash-outline"
                                                    size={24}
                                                    color="#F5B7B1"
                                                    style={styles.deleteButtonText}
                                                />
                                            </TouchableOpacity>
                                        </View>*/}
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </Provider>
                    </Modal>


                    <Soundplayer url={urlFromDB} />


                </View>
            </SafeAreaView>
        </Provider >

    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F2F2F2',
        height: '100%', // set the height to the full screen size
        width: '100%', // set the width to the full screen size


    },


    navbar: {
        backgroundColor: '#2B3270',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomRightRadius: 15,
        borderBottomLeftRadius: 15,
        zIndex: 20,

    },
    menuItem: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    menuItemText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 5,
    },
    subMenu: {
        position: 'absolute',
        top: 65,
        backgroundColor: '#fff',
        borderRadius: 10,
        width: 175,
        elevation: 3,
        paddingVertical: 5,
        zIndex: 20,


    },
    subMenuHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2B3270',

    },
    subMenuHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#333',

    },
    subMenuContent: {
        paddingHorizontal: 10,
    },
    subMenuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#6CA4FC',

    },
    subMenuItemText: {
        fontSize: 14,
        color: '#333',
    },
    hidden: {
        display: 'none',
    },
    input: {
        backgroundColor: '#fff',
        color: '#fff',
        marginTop: 20,
        paddingHorizontal: 10,
        paddingVertical: 30,
        fontSize: 16,
        fontWeight: 'bold',
        justifyContent: 'space-between',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    breakcircleButtonContainer: {
        height: 60,
        width: 60,
        borderRadius: 30,
        backgroundColor: '#E57373',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 1,
        right: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: '#cccccc',
        opacity: 0.5,
        height: 60,
        width: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 1,
        right: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    playcircleButtonContainer: {
        height: 60,
        width: 60,
        borderRadius: 30,
        backgroundColor: '#6CA4FC',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 100,
        right: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    breakIconContainer: {
        height: 27,
        width: 25,
        alignItems: 'center',
        justifyContent: 'center',

    },
    playIconContainer: {
        height: 27,
        width: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },

    apllyButtonText: {
        color: '#2B3270',
        fontSize: 14,
        fontWeight: 'bold',
    },
    apllyButton: {

        paddingHorizontal: 12,
        justifyContent: 'center',
        borderColor: '#2B3270',
        marginTop: 10,

    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: -20,
        color: 'gray'

    },

    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },
    modalButton: {
        backgroundColor: '#2196F3',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginLeft: 10,
        justifyContent: 'center'
    },
    modalButtonText: {
        color: 'white',
        fontSize: 14,
    },
    modalCloseButton: {
        top: -10,
        left: 230,
    },
    menuContainer: {
        position: 'absolute',
        bottom: -5,
        left: 0,
        right: 0,
        backgroundColor: '#F2F2F2',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        borderColor: '#6CA4FC',
        zIndex: 1,

    },
    menuItemElip: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    menuText: {
        fontSize: 18,
        fontWeight: 'bold',
    },



    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },


    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '98%',
        color: 'red',
        textColor: 'red',
    },
    Modalinput: {
        flex: 1,
        paddingHorizontal: 10,
        fontSize: 16,
        width: '80%', // set the width to 80% of the container
        backgroundColor: '#fff',
        color: '#fff',
        marginTop: 20,
        paddingVertical: 30,
        fontWeight: 'bold',
        justifyContent: 'space-between',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },

    dropsContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: 0,
        backgroundColor: '#2B3270',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomRightRadius: 15,
        borderBottomLeftRadius: 15,
        zIndex: 20,
    },
    pickerContainer: {
        marginHorizontal: 2,
        flex: 1,


    },
    dropdownContainer: {
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#fff',
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',

    },
    dropdown: {
        width: '130%',

    },
    ellipsisMenuItem: {
        marginLeft: 10,
    },
    menuItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 12,
        paddingBottom: 12,
    },
    previewModalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 5,
        right: 5,
        height: '90%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 30,
        zIndex: 30,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 30,
    },

    separatorLine: {
        height: 3,
        width: '30%',
        backgroundColor: '#CCCCCC',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 10,
    },

    cardText: {

        fontSize: 14,
        marginTop: 0,
        //fontWeight: 'bold',
        color: "#2B3270"
    },
    deleteButton: {
        backgroundColor: "#E57373",
        borderRadius: 50,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        left: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    cardTopLeftText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'gray'
    },
    cardTextContainer: {
        flexGrow: 1,
    },
    card: {
        margin: 16,
        borderRadius: 16,
        backgroundColor: '#fff',
        width: 290,
    },

    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    iconButton: {
        margin: -8,
    },
    content: {
        fontSize: 16,
        color:'gray',
        lineHeight: 24,
        marginVertical: 16,
    },
    actions: {
        justifyContent: 'flex-end',
    },
    menuButton: {
        borderRadius: 16,
    },
    menuButtonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    menuAnchor: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    menuAnchorIcon: {
        backgroundColor: 'transparent',
    },
    menuContent: {
        borderRadius: 16,
        marginHorizontal: 8,
    },
    updatePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    strongText: {
        fontWeight: 'bold',
        fontSize: 16,
        color:"#2B3270"
    },
    pickerWrapper: {
        flex: 1,
        marginLeft: 16,
        backgroundColor: '#ccc',
        borderRadius:30,
        borderWidth: 2,
        borderColor: '#fff',
    },
    updateDropdown: {
        
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },







});


export default TextToSpeech;
