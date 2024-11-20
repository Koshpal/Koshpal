import React, { useState } from 'react';
import { View, Text, TextInput, Picker, Button, StyleSheet, TouchableOpacity } from 'react-native';

const Notification = ({ message, categories, onDismiss }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    // Handle submission logic (e.g., logging, API call)
    onDismiss(); // Dismiss the notification
  };

  return (
    <View style={styles.notification}>
      <Text style={styles.message}>{message}</Text>

      {/* Dropdown for category selection */}
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.picker}
      >
        {categories.map((category, index) => (
          <Picker.Item key={index} label={category} value={category} />
        ))}
      </Picker>

      {/* Optional input field */}
      {selectedCategory && (
        <TextInput
          style={styles.input}
          placeholder="Enter additional info"
          value={inputText}
          onChangeText={setInputText}
        />
      )}

      {/* Submit button */}
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  notification: {
    padding: 20,
    margin: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  message: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default Notification;
