const { Extension, HPacket, HDirection} = require('gnode-api');
const fs = require('fs').promises;
const path = require('path');
const { connect } = require('./db');
const Usuario = require('./usuario');

class GEarthManager {
    constructor() {
        this.ext = null;
        this.db = null;
        this.collection_usuarios = null;
        this.usuarios_en_sala = new Map(); // Mapa para almacenar usuarios en sala
    }

    async init() {
        this.db = await connect();
        this.collection_usuarios = this.db.collection('users');
        
        const packageJson = await fs.readFile(path.join(__dirname, 'package.json'), 'utf8');
        const extensionInfo = JSON.parse(packageJson);
        this.ext = new Extension(extensionInfo);

        this._setupInterceptors();
        this.ext.run();
        
        return this;
    }

    async _setupInterceptors() {
        // === Interceptor 1: Usuarios entrando a sala === -> Guarda los datos del usuario en la base de datos si no había entrado antes.
        this.ext.interceptByHeaderId(HDirection.TOCLIENT, 519, async hMessage => {
            const [_, id, username, mision, imagen_keko, index] = hMessage.getPacket().read("iiSSSi");
            const usuario = new Usuario(id, username, index);

            // 1. Agregar usuario a la base de datos
            try {
                await this.collection_usuarios.updateOne(
                    { ID_usuario: usuario.id },
                    { $set: usuario.toObject() },
                    { upsert: true }
                    );
                } catch (error) {
                    console.error(`Error al agregar usuario a la base de datos: ${error}`);
            }
            
            // 2. Agregar usuario al mapa de usuarios en sala
            console.log(`Usuario ${username} ha ingresado a la sala`);
            this.usuarios_en_sala.set(index, usuario);

        });

    }

}

module.exports = new GEarthManager();