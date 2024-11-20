import React, { useState } from 'react';
import { Modal, Text, View, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const useNotification = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [inputText, setInputText] = useState('');
  const [dateEntered, setDateEntered] = useState('');

  const categories = ['Category 1', 'Category 2', 'Category 3'];

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleSave = () => {
    setDateEntered(new Date().toLocaleString());
    setModalVisible(false);
    alert('Notification Saved');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setModalVisible(false); // Close the modal after selection
  };

  const ModalContent = () => (
    <Modal visible={isModalVisible} onRequestClose={toggleModal} animationType="slide">
      <View style={styles.modalContent}>
        <Text style={styles.title}>Create Notification</Text>

        <Text>Select Category:</Text>

        {/* Custom Picker */}
        <View style={styles.pickerContainer}>
          <TouchableOpacity
            style={styles.selectedCategoryButton}
            onPress={toggleModal}
          >
            <Text style={styles.selectedCategoryText}>
              {selectedCategory || 'Select Category'}
            </Text>
          </TouchableOpacity>

          {/* Modal to show category options */}
          {isModalVisible && (
            <FlatList
              data={categories}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryOption}
                  onPress={() => handleCategorySelect(item)}
                >
                  <Text style={styles.categoryText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Enter your notification text"
          value={inputText}
          onChangeText={setInputText}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Notification</Text>
        </TouchableOpacity>

        <Text style={styles.dateText}>Date Entered: {dateEntered}</Text>
      </View>
    </Modal>
  );

  return {
    toggleModal,
    ModalContent,
    dateEntered,
    selectedCategory,
    inputText,
    setInputText,
    setSelectedCategory,
  };
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pickerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    width: 200,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedCategoryText: {
    fontSize: 16,
  },
  categoryOption: {
    padding: 10,
    width: 200,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  categoryText: {
    fontSize: 16,
  },
  input: {
    height: 40,
    width: 250,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
  dateText: {
    marginTop: 10,
    fontSize: 12,
    color: 'gray',
  },
});

export default useNotification;
