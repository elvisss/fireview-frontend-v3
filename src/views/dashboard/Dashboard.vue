<template>
  <div
    id="map"
    ref="map"
  ></div>
</template>

<script>
/* eslint-disable no-undef */
/* eslint-disable lines-around-comment */
/* eslint-disable camelcase */
import { ref, onMounted } from '@vue/composition-api'
import websocketService from '@/services/websocketService'

export default {
  components: {},
  setup() {
    const zones = ref([])
    const googleMap = ref(null)
    const map = ref(null)

    const wsService = websocketService.instance

    const markers = []
    const infoWindows = []

    const icons = {
      camion: {
        icon: require('@/assets/images/icons/camion.png'),
      },
      pala: {
        icon: require('@/assets/images/icons/pala.png'),
      },
      almacen: {
        icon: require('@/assets/images/icons/almacen.png'),
      },
    }

    const setContet = (name, value, data_sensor) => `
        <div style="text-align: center;">
          <h3>${name}</h3>
          <div style="height: 15px; border-radius: 5px; margin: 0 auto; background-color: ${value ? 'red' : 'green'}"></div>
          <b style="font-weight: bold;">${data_sensor} °C</b>
        </div>
      `

    const addMarker = place => {
      const latLng = new google.maps.LatLng(place.lat, place.lng)
      const marker = new google.maps.Marker({
        map: googleMap.value,
        animation: google.maps.Animation.DROP,
        position: latLng,
        draggable: true,
        title: place.id,
        icon: place.type ? icons[place.type].icon : '',
      })
      markers.push(marker)

      const infoWindow = new google.maps.InfoWindow({
        ariaLabel: place.id,
        content: setContet(place.name, place.value, place.data_sensor),
      })
      infoWindow.open(googleMap.value, marker)
      infoWindows.push(infoWindow)

      /* google.maps.event.addDomListener(marker, 'click', () => {
        infoWindows.forEach(infoW => infoW.close())
        infoWindow.open(googleMap.value, marker)
      }) */

      google.maps.event.addDomListener(marker, 'drag', coors => {
        const newMarker = {
          id: marker.getTitle(),
          lat: coors.latLng.lat(),
          lng: coors.latLng.lng(),
          name: place.name,
        }
        /* console.log(newMarker) */
        wsService.emit('move-marker', newMarker)
      })
    }

    const loadMarkers = async () => {
      try {
        const res = await fetch(`${process.env.VUE_APP_API}/api/zones`)
        const data = await res.json()
        zones.value = data
      } catch (err) {
        console.log({ err })
      }
    }

    const loadMap = () => {
      const latLng = new google.maps.LatLng(-17.04013962716513, -70.71172188650819)
      const mapOptions = {
        center: latLng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
      }
      googleMap.value = new google.maps.Map(map.value, mapOptions)

      /* googleMap.value.addListener('click', coors => {
        const place = {
          id: new Date().toISOString(),
          name: 'new place',
          lat: coors.latLng.lat(),
          lng: coors.latLng.lng(),
        }
        addMarker(place)
      }) */

      // eslint-disable-next-line no-restricted-syntax
      for (const zone of zones.value) {
        const place = {
          id: String(zone.id),
          name: zone.title,
          lat: Number(zone.latitude),
          lng: Number(zone.longitude),
          type: zone.type,
          value: zone.value,
          data_sensor: zone.data_sensor,
        }

        addMarker(place)
      }
    }

    const listenSockets = () => {
      wsService.listen('move-marker', marker => {
        const moveMarker = markers.find(mrk => mrk.getTitle() === marker.id)
        if (moveMarker) {
          const latLng = new google.maps.LatLng(marker.lat, marker.lng)
          moveMarker.setPosition(latLng)
        }
      })

      wsService.listen('marker-update', marker => {
        const moveMarker = markers.find(mrk => mrk.getTitle() === marker.id)
        if (moveMarker) {
          const latLng = new google.maps.LatLng(marker.lat, marker.lng)
          moveMarker.setPosition(latLng)
        }
        const updateInfoWindow = infoWindows.find(infW => infW.ariaLabel === marker.id)
        if (updateInfoWindow) {
          updateInfoWindow.setContent(setContet(marker.name, marker.value, marker.data_sensor))
        }
      })
    }

    onMounted(async () => {
      listenSockets()
      await loadMarkers()
      loadMap()
    })

    return {
      zones,
      googleMap,
      map,
    }
  },
}
</script>

<style lang="scss" scoped>
#map {
  width: 100%;
  height: 100%;
}
</style>
