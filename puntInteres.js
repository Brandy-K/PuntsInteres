class PuntInteres {
    static totalTasques = 0;
    
    #id;
    #esManual;
    constructor(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio) {
        this.#id = id;
        this.#esManual = esManual;
        this.pais = pais;
        this.ciutat = ciutat;
        this.nom = nom;
        this.direccio = direccio;
        this.tipus = tipus;
        this.latitud = latitud;
        this.longitud = longitud;
        this.puntuacio = puntuacio;
        PuntInteres.totalTasques++;
    }

    get id() {
        return this.#id;
    }

    set id(newId) {
        this.#id = newId;
    }

    get esManual() {
        return this.#esManual;
    }

    set esManual(value) {
        this.#esManual = value;
    }

    static obtenirTotalElements() {
        return PuntInteres.totalTasques;
    }
}

class Atraccio extends PuntInteres {
    constructor(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio, horaris, preu, moneda) {
        super(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio);
        this.horaris = horaris;
        this.preu = parseFloat(preu) || 0;
        this.moneda = moneda;
    }

    get preuIva() {
        const IVA = 0.21;
        if (this.preu === 0) return "Entrada gratuïta";
        return `${(this.preu * (1 + IVA)).toFixed(2)}${this.moneda} (IVA)`;
    }
}

class Museu extends PuntInteres {
    constructor(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio, horaris, preu, moneda, descripcio) {
        super(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio);
        this.horaris = horaris;
        this.preu = parseFloat(preu) || 0;
        this.moneda = moneda;
        this.descripcio = descripcio;
    }

    get preuIva() {
        const IVA = 0.21;
        if (this.preu === 0) return "Entrada gratuïta";
        return `${(this.preu * (1 + IVA)).toFixed(2)}${this.moneda} (IVA)`;
    }
}
