class Mapa {
    #map;
    #currentLat;
    #currentLong;

    constructor() {
        const mapCenter = [41.3851, 2.1734]; // punt inital
        const zoomLevel = 13;
        
        this.#map = L.map('map').setView(mapCenter, zoomLevel);
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
            attribution: '&copy; OpenStreetMap contributors' 
        });
        tileLayer.addTo(this.#map);

        // Get user location
        this.#getPosicioActual();
    }

    mostrarPuntInicial() {
        if (this.#currentLat && this.#currentLong) {
            L.marker([this.#currentLat, this.#currentLong])
                .addTo(this.#map)
                .bindPopup("Estàs aquí")
                .openPopup();
        }
    }

    actualitzarPosInitMapa(lat, long) {
        this.#map.setView([lat, long], 13);
    }

    mostrarPunt(lat, long, desc = "") {
        L.marker([lat, long])
            .addTo(this.#map)
            .bindPopup(desc)
            .openPopup();
    }

    borraPunt() {
        this.#map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                this.#map.removeLayer(layer);
            }
        });
    }

    async #getPosicioActual() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.#currentLat = position.coords.latitude;
                    this.#currentLong = position.coords.longitude;

                    this.mostrarPuntInicial();
                    this.actualitzarPosInitMapa(this.#currentLat, this.#currentLong);
                },
                (error) => {
                    console.error("Error en la geolocalización:", error);
                }
            );
        } else {
            console.error("La geolocalización no está disponible en este navegador.");
        }
    }
}
