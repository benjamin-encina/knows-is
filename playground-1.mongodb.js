const { use } = require("react");

use('taller');
db.createCollection('alumnos');

use
db.alumnos.insertOne(
    {
        nombre: 'Juan Perez'
        carrera: 'Informática'

    }
)