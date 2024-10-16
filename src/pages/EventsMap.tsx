import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useRef, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import { Event } from '../types/Event';
import { getFromNetworkFirst } from '../services/caching';
import * as api from '../services/api';

export default function EventsMap(props: StackScreenProps<any>) {
  const { navigation } = props;
  const authenticationContext = useContext(AuthenticationContext);
  const mapViewRef = useRef<MapView>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const fetchedEvents = await getFromNetworkFirst<Event[]>('events', api.getEvents());
  
      // Adjust event date-time to compare correctly with current date in user's time zone
      const futureEvents = fetchedEvents.filter(event => new Date(event.dateTime).getTime() >= new Date().getTime());
      setEvents(futureEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  useEffect(() => {
    mapViewRef.current?.fitToCoordinates(
      events.map(({ position }) => ({
        latitude: position.latitude,
        longitude: position.longitude,
      })),
      { edgePadding: MapSettings.EDGE_PADDING }
    );
  }, [events]);

  const handleNavigateToEventDetails = (event: Event) => {
    navigation.navigate('EventDetails', { event });
  };

  const handleNavigateToCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const handleLogout = async () => {
    AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
      authenticationContext?.setValue(undefined);
      navigation.navigate('Login');
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={MapSettings.DEFAULT_REGION}
        style={styles.mapStyle}
        customMapStyle={customMapStyle}
        showsMyLocationButton={false}
        showsUserLocation={true}
        rotateEnabled={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        mapPadding={MapSettings.EDGE_PADDING}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.position.latitude,
              longitude: event.position.longitude,
            }}
            onPress={() => handleNavigateToEventDetails(event)}
          >
            <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={mapMarkerImg} />
          </Marker>
        ))}
      </MapView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{`${events.length} event(s) found`}</Text>
        <RectButton
          style={[styles.smallButton, { backgroundColor: '#00A3FF' }]}
          onPress={handleNavigateToCreateEvent}
        >
          <Feather name="plus" size={20} color="#FFF" />
        </RectButton>
      </View>
      <RectButton
        style={[styles.logoutButton, styles.smallButton, { backgroundColor: '#4D6F80' }]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={20} color="#FFF" />
      </RectButton>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    mapStyle: {
        ...StyleSheet.absoluteFillObject,
    },
    logoutButton: {
        position: 'absolute',
        top: 70,
        right: 24,
        elevation: 3,
    },
    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,
        backgroundColor: '#FFF',
        borderRadius: 16,
        height: 56,
        paddingLeft: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
    },
    footerText: {
        fontFamily: 'Nunito_700Bold',
        color: '#8fa7b3',
    },
    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
