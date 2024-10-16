import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import * as api from '../services/api';
import BigButton from '../components/BigButton';
import Spacer from '../components/Spacer';
import { Event } from '../types/Event';

export default function CreateEvent({ navigation }: StackScreenProps<any>) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [volunteersNeeded, setVolunteersNeeded] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageDetails, setImageDetails] = useState<{ name: string; size: string } | null>(null);

  const isFormValid = () => {
    return name && description && date && time && latitude && longitude && volunteersNeeded && image;
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera roll permissions to upload images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const fileName = uri.split('/').pop() || 'unknown.jpg';
      const fileSize = result.assets[0].fileSize || 0;

      try {
        // Upload the image to FreeImageHost or another storage service
        const uploadResponse = await api.uploadImage(uri);
        setImage(uploadResponse.data.image.display_url); // Use the URL returned by the service
        setImageDetails({ name: fileName, size: `${(fileSize / (1024 * 1024)).toFixed(2)} MB` });
      } catch (error) {
        Alert.alert('Upload failed', 'There was an issue uploading the image. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    try {
      const newEvent: Partial<Event> = {
        name,
        description,
        dateTime: `${date}T${time}:00.000Z`,
        position: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        volunteersNeeded: parseInt(volunteersNeeded),
        imageUrl: image, // Include the uploaded image URL here
        organizerId: 'someOrganizerId',
        volunteersIds: [],
      };

      await api.createEvent(newEvent);
      navigation.navigate('EventsMap');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Time (HH:MM)"
        value={time}
        onChangeText={setTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Volunteers Needed"
        value={volunteersNeeded}
        onChangeText={setVolunteersNeeded}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        <Text>Pick an image</Text>
      </TouchableOpacity>
      {image && (
        <View>
          <Image source={{ uri: image }} style={styles.image} />
          {imageDetails && (
            <Text>{`${imageDetails.name} (${imageDetails.size})`}</Text>
          )}
        </View>
      )}
      <Spacer size={20} />
      <BigButton
        label="Save Event"
        color="#00A3FF"
        onPress={handleSave}
        disabled={!isFormValid()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  imagePicker: {
    backgroundColor: '#ddd',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginTop: 10,
  },
});
