class Usuario {
    constructor(id, username, index) {
        this.id = id;
        this.username = username;
        this.index = index;
        console.log(`Usuario agregado: ${username} (ID: ${id}, Index: ${index})`);
    }

    getUsername() {
        return this.username;
    }
}

module.exports = Usuario;