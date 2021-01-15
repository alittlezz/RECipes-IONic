import React from "react";
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import { compose, withProps } from 'recompose';

interface MyMapProps {
    lat?: number;
    lng?: number;
    onMapClick: (e: any) => void,
    onMarkerClick: (e: any) => void,
}

export const MyMap =
    compose<MyMapProps, any>(
        withProps({
            googleMapURL:
                `https://maps.googleapis.com/maps/api/js?key=AIzaSyCOPq2W6Y568XIyGzj7UotwebrShWF0uEs&v=3.exp&libraries=geometry,drawing,places`,
            loadingElement: <div style={{ height: `500px`, width:'70%' }} />,
            containerElement: <div style={{ height: `500px`, width:'70%', margin: 'auto' }} />,
            mapElement: <div style={{ height: `500px`, width:'70%',  margin: 'auto'}} />
        }),
        withScriptjs,
        withGoogleMap
    )(props => (
        <GoogleMap
            defaultZoom={8}
            defaultCenter={{ lat: props.lat, lng: props.lng }}
            onClick={props.onMapClick}
        >
            <Marker
                position={{ lat: props.lat, lng: props.lng }}
                onClick={props.onMarkerClick}
            />
        </GoogleMap>
    ))
