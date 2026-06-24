import { useRef, useEffect, useCallback } from 'react'
import maplibregl from 'maplibre-gl'

export default function MapPicker({ lat, lon, onMapClick }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [42.0, 45.1],
      zoom: 11,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.on('click', e => {
      const { lng, lat } = e.lngLat
      onMapClick({ lat, lng })

      // Move or create marker
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat])
      } else {
        markerRef.current = new maplibregl.Marker({ color: '#1B4F8A', draggable: true })
          .setLngLat([lng, lat])
          .addTo(map)

        markerRef.current.on('dragend', () => {
          const { lng, lat } = markerRef.current.getLngLat()
          onMapClick({ lat, lng })
        })
      }
    })

    // Cursor hint
    map.getCanvas().style.cursor = 'crosshair'
    mapRef.current = map

    return () => { map.remove(); mapRef.current = null }
  }, [])

  // When lat/lon change externally — move marker
  useEffect(() => {
    if (!mapRef.current || !lat || !lon) return
    const map = mapRef.current
    if (markerRef.current) {
      markerRef.current.setLngLat([lon, lat])
    } else {
      markerRef.current = new maplibregl.Marker({ color: '#1B4F8A', draggable: true })
        .setLngLat([lon, lat])
        .addTo(map)
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLngLat()
        onMapClick({ lat: pos.lat, lng: pos.lng })
      })
    }
    map.flyTo({ center: [lon, lat], zoom: Math.max(map.getZoom(), 15), duration: 800 })
  }, [lat, lon])

  return (
    <div ref={containerRef} className="w-full h-full"
      style={{ cursor: 'crosshair' }} />
  )
}
