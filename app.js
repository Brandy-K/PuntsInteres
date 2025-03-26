const dropZoneObj = document.querySelector(".dropZone");
dropZoneObj.addEventListener("dragover", function (event) {
    event.preventDefault();
    console.log("drag");
});

dropZoneObj.addEventListener("drop", function (event) {
    event.preventDefault();
    console.log("drop");
    const files = event.dataTransfer.files;
    loadFile(files);
    console.log(files);
});

const loadFile = function (files) {
    if (files && files.length > 0) {
        const file = files[0];
        const extensio = file.name.split(".")[1];
        if (extensio.toLowerCase() === FILE_EXTENSION) {
            alert("El fitxer té un format correcte");
            readCSV(file);
        } else {
            alert("El format del fitxer no és correcte");
        }
        console.log(files);
    }
};

const deletePoint = function (index) {
    pointsOfInterest.splice(index, 1);
    displayPoints();
};



const mapa = new Mapa();

const readCSV = function (file) {
    const reader = new FileReader();
    reader.onload = async (event) => {
        const csvContent = event.target.result;
        const lines = csvContent.split("\n").slice(1);
        let codiPais = "";
        pointsOfInterest = []; // Reset list
        let numId = 0

        for (let i = 0; i < lines.length; i++) {
            numId++;
            const data = lines[i].split(";");
            if (data.length < 10) continue;

            const [pais, codi, ciutat, tipus, nom, direccio, latitud, longitud, puntuacio, horaris, preu, moneda, descripcio] = data;
            codiPais = codi;

            let point;
            switch (tipus.trim()) {
                case "Espai":
                    point = new PuntInteres(numId, false, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio);
                    break;
                case "Atraccio":
                    point = new Atraccio(numId, false, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio, horaris, preu, moneda);
                    break;
                case "Museu":
                    point = new Museu(numId, false, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio, horaris, preu, moneda, descripcio);
                    break;
                default:
                    console.warn(`Tipus desconegut: ${tipus}`);
                    continue;
            }

            if (point) {
                pointsOfInterest.push(point);
            }
        }

        displayPoints();
        await updateCountryInfo(codiPais);
    };

    reader.onerror = () => {
        showMessage("Error reading the file.", "error");
    };

    reader.readAsText(file);
};
//mostar punts Interest
const displayPoints = function () {
    const container = document.getElementById("pointsList");
    container.innerHTML = ""; // Clear previous

    if (pointsOfInterest.length === 0) {
        container.innerHTML = "<p class='no-info'>No hi ha informació per mostrar</p>";
        return;
    }

    pointsOfInterest.forEach((point, index) => {
        console.log(point);
        const div = document.createElement("div");
        div.className = `point-item ${point.tipus.toLowerCase()}`;

        // info
        let pointInfo = `
            <strong>${point.nom}</strong>
            <p>${point.ciutat} | Tipus: ${point.tipus}</p>
        `;

        if (point.tipus.toLowerCase() === "atraccio") {
            pointInfo += `
                <p>Horaris: ${point.preu} | Preu: ${point.preu === 0 ? "Entrada gratuïta" : `${point.preu.toFixed(2)} ${point.moneda ?? ""}`}</p>
         
            `;
        }

        if (point.tipus.toLowerCase() === "museu") {
            pointInfo += `
                <p>Horaris: ${point.puntuacio} | Preu: ${point.moneda}| Descripcio: ${point.puntuacio}</p>
            `;
        }

        div.innerHTML = pointInfo + `
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;

        container.appendChild(div);

        div.querySelector(".delete-btn").addEventListener("click", function () {
            deletePoint(index);
        });
    });

    mapa.mostrarPunts(pointsOfInterest);
};

const filterAndSort = function () {
    let filtered = [...pointsOfInterest];

    // Filter by name
    const searchTerm = document.querySelector("#search").value.toLowerCase();
    filtered = filtered.filter(p => p.nom.toLowerCase().includes(searchTerm));

    // Update the List
    displayFilteredPoints(filtered);

    // update map to show filterd points only
    mapa.mostrarPunts(filtered);
};

const displayFilteredPoints = function (filteredPoints) {
    const container = document.getElementById("pointsList");
    container.innerHTML = ""; // Clear previous

    if (filteredPoints.length === 0) {
        container.innerHTML = "<p class='no-info'>No hi ha informació per mostrar</p>";
        return;
    }

    filteredPoints.forEach((point, index) => {
        const div = document.createElement("div");
        div.className = `point-item ${point.tipus.toLowerCase()}`;

        div.innerHTML = `
            <strong>${point.nom}</strong>
            <p>${point.ciutat} | Tipus: ${point.tipus}</p>
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;

        container.appendChild(div);

        // Add an event listener for delete button
        div.querySelector(".delete-btn").addEventListener("click", function () {
            deletePoint(index);
        });
    });

    mapa.mostrarPunts(filteredPoints);
};



const displayPointsOnMap = function () {
    if (!mapa) {
        console.error("Map instance is not initialized.");
        return;
    }

    if (!pointsOfInterest || pointsOfInterest.length === 0) {
        console.warn("No points of interest available.");
        return;
    }

    console.log("Displaying Points of Interest:", pointsOfInterest);

    mapa.mostrarPunts(pointsOfInterest);
};


const getCountryInfo = async function (codi) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${codi}`);
        const data = await response.json();
        return {
            flag: data[0].flag,
            lat: data[0].latlng[0],
            long: data[0].latlng[1]
        };
    } catch (error) {
        console.error("Error fetching country data:", error);
        return { flag: "", lat: null, long: null };
    }
};

const updateCountryInfo = async function (codi) {
    if (pointsOfInterest.length > 0) {
        const firstPoint = pointsOfInterest[0];
        const countryData = await getCountryInfo(codi);

        if (countryData.flag) {
            document.querySelector("#countryFlag").src = countryData.flag;
        }

        if (countryData.lat && countryData.long) {
            mapa.actualitzarPosInitMapa(countryData.lat, countryData.long);
        }
    }
};
function clearAll() {
    // Clear the array of points
    pointsOfInterest = [];

    // Clear the displayed list
    document.getElementById("pointsList").innerHTML = "<p class='no-info'>No hi ha informació per mostrar</p>";

    // Reset el text de drop zone
    document.querySelector('.dropZone').innerHTML = 'Arrossegar un fitxer CSV aquí per carregar la informació';

    // Clear the search 
    document.querySelector("#search").value = "";

    document.querySelector("#tipus").value = "option1";
    document.querySelector("#ordenacio").value = "asc";

    mapa.borraPunt(); 

}

// Attach event listener to the "Netejar tot" button
document.querySelector(".clear-button").addEventListener("click", clearAll);


const setupEventListeners = function () {
    document.querySelector("#search").addEventListener("input", filterAndSort);
  
};

// Run the setup when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    setupEventListeners();
});

