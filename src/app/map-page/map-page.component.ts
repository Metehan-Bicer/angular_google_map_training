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
  center: google.maps.LatLngLiteral; // haritanin odaklanacagi koordinat
  points: google.maps.LatLngLiteral[] = []; // route cizilecek noktalar

  options: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: true,
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    zoom: 12
  } // map settings ler burada yapiliyor



  traffic:boolean = false;
  alternativeRoute:boolean = false;
  searchText: string = '';
  addresses: any[] = [];
  listAddress: any[] = [];
  ds: google.maps.DirectionsService;
  dr: google.maps.DirectionsRenderer;
  trafficLayer: google.maps.TrafficLayer; // trafic layer, 


  constructor(private geocodingService: GeocodingService) {}


  // google api adres search yapilarak koordinat bilgileri aliniyor
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

  clickAddress(address)
  {
    var adres: google.maps.LatLngLiteral = { lat: address.geometry.location.lat, lng: address.geometry.location.lng  };
    if(this.listAddress.length !=3)
    {
      this.listAddress.push(address.formatted_address)
      this.points.push(adres);
    }
    
    this.addresses = [];
    this.searchText = "";
  }

  adressClear()
  {
    this.listAddress = [];
    this.clearRoutes();
  }

  getRoute()
  {
    if (this.points.length > 0) {
      this.setRoutePolylineWithAlternatives();
    }
  }
  //traffic layer acilip kapatiliyor
  showTraffic() {
    if (this.traffic) {
      const trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(this.map);
      this.trafficLayer = trafficLayer; 
    } else {
      if (this.trafficLayer) {
        this.trafficLayer.setMap(null);
      }
    }
  }

  ngOnInit() {
    //harita burada render ediliyor
    this.ds = new google.maps.DirectionsService();
    this.dr = new google.maps.DirectionsRenderer({
      map: null,
      suppressMarkers: true
    });
    navigator.geolocation.getCurrentPosition(position => {
      this.map = new google.maps.Map(document.getElementById('map-canvas'), {
        ...this.options,
        center: { lat: 	39.925533, lng: 	32.866287 }, //default center odaklanacak nokta
        streetViewControl: true //street view adam koyup birakma ozelligi burada aciliyor
      });
      this.map.addListener('tilesloaded', () => {
        this.mapLoaded = true;
      });
    });
  }

  setRoutePolylineWithAlternatives() {
    navigator.geolocation.getCurrentPosition(position => {
      this.map = new google.maps.Map(document.getElementById('map-canvas'), {
        ...this.options,
        // center: { lat: 	39.925533, lng: 	32.866287 } // default center adres.
      });

      this.map.addListener('tilesloaded', () => {
        this.mapLoaded = true;
      });
    });
    let dr = new google.maps.DirectionsRenderer({ map: this.map });
    dr.setMap(null);
    let waypoints: google.maps.DirectionsWaypoint[] = this.points.slice(1, -1).map(point => ({
      location: new google.maps.LatLng(point.lat, point.lng),
      stopover: true
    }));
  
    let request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(this.points[0].lat, this.points[0].lng),
      destination: new google.maps.LatLng(this.points[this.points.length - 1].lat, this.points[this.points.length - 1].lng),
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING, // cizilen rotanin arac yolu oldugunu belirtir
      optimizeWaypoints: true,
      provideRouteAlternatives: this.alternativeRoute // Alternatif rotaları listenin icinde gelmesi icin altarnatif rotalar da dahil edilir
    };
  
    this.ds.route(request, (response, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        this.dr.setOptions({
          suppressPolylines: false,
          map: this.map,
          directions: response // Tüm rotaları direkt olarak ayarla
        });
  
        // Her bir rota için başlangıç ve bitiş noktalarına simge ekleme
        for (let i = 0; i < response.routes.length; i++) {
          let route = response.routes[i];
          let polylineOptions: google.maps.PolylineOptions = {
            strokeColor: i === 0 ? '#0000FF' : '#808080', // İlk rota mavi, diğer rotalar gri
            strokeOpacity: 0.8,
            strokeWeight: 5
          };
  
          // Rota çizimi
          let polyline = new google.maps.Polyline(polylineOptions);
          polyline.setPath(route.overview_path);
          polyline.setMap(this.map);
  
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

  //route lar temizlenip haritayi yeniden olusturur
  clearRoutes() {
    navigator.geolocation.getCurrentPosition(position => {
      this.map = new google.maps.Map(document.getElementById('map-canvas'), {
        ...this.options,
        center: { lat: 	39.925533, lng: 	32.866287 } // default center adres.
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
