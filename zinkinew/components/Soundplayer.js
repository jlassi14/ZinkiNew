import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import Sound from 'react-native-sound';

const Soundplayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.stop();
                sound.release();
            }
        };
    }, [sound]);

    useEffect(() => {
        // Load the sound when the component mounts
        const url = 'http://192.168.1.4:3000/audio'; 
        const newSound = new Sound(url, '', error => {
            if (error) {
                console.log('Failed to load the sound', error);
            } else {
                setDuration(newSound.getDuration());
                setSound(newSound);
            }
        });

        // Stop and release the sound when the component unmounts
        return () => {
            if (sound) {
                sound.stop();
                sound.release();
            }
        };
    }, []);
    const playSound = () => {
        if (sound) {
            sound.play(success => {
                if (success) {
                    console.log('Successfully finished playing');
                    setIsPlaying(false);
                    setCurrentTime(0);
                    sound.setCurrentTime(0);
                } else {
                    console.log('Playback failed due to audio decoding errors');
                }
            });
        }
    };

    const pauseSound = () => {
        if (sound) {
            sound.pause();
        }
    }

    const handlePlayPausePress = () => {
        if (isPlaying) {
            setIsPlaying(false);
            pauseSound();
        } else {
            setIsPlaying(true);
            playSound();
        }
    }

    const handleTimeUpdate = () => {
        if (sound && isPlaying) {
            sound.getCurrentTime(seconds => {
                setCurrentTime(seconds);
            });
        }
    }

    const handleSeekBackward = () => {
        if (sound) {
            sound.getCurrentTime((seconds) => {
                let newPosition = seconds - 10;
                if (newPosition < 0) {
                    newPosition = 0;
                }
                setCurrentTime(newPosition);
                sound.setCurrentTime(newPosition);
            });
        }
    };

    const handleSeekForward = () => {
        if (sound) {
            sound.getCurrentTime((seconds) => {
                let newPosition = seconds + 10;
                if (newPosition > duration) {
                    newPosition = duration;
                }
                setCurrentTime(newPosition);
                sound.setCurrentTime(newPosition);
            });
        }
    };

    useEffect(() => {
        if (sound && isPlaying) {
            const intervalId = setInterval(() => {
                handleTimeUpdate();
            }, 100);
            return () => clearInterval(intervalId);
        }
    }, [sound, isPlaying, handleTimeUpdate]);
    
    const formatTime = time => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const pad = num => {
            return num < 10 ? '0' + num : num;
        }
        return pad(minutes) + ':' + pad(seconds);
    }

    return (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressTimeContainer}>
                        <Text style={styles.progressTime}>{formatTime(currentTime)}</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <ProgressBar progress={duration > 0 ? currentTime / duration : 0} color={'#6CA4FC'} />

                    </View>
                    <View style={styles.progressTimeContainer}>
                        <Text style={styles.progressTime}>{formatTime(duration)}</Text>
                    </View>
                </View>
                <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.seekButtonContainer} onPress={handleSeekBackward}>
                    <Icon name={"backward"} size={24} color={"#fff"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playButtonContainer} onPress={handlePlayPausePress}>
                    <Icon name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.seekButtonContainer} onPress={handleSeekForward}>
                    <Icon name={"forward"} size={24} color={"#fff"} />
                </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

export default Soundplayer;


const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-end',
        backgroundColor: '#F2F2F2',
        paddingHorizontal: 5,
        marginTop:50,
    },
    progressContainer: {
        backgroundColor: '#17093A',
        borderRadius: 16,
        padding: 5,
    },
    progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#3c3c3c',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        flex: 0.5,
        height: 4,
        borderRadius: 4,
    },
    progressTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 10,
    },
    progressTime: {
        color: '#b8b8b8',
        fontSize: 14,
        marginRight: 10,
    },
   
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    seekButtonContainer: {
        backgroundColor: '#6CA4FC',
        borderRadius: 50,
        padding: 10,
        marginRight: 10,
    },
    playButtonContainer: {
        backgroundColor: '#6CA4FC',
        borderRadius: 30,
        padding: 15,
        marginHorizontal: 20,
    },
});
