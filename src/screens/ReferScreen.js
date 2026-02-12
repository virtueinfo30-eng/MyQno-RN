import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Contacts from 'react-native-contacts';
import { referFriends } from '../api/refer';

export const ReferScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestContactsPermission();
  }, []);

  const requestContactsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'This app needs access to your contacts to refer friends.',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          loadContacts();
        } else {
          Alert.alert(
            'Permission Denied',
            'Cannot access contacts without permission',
          );
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      loadContacts();
    }
  };

  const loadContacts = () => {
    Contacts.getAll()
      .then(contactsList => {
        // Filter contacts that have phone numbers
        const contactsWithPhone = contactsList.filter(
          contact => contact.phoneNumbers && contact.phoneNumbers.length > 0,
        );
        setContacts(contactsWithPhone);
      })
      .catch(error => {
        console.error('Error loading contacts:', error);
        Alert.alert('Error', 'Failed to load contacts');
      });
  };

  const toggleContactSelection = contact => {
    const isSelected = selectedContacts.some(
      c => c.recordID === contact.recordID,
    );
    if (isSelected) {
      setSelectedContacts(
        selectedContacts.filter(c => c.recordID !== contact.recordID),
      );
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleRefer = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert(
        'No Contacts Selected',
        'Please select at least one contact to refer',
      );
      return;
    }

    setLoading(true);
    const result = await referFriends(selectedContacts);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', result.message, [
        {
          text: 'OK',
          onPress: () => {
            setSelectedContacts([]);
            navigation.goBack();
          },
        },
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const renderContact = ({ item }) => {
    const isSelected = selectedContacts.some(c => c.recordID === item.recordID);
    const phoneNumber = item.phoneNumbers?.[0]?.number || 'No phone';

    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.selectedContact]}
        onPress={() => toggleContactSelection(item)}
      >
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>
            {item.displayName || item.givenName}
          </Text>
          <Text style={styles.contactPhone}>{phoneNumber}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Refer Friends</Text>
        <Text style={styles.subtitle}>
          Select contacts to refer ({selectedContacts.length} selected)
        </Text>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={item => item.recordID}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        }
      />

      {selectedContacts.length > 0 && (
        <TouchableOpacity
          style={styles.referButton}
          onPress={handleRefer}
          disabled={loading}
        >
          <Text style={styles.referButtonText}>
            {loading
              ? 'Sending...'
              : `Refer ${selectedContacts.length} Friend${
                  selectedContacts.length > 1 ? 's' : ''
                }`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedContact: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  referButton: {
    backgroundColor: '#2196F3',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  referButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
