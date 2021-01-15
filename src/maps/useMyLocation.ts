import { useEffect, useState } from 'react';
import { GeolocationPosition, Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;

interface MyLocation {
  lat: number,
  lng: number,
  error?: Error;
}

export const useMyLocation = () => {
  const [state, setState] = useState<MyLocation>({lat: 47.7618951, lng: 26.6446899});
  useEffect(watchMyLocation, []);
  function updateMyPosition(source: string, lat: number, lng: number, error: any = undefined) {
    console.log(source, lat, lng, error);
    // if (!cancelled) {
    setState({ ...state, lat: lat || state.lat, lng: lng || state.lng, error });
    // }
  }
  return {myLocation: state, updateMyPosition};

  function watchMyLocation() {
    // let cancelled = false;
    updateMyPosition('current', state.lat, state.lng);
    // Geolocation.getCurrentPosition()
    //     .then(position => updateMyPosition('current', 47.7618951, 26.6446899))
    //     .catch(error => updateMyPosition('current',0, 0, error));
    // const callbackId = Geolocation.watchPosition({}, (position, error) => {
    //   updateMyPosition('watch', position, error);
    // });
    // return () => {
    //   cancelled = true;
    //   Geolocation.clearWatch({ id: callbackId });
    // };
  }
};
