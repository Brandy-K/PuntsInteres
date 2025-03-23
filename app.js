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

const displayPoints = function () {
    const container = document.getElementById("pointsList");
    container.innerHTML = ""; // Clear previous content

    if (pointsOfInterest.length === 0) {
        container.innerHTML = "<p class='no-info'>No hi ha informació per mostrar</p>";
        return;
    }

    // Create a Set to store unique 'tipus' values
    const uniqueTipus = new Set(pointsOfInterest.map(point => point.tipus));

    uniqueTipus.forEach(tipus => {
        const div = document.createElement("div");
        div.className = "point-item";
        div.innerHTML = `<strong>${tipus}</strong>`;
        container.appendChild(div);
    });
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

const filterAndSort = function () {
    let filtered = [...pointsOfInterest];

    // Filter by type
    const selectedType = document.querySelector("#filterType").value;
    if (selectedType !== "Tots") {
        filtered = filtered.filter(p => p.tipus === selectedType);
    }

    // Filter by name
    const searchTerm = document.querySelector("#searchName").value.toLowerCase();
    filtered = filtered.filter(p => p.nom.toLowerCase().includes(searchTerm));

    // Sort
    const order = document.querySelector("#sortOrder").value;
    filtered.sort((a, b) => order === "Ascendent" ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom));

    // Display updated list
    displayFilteredPoints(filtered);
};

const displayFilteredPoints = function (filteredPoints) {
    const listContainer = document.querySelector("#pointsList");
    listContainer.innerHTML = "";

    if (filteredPoints.length === 0) {
        listContainer.innerHTML = "<p>No hi ha informació a mostrar</p>";
        return;
    }

    filteredPoints.forEach(point => {
        const item = document.createElement("div");
        item.classList.add("point-item");
        item.innerHTML = `<strong>${point.nom} - ${point.ciutat}</strong> | Tipus: ${point.tipus}`;
        listContainer.appendChild(item);
    });
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
