import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  DeviceEventEmitter,
} from 'react-native';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../theme';
import {
  fetchUserProfile,
  updateUserProfile,
  updateProfilePicture,
  checkDuplicateMobile,
  generateOTP,
  confirmOTP,
} from '../api/profile';
import { fetchCountries, fetchStates, fetchCities } from '../api/region';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OTPDialog } from '../components/OTPDialog';
import { Dropdown } from '../components/Dropdown';
import { CustomInput } from '../components/CustomInput';

export const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState('');

  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    mobile_number: '',
    email_id: '',
    address: '',
    gender: 'M',
    birth_date: '',
    country_id: '',
    country_name: '',
    state_id: '',
    state_name: '',
    city_id: '',
    city_name: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Image picker state
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // OTP state
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otpMobile, setOtpMobile] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [originalMobile, setOriginalMobile] = useState('');

  // Dropdown state
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadProfileFromSession();
    loadCountries();
  }, []);

  const loadProfileFromSession = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem('user_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const id = session.logged_user_id || session.user_id; // Handle both
        console.log('User ID from session:', id);
        setUserId(id || '');
      } else {
        console.log('No user session found');
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      // Still fetch fresh data, but UI is already populated
      loadProfile();
    }
  }, [userId]);

  const loadCountries = async () => {
    const result = await fetchCountries();
    if (result.success) {
      setCountries(result.data);
    }
  };

  const loadStates = async countryId => {
    const result = await fetchStates(countryId);
    if (result.success) {
      setStates(result.data);
    }
  };

  const loadCities = async stateId => {
    const result = await fetchCities(stateId);
    if (result.success) {
      setCities(result.data);
    }
  };

  const loadProfile = async () => {
    // optional: check if we already have data to avoid spinner on first load if desired,
    // but good to show loading for fresh data.
    // If profile is already set from session, maybe don't set loading=true intended for full screen loader?
    // optimizing: only set loading if we don't have profile yet
    if (!profile) setLoading(true);

    const result = await fetchUserProfile(userId);
    console.log(
      '🚀 [ProfileScreen] fetchUserProfile Result:',
      JSON.stringify(result, null, 2),
    );
    setLoading(false);

    if (result.success) {
      setProfile(result.data);
      // Update form data with fresh data
      setFormData({
        first_name: result.data.first_name || '',
        middle_name: result.data.middle_name || '',
        last_name: result.data.last_name || '',
        mobile_number: result.data.reg_mobile || '',
        email_id: result.data.reg_email_id || '',
        address: result.data.address || '',
        gender: result.data.gender || 'M',
        birth_date: result.data.birth_date || '',
        country_id: result.data.country_id || '',
        country_name: result.data.country_name || '',
        state_id: result.data.state_id || '',
        state_name: result.data.state_name || '',
        city_id: result.data.city_id || '',
        city_name: result.data.city_name || '',
      });
      setOriginalMobile(result.data.reg_mobile || '');

      if (result.data.country_id) {
        loadStates(result.data.country_id);
      }
      if (result.data.state_id) {
        loadCities(result.data.state_id);
      }
    } else {
      // If fetch fails but we have session data, we might want to keep it or handle error
      if (!profile) setProfile(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    }
    if (!formData.state_id) {
      newErrors.state_id = 'State is required';
    }
    if (!formData.city_id) {
      newErrors.city_id = 'City is required';
    }
    if (!formData.birth_date) {
      newErrors.birth_date = 'Birth date is required';
    } else {
      // Check if birth date is not in future
      const birthDate = new Date(formData.birth_date);
      if (birthDate > new Date()) {
        newErrors.birth_date = 'Birth date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please fill all required fields correctly',
      );
      return;
    }

    // Check if mobile number changed
    if (formData.mobile_number !== originalMobile) {
      const duplicateCheck = await checkDuplicateMobile(formData.mobile_number);
      if (duplicateCheck.isDuplicate) {
        Alert.alert('Error', duplicateCheck.message);
        return;
      }
      if (duplicateCheck.otpRequired) {
        // Generate OTP
        const otpResult = await generateOTP(
          formData.mobile_number,
          'U',
          formData.country_id,
        );
        if (otpResult.success) {
          setOtpMobile(formData.mobile_number);
          setGeneratedOTP(otpResult.otp);
          setShowOTPDialog(true);
          return; // Wait for OTP verification
        } else {
          Alert.alert('Error', otpResult.message);
          return;
        }
      }
    }

    // Save profile
    await saveProfile();
  };

  const saveProfile = async () => {
    setSaving(true);

    const profileData = {
      ...formData,
      device_token: (await AsyncStorage.getItem('deviceToken')) || '',
      latitude: '0',
      longitude: '0',
    };

    const result = await updateUserProfile(userId, profileData);
    setSaving(false);

    if (result.success) {
      // Update session with new profile data
      try {
        const sessionStr = await AsyncStorage.getItem('user_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          // Merge new data
          const updatedSession = { ...session, ...result.data };

          const newFirstName = result.data.first_name || formData.first_name;
          const newLastName = result.data.last_name || formData.last_name;

          updatedSession.user_full_name =
            `${newFirstName} ${newLastName}`.trim();

          if (result.data.mobile_number)
            updatedSession.user_mobile = result.data.mobile_number;
          else if (formData.mobile_number)
            updatedSession.user_mobile = formData.mobile_number;

          if (result.data.user_pic)
            updatedSession.user_pic = result.data.user_pic;

          console.log(
            '📝 [ProfileScreen] Updated Session Data to be saved:',
            JSON.stringify(updatedSession, null, 2),
          );

          await AsyncStorage.setItem(
            'user_session',
            JSON.stringify(updatedSession),
          );
          // Notify other components
          DeviceEventEmitter.emit('profile_updated', updatedSession);
          console.log('✅ [ProfileScreen] Session updated and event emitted');
        }
      } catch (err) {
        console.error('Failed to update session locally:', err);
      }

      Alert.alert('Success', result.message, [
        {
          text: 'OK',
          onPress: () => {
            setEditMode(false);
            loadProfile();
          },
        },
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleCancel = async () => {
    setEditMode(false);
    setErrors({});
    setSelectedImage(null);
    // Reset form data to original profile
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        middle_name: profile.middle_name || '',
        last_name: profile.last_name || '',
        mobile_number: profile.reg_mobile || '',
        email_id: profile.reg_email_id || '',
        address: profile.address || '',
        gender: profile.gender || 'M',
        birth_date: profile.birth_date || '',
        country_id: profile.country_id || '',
        country_name: profile.country_name || '',
        state_id: profile.state_id || '',
        state_name: profile.state_name || '',
        city_id: profile.city_id || '',
        city_name: profile.city_name || '',
      });
    }
  };

  const handleImagePicker = () => {
    Alert.alert('Select Photo', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => openCamera(),
      },
      {
        text: 'Gallery',
        onPress: () => openGallery(),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          handleImageSelected(response.assets[0]);
        }
      },
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          handleImageSelected(response.assets[0]);
        }
      },
    );
  };

  const handleImageSelected = async image => {
    setSelectedImage(image);
    setUploadingImage(true);

    const result = await updateProfilePicture(userId, image);
    setUploadingImage(false);

    if (result.success) {
      // Update session with new profile pic
      try {
        const sessionStr = await AsyncStorage.getItem('user_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          // Update user_pic in session
          session.user_pic = result.profilePic;

          await AsyncStorage.setItem('user_session', JSON.stringify(session));
          DeviceEventEmitter.emit('profile_updated', session);
          console.log(
            '✅ [ProfileScreen] Profile pic updated in session and event emitted',
          );

          // IMMEDIATE UI UPDATE:
          // Update the profile state with the new image path so it displays the server URL
          setProfile(prev => ({ ...prev, user_pic: result.profilePic }));
          // Clear the local selected image so the UI switches to using profile.user_pic
          setSelectedImage(null);
        }
      } catch (err) {
        console.error('Failed to update session for image:', err);
      }

      Alert.alert('Success', result.message);
      // Background refresh to ensure everything is synced
      loadProfile();
    } else {
      Alert.alert('Error', result.message);
      setSelectedImage(null);
    }
  };

  const handleCountrySelect = country => {
    setFormData({
      ...formData,
      country_id: country.country_id,
      country_name: country.country_name,
      state_id: '',
      state_name: '',
      city_id: '',
      city_name: '',
    });
    setStates([]);
    setCities([]);
    loadStates(country.country_id);
  };

  const handleStateSelect = state => {
    setFormData({
      ...formData,
      state_id: state.state_id,
      state_name: state.state_name,
      city_id: '',
      city_name: '',
    });
    setCities([]);
    loadCities(state.state_id);
  };

  const handleCitySelect = city => {
    setFormData({
      ...formData,
      city_id: city.city_id,
      city_name: city.city_name,
    });
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData({ ...formData, birth_date: formattedDate });
    }
  };

  const handleOTPVerify = async otp => {
    const result = await confirmOTP(
      otpMobile,
      'U',
      formData.country_id,
      userId,
      otp,
    );

    if (result.success) {
      setShowOTPDialog(false);
      Alert.alert('Success', 'Mobile number verified');
      await saveProfile();
      return true;
    } else {
      Alert.alert('Error', result.message);
      return false;
    }
  };

  const handleOTPResend = async () => {
    const result = await generateOTP(otpMobile, 'U', formData.country_id);
    if (result.success) {
      setGeneratedOTP(result.otp);
      Alert.alert('Success', 'OTP sent successfully');
    } else {
      Alert.alert('Error', result.message);
    }
  };

  if (!profile && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No profile data available</Text>
      </View>
    );
  }

  const displayImage = selectedImage
    ? selectedImage.uri
    : profile?.user_pic
    ? `https://myqno.com/qapp/${profile.user_pic}?t=${new Date().getTime()}`
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleImagePicker}
          >
            {displayImage ? (
              <Image source={{ uri: displayImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {formData.first_name?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={theme.colors.white} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>
            {`${formData.first_name || ''} ${formData.middle_name || ''} ${
              formData.last_name || ''
            }`.trim() || 'User'}
          </Text>
          {formData.email_id && (
            <Text style={styles.userEmail}>{formData.email_id}</Text>
          )}
        </View>

        {/* Profile Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <CustomInput
            label="First Name *"
            value={formData.first_name}
            onChangeText={text =>
              setFormData({ ...formData, first_name: text })
            }
            placeholder="Enter First Name"
            error={errors.first_name}
          />
          <CustomInput
            label="Middle Name"
            value={formData.middle_name}
            onChangeText={text =>
              setFormData({ ...formData, middle_name: text })
            }
            placeholder="Enter Middle Name"
            error={errors.middle_name}
          />
          <CustomInput
            label="Last Name *"
            value={formData.last_name}
            onChangeText={text => setFormData({ ...formData, last_name: text })}
            placeholder="Enter Last Name"
            error={errors.last_name}
          />

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setFormData({ ...formData, gender: 'M' })}
              >
                <View
                  style={[
                    styles.radioCircle,
                    formData.gender === 'M' && styles.radioCircleSelected,
                  ]}
                />
                <Text style={styles.radioLabel}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setFormData({ ...formData, gender: 'F' })}
              >
                <View
                  style={[
                    styles.radioCircle,
                    formData.gender === 'F' && styles.radioCircleSelected,
                  ]}
                />
                <Text style={styles.radioLabel}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Birth Date *</Text>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                errors.birth_date && styles.inputError,
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !formData.birth_date && styles.placeholderText,
                ]}
              >
                {formData.birth_date || 'Select Birth Date'}
              </Text>
            </TouchableOpacity>
            {errors.birth_date && (
              <Text style={styles.errorText}>{errors.birth_date}</Text>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={
                formData.birth_date
                  ? new Date(formData.birth_date)
                  : selectedDate
              }
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <CustomInput
            label="Mobile Number *"
            value={formData.mobile_number}
            onChangeText={text =>
              setFormData({ ...formData, mobile_number: text })
            }
            placeholder="Enter Mobile Number"
            keyboardType="phone-pad"
            error={errors.mobile_number}
          />
          <CustomInput
            label="Email"
            value={formData.email_id}
            onChangeText={text => setFormData({ ...formData, email_id: text })}
            placeholder="Enter Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <CustomInput
            label="Address"
            value={formData.address}
            onChangeText={text => setFormData({ ...formData, address: text })}
            placeholder="Enter Address"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Country</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCountryDropdown(true)}
            >
              <Text style={styles.dropdownText}>
                {formData.country_name || 'Select Country'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>State *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                if (states.length > 0) {
                  setShowStateDropdown(true);
                } else {
                  Alert.alert('Info', 'Please select a country first');
                }
              }}
            >
              <Text style={styles.dropdownText}>
                {formData.state_name || 'Select State'}
              </Text>
            </TouchableOpacity>
            {errors.state_id && (
              <Text style={styles.errorText}>{errors.state_id}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>City *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                if (cities.length > 0) {
                  setShowCityDropdown(true);
                } else {
                  Alert.alert('Info', 'Please select a state first');
                }
              }}
            >
              <Text style={styles.dropdownText}>
                {formData.city_name || 'Select City'}
              </Text>
            </TouchableOpacity>
            {errors.city_id && (
              <Text style={styles.errorText}>{errors.city_id}</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelButton, saving && styles.disabledButton]}
            onPress={handleCancel}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dropdowns */}
      <Dropdown
        visible={showCountryDropdown}
        onClose={() => setShowCountryDropdown(false)}
        title="Select Country"
        data={countries}
        onSelect={handleCountrySelect}
        displayKey="country_name"
        valueKey="country_id"
      />

      <Dropdown
        visible={showStateDropdown}
        onClose={() => setShowStateDropdown(false)}
        title="Select State"
        data={states}
        onSelect={handleStateSelect}
        displayKey="state_name"
        valueKey="state_id"
      />

      <Dropdown
        visible={showCityDropdown}
        onClose={() => setShowCityDropdown(false)}
        title="Select City"
        data={cities}
        onSelect={handleCitySelect}
        displayKey="city_name"
        valueKey="city_id"
      />

      {/* OTP Dialog */}
      <OTPDialog
        visible={showOTPDialog}
        onClose={() => setShowOTPDialog(false)}
        onVerify={handleOTPVerify}
        mobile={otpMobile}
        onResend={handleOTPResend}
      />
    </View>
  );
};

const DropdownField = ({ label, value, onPress, error }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TouchableOpacity
      style={[styles.dropdownButton, error && styles.inputError]}
      onPress={onPress}
    >
      <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
        {value || `Select ${label}`}
      </Text>
    </TouchableOpacity>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
    alignItems: 'center',
    // paddingTop: theme.spacing.xl + 20,
  },
  avatarContainer: {
    marginBottom: theme.spacing.m,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.fontSize.xxlarge * 1.5,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  cameraIcon: {
    fontSize: 16,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.white,
    opacity: 0.9,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: theme.spacing.m,
    gap: theme.spacing.m,
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.gray,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
  },

  saveButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  section: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.m,
    padding: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.m,
    paddingBottom: theme.spacing.s,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  fieldContainer: {
    marginBottom: theme.spacing.m,
  },
  fieldLabel: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    padding: theme.spacing.m,
    fontSize: theme.fontSize.medium,
    color: theme.colors.textPrimary,
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    fontSize: theme.fontSize.small,
    color: '#FF0000',
    marginTop: theme.spacing.xs,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    padding: theme.spacing.m,
  },
  dropdownText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textPrimary,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: theme.spacing.l,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  radioLabel: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  emptyText: {
    fontSize: theme.fontSize.large,
    color: theme.colors.textSecondary,
  },
});
