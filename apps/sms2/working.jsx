import { PermissionsAndroid, StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import SmsAndroid from 'react-native-get-sms-android';

const App = () => {
  const [smsList, setSmsList] = useState([]);
  const [previousSmsList, setPreviousSmsList] = useState([]);

  // Request SMS permission only once
  const requestSmsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: "SMS Permission",
          message: "App needs access to your SMS",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.log("Permission Error:", err);
      return false;
    }
  };

  // Fetch SMS list, filter for bank messages, and find new SMS only
  const fetchSms = async () => {
    const hasPermission = await requestSmsPermission();
    if (hasPermission) {
      SmsAndroid.list(
        JSON.stringify({ box: "inbox", maxCount: 100 }),
        (fail) => console.log("Failed with error: " + fail),
        (count, smsList) => {
          const allSms = JSON.parse(smsList);

          // Filter for bank messages
          // Improved regex for filtering bank messages
          const bankSms = allSms.filter(sms =>
            /(bank|Bank|BANK|HDFC|ICICI|SBI|AXIS|KOTAK|PNB|RBL|IDFC|ACCOUNT|ACCNT|ACCT|Txn|TXN|TRANSACTION|DEPOSIT|WITHDRAWAL|ATM|CREDIT|DEBIT|BALANCE|PAYMENT)/i.test(sms.body) ||
            /^[A-Z]{2,4}[0-9]{0,4}$/i.test(sms.address) // Matches typical bank sender addresses
          );


          // Compare previous and new SMS to find only new messages
          const newSms = bankSms.filter(
            (newMessage) => !previousSmsList.some(
              (prevMessage) => prevMessage.date === newMessage.date && prevMessage.body === newMessage.body
            )
          );

          // Update lists if new messages are found
          if (newSms.length > 0) {
            console.log("New SMS Messages:", newSms[0].body); // Log new SMS
            setPreviousSmsList(bankSms);
            setSmsList(prevList => [...newSms, ...prevList]); // Prepend new SMS to the list
          } else {
            console.log("No new SMS");
          }
        }
      );
    } else {
      console.log("SMS Permission Denied");
    }
  };

  useEffect(() => {
    const initiateSmsFetch = async () => {
      const hasPermission = await requestSmsPermission();
      if (hasPermission) fetchSms();
    };

    initiateSmsFetch(); // Fetch once on mount
    const interval = setInterval(fetchSms, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.addressText}>{item.address}</Text>
      <Text>{item.body}</Text>
      <Text style={styles.dateText}>{new Date(item.date).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={smsList}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        renderItem={renderItem}
        ListEmptyComponent={() => <Text style={styles.emptyText}>No SMS Found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  itemContainer: {
    margin: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  addressText: {
    fontWeight: 'bold',
  },
  dateText: {
    color: 'gray',
    fontSize: 10,
  },
  emptyText: {
    padding: 10,
    fontSize: 20,
    textAlign: 'center',
  },
});

export default App;
