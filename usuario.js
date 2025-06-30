class Usuario {
    constructor(id, username, index) {
        this.id = id;
        this.username = username;
        this.index = index;
        console.log(`Usuario agregado: ${username} (ID: ${id}, Index: ${index})`);
    }

    toObject() {
        return {
            ID_usuario: this.id,
            username: this.username,
        };
    }

    getUsername() {
        return this.username;
    }
}

module.exports = Usuario;