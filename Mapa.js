class Mapa {
    #map;
    #currentLat;
    #currentLong;
    #markers = []; 

    constructor() {
        const mapCenter = [41.3851, 2.1734]; // punt inital
        const zoomLevel = 13;

        this.#map = L.map('map').setView(mapCenter, zoomLevel);
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        });
        tileLayer.addTo(this.#map);

        // mostar location
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
//mostra punts Interes en mapa
mostrarPunts(pointsOfInterest) {
    if (!pointsOfInterest || pointsOfInterest.length === 0) {
        console.warn("No valid points of interest provided.");
        return;
    }

    // Debugging: Check if pointsOfInterest is correctly passed
    console.log("Received pointsOfInterest:", pointsOfInterest);

    // Remove old markers
    this.#markers.forEach(marker => this.#map.removeLayer(marker));
    this.#markers = [];

    let bounds = [];

    pointsOfInterest.forEach(point => {

        const lat = parseFloat(point.latitud);
        const lon = parseFloat(point.longitud);

        if (!isNaN(lat) && !isNaN(lon)) {
            const marker = L.marker([lat, lon]).addTo(this.#map);
            marker.bindPopup(`<strong>${point.nom}</strong><br>${point.direccio}`);
            this.#markers.push(marker);

            bounds.push([lat, lon]); // guardar posocio marker
        } else {
            console.warn(`Invalid coordinates for ${point.nom}: ${point.latitud}, ${point.longitud}`);
        }
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
        this.#map.fitBounds(bounds);
    }

    console.log("Markers added:", this.#markers.length);
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
