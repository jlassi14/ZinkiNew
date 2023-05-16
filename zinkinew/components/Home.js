import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';

const Home = () => {
  const [optionsVisible, setOptionsVisible] = useState(false);

  const toggleOptions = () => {
    setOptionsVisible(!optionsVisible);
  };

  const hideOptions = () => {
    setOptionsVisible(false);
  };

  return (
    <TouchableWithoutFeedback onPress={() => hideOptions()}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => toggleOptions()}>
            <Image
              source={{
                uri: 'https://cdn3.vectorstock.com/i/1000x1000/30/97/flat-business-man-user-profile-avatar-icon-vector-4333097.jpg',
              }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />
          </TouchableOpacity>
          {optionsVisible && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionButton}>
                <Text style={styles.optionText}>Edit profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton}>
                <Text style={styles.optionText}>Preferences</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton}>
                <Text style={styles.optionText}>Navigation redesign</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton}>
                <Text style={styles.optionText}>New navigation</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton}>
                <Text style={styles.optionText}>Toggle new navigation</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton}>
                <Text style={styles.optionText}>Sign out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
  },
  addButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ee6e73',
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  optionsContainer: {
    position: 'absolute',
    top: 60,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 8,
  },
  optionButton: {
    padding: 10,
  },
  optionText: {
    fontSize: 16,
    color: 'gray',
  },
});

export default Home;