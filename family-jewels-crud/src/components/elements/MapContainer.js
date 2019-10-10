import React, { Component } from 'react';
import {Map, GoogleApiWrapper} from 'google-maps-react';
import './Map.css';
import axios from 'axios';


export class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showingInfoWindow: false,  //Hides or the shows the infoWindow
      activeMarker: {},          //Shows the active marker upon click
      selectedPlace: {}          //Shows the infoWindow to the selected place upon a marker
    };
  }
/*
  onMapClicked = (event) =>{
    this.setState({
      markers:
        {
          position:event.latLng,
          key: Date.now(),
          defaultAnimation: 2,
        }
    })
  }*/
/*
  mapClicked = (mapProps, map, event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDNows5nkmeLel6-_ecsqGzlK1E2xqr4bs`
    axios.get(url).then(response => {
        this.setState({
          googleReverseGeolocation: response.data.results[0].formatted_address,
          marker: {position:{lat:event.latLng.lat(),lng:event.latLng.lng()}},
          lati: lat,
          lngi: lng
        });
       this.props.onMapClickChange(lat, lng, response.data.results[0].formatted_address);
       console.log(this.state);
    });
  }*/



  onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });

  onClose = props => {
    if (this.state.showingInfoWindow) {
      console.log(this.props);
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

  render() {
    return (
      <div class="map-box">
        <Map google={this.props.google}
          initialCenter={{
              lat: -37.794921,
              lng: 144.961446
          }}
          style={style}
          zoom={5}
          onClick={this.props.saveMarker}
        >
        </Map>
      </div>
    );
  }
}

const style = {
  width: '80%',
  height: '35vh'
}

export default GoogleApiWrapper({
  apiKey: ('AIzaSyDNows5nkmeLel6-_ecsqGzlK1E2xqr4bs')
})(MapContainer)