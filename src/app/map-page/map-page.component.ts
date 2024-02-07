import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {} from 'googlemaps';
import { GeocodingService } from './geocoding.service';

@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapPageComponent implements OnInit {
  
  mapLoaded: boolean;
  map: google.maps.Map;
  center: google.maps.LatLngLiteral;
  points: google.maps.LatLngLiteral[] = [];

  options: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: true,
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    zoom: 12
  }
  searchText: string = '';
  addresses: any[] = [];
  searchText2: string = '';
  addresses2: any[] = [];
  searchText3: string = '';
  addresses3: any[] = [];
  ds: google.maps.DirectionsService;
  dr: google.maps.DirectionsRenderer;

  constructor(private geocodingService: GeocodingService) {}

  searchLocation(address: string = "ankara") {
    this.geocodingService.getLocation(address).subscribe(
      (response) => {
      },
      (error) => {
        console.error('Hata:', error);
      }
    );
  }

  searchAddress() {
    this.addresses = [];
    if (this.searchText.trim() !== '') {
      this.geocodingService.getLocation(this.searchText).subscribe(
        (response) => {
          if(response.results.length > 0)
            this.addresses.push(response.results);
        },
        (error) => {
          console.error('Hata:', error);
        }
      );
    }
  }
  searchAddress2() {
    this.addresses2 = [];
    if (this.searchText2.trim() !== '') {
      this.geocodingService.getLocation(this.searchText2).subscribe(
        (response) => {
          if(response.results.length > 0)
            this.addresses2.push(response.results);
        },
        (error) => {
          console.error('Hata:', error);
        }
      );
    }
  }
  searchAddress3() {
    this.addresses3 = [];
    if (this.searchText3.trim() !== '') {
      this.geocodingService.getLocation(this.searchText3).subscribe(
        (response) => {
          if(response.results.length > 0)
            this.addresses3.push(response.results);
        },
        (error) => {
          console.error('Hata:', error);
        }
      );
    }
  }
  
  clickAddress(address)
  {
    var adres: google.maps.LatLngLiteral = { lat: address.geometry.location.lat, lng: address.geometry.location.lng  };
    this.points.push(adres);
  }

  getRoute()
  {
    if (this.points.length > 0) {
      this.setRoutePolyline();
    }
  }

  ngOnInit() {
    this.ds = new google.maps.DirectionsService();
    this.dr = new google.maps.DirectionsRenderer({
      map: null,
      suppressMarkers: true
    });
    // this.searchLocation();
    navigator.geolocation.getCurrentPosition(position => {
      this.map = new google.maps.Map(document.getElementById('map-canvas'), {
        ...this.options,
        center: { lat: 	39.925533, lng: 	32.866287 }, // Set default center
        streetViewControl: true
      });

      this.map.addListener('tilesloaded', () => {
        this.mapLoaded = true;
      });
    });
  }

  setRoutePolyline() {
    console.log(this.points);
    let waypoints: google.maps.DirectionsWaypoint[] = this.points.slice(1, -1).map(point => ({
        location: new google.maps.LatLng(point.lat, point.lng),
        stopover: true
    }));

    let request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(this.points[0].lat, this.points[0].lng),
        destination: new google.maps.LatLng(this.points[this.points.length - 1].lat, this.points[this.points.length - 1].lng),
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true
    };

    this.ds.route(request, (response, status) => {
        this.dr.setOptions({
            suppressPolylines: false,
            map: this.map
        });

        if (status == google.maps.DirectionsStatus.OK) {
            this.dr.setDirections(response);

            // Her bir rota için başlangıç ve bitiş noktalarına simge ekleme
            for (let i = 0; i < response.routes.length; i++) {
                let route = response.routes[i];
                // Başlangıç noktası simgesi ekleme
                new google.maps.Marker({
                    position: route.legs[0].start_location,
                    map: this.map,
                    icon: {
                        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    }
                });
                // Bitiş noktası simgesi ekleme
                new google.maps.Marker({
                    position: route.legs[route.legs.length - 1].end_location,
                    map: this.map,
                    icon: {
                        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    }
                });
            }
        }
    });
}




  submitForm() {
    
  }

  clearRoutes() {
    navigator.geolocation.getCurrentPosition(position => {
      this.map = new google.maps.Map(document.getElementById('map-canvas'), {
        ...this.options,
        center: { lat: 	39.925533, lng: 	32.866287 } // Set default center
      });

      this.map.addListener('tilesloaded', () => {
        this.mapLoaded = true;
      });
    });
    this.points = [];
    let dr = new google.maps.DirectionsRenderer({ map: this.map });
    dr.setMap(null);
  }
}
