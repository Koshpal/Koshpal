import { PermissionsAndroid, StyleSheet, Text, View, FlatList, SafeAreaView, Touchable, TouchableOpacity, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import SmsAndroid from 'react-native-get-sms-android';
import axios from 'axios';




const App = () => {
  const [smsList, setSmsList] = useState([]);
  const [previousSmsList, setPreviousSmsList] = useState([]);
  const [isInitialFetch, setIsInitialFetch] = useState(true);

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

  const fetchBankSms = async (callback) => {
    SmsAndroid.list(
      JSON.stringify({ box: 'inbox', maxCount: 100 }),
      (fail) => console.log('Failed with error: ' + fail),
      (count, smsList) => {
        const allSms = JSON.parse(smsList);
        console.log("Fetched SMS count:", count); // Debug log
        const bankSms = allSms.filter((sms) =>
          /(bank|Bank|BANK|HDFC|ICICI|SBI|AXIS|KOTAK|PNB|RBL|IDFC|ACCOUNT|ACCNT|ACCT|Txn|TXN|TRANSACTION|DEPOSIT|WITHDRAWAL|ATM|CREDIT|DEBIT|BALANCE|PAYMENT)/i.test(sms.body) ||
          /^[A-Z]{2,4}[0-9]{0,4}$/i.test(sms.address)
        );
        console.log("Filtered bank SMS count:", bankSms.length); // Debug log
        setSmsList(bankSms);
        // console.log(bankSms[0]);
        callback(bankSms);
      }
    );
  };

  const postTransaction = async (sms) => {
    const transactionData = {
      bankName: extractBankName(sms),
      amount: extractAmount(sms),
      type: extractType(sms),
      to_acc: extractToAccount(sms),
      to_person: extractToPerson(sms),
      time: new Date(sms.date), // Assuming `sms.date` is a timestamp
      description: sms.body,
    };

    try {
      await axios.post('https://poetry-editorial-period-barrel.trycloudflare.com/api/transaction/createTransaction', transactionData);
      console.log("Transaction posted successfully:", transactionData);
    } catch (error) {
      console.log("Failed to post transaction:", error);
    }
  };

  const extractBankName = (sms) => {
    const bankNameRegex = /(?:from|to)\s([A-Za-z\s]+)/i;
    const match = sms.body.match(bankNameRegex);
    return match ? match[1].trim() : 'Unknown Bank';
  };

  const extractAmount = (sms) => {
    const amountRegex = /Rs.\s([0-9,]+\.\d{2})/;
    const match = sms.body.match(amountRegex);
    return match ? parseFloat(match[1].replace(',', '')) : 0;
  };

  const extractType = (sms) => {
    if (/debited/i.test(sms.body)) {
      return 'Debit';
    } else if (/credited/i.test(sms.body)) {
      return 'Credit';
    }
    return 'Unknown Type';
  };

  const extractToAccount = (sms) => {
    const accountRegex = /a\/c\s(\d{4,})/;
    const match = sms.body.match(accountRegex);
    return match ? match[1] : 'Unknown Account';
  };

  const extractToPerson = (sms) => {
    const nameRegex = /P2M-([A-Za-z\s\-]+)/i;
    const match = sms.body.match(nameRegex);
    return match ? match[1] : 'Unknown Person';
  };

  const SmsListener = () => {
    useEffect(() => {
      const updateSmsLists = async () => {
        const hasPermission = await requestSmsPermission();
        if (!hasPermission) return;

        fetchBankSms((current) => {
          // console.log("Previous SMS IDs:", previousSmsList.map((sms) => sms._id)); // Debug log
          // console.log("Current SMS IDs:", current.map((sms) => sms._id)); // Debug log

          const newMessages = current.filter(
            (sms) => !previousSmsList.some((prevSms) => prevSms._id === sms._id)
          );

          console.log("New Messages:", newMessages); // Debug log for new messages

          if (newMessages.length > 0) {
            setSmsList((prevSmsList) => [...newMessages, ...prevSmsList]);
            setPreviousSmsList(current);

            if (!isInitialFetch) {
              newMessages.forEach((sms) => postTransaction(sms)); // Post transaction for new messages
            }
          }

          if (isInitialFetch) {
            setIsInitialFetch(false); // Set to false after the first fetch
          }
        });
      };

      updateSmsLists(); // Initial fetch
      const interval = setInterval(updateSmsLists, 5000);
      return () => clearInterval(interval);
    }, [previousSmsList, isInitialFetch]); // Dependency on previousSmsList and isInitialFetch to trigger updates
  };

  SmsListener(); // Keep it here but correctly inside the App component to work

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.addressText}>{item.address}</Text>
      <Text>{item.body}</Text>
      <Text style={styles.dateText}>{new Date(item.date).toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

        <FlatList
          data={smsList}
          keyExtractor={(item) => `${item._id || item.date}`}
          renderItem={renderItem}
          ListEmptyComponent={() => <Text style={styles.emptyText}>No SMS Found</Text>}
        />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  notificationButton: {
    backgroundColor: '#007BFF', // Blue background color
    paddingVertical: 12,         // Vertical padding for better button size
    paddingHorizontal: 25,       // Horizontal padding
    borderRadius: 8,            // Rounded corners
    elevation: 3,               // Shadow for Android
    shadowColor: '#000',        // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',              // White text
    fontSize: 16,               // Text size
    fontWeight: '600',          // Medium font weight
    textAlign: 'center',       // Center the text
  },

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
