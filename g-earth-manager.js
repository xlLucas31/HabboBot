const { Extension, HPacket, HDirection} = require('gnode-api');
const fs = require('fs').promises;
const path = require('path');
const Usuario = require('./usuario');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: "",
});

class GEarthManager {
    constructor() {
        this.ext = null;
        this.usuariosPorIndex = new Map();
        this.chatHistory = new Map(); // Para mantener historial de conversación por usuario
    }

    async init() {
        const packageJson = await fs.readFile(path.join(__dirname, 'package.json'), 'utf8');
        const extensionInfo = JSON.parse(packageJson);
        this.ext = new Extension(extensionInfo);

        this._setupInterceptors();
        this.ext.run();
        
        return this;
    }

    async _getAIResponse(userId, message) {
        try {
            // Obtener o inicializar historial de conversación para el usuario
            if (!this.chatHistory.has(userId)) {
                this.chatHistory.set(userId, [
                    { role: "system", content: "Eres un asistente amigable en un chat de Habbo." }
                ]);
            }
            
            const userHistory = this.chatHistory.get(userId);
            userHistory.push({ role: "user", content: message });

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: userHistory,
                max_tokens: 150
            });

            const aiResponse = completion.choices[0].message.content;
            userHistory.push({ role: "assistant", content: aiResponse });

            return aiResponse;
        } catch (error) {
            console.error('Error al obtener respuesta de OpenAI:', error);
            return "Lo siento, estoy teniendo problemas para responder. Inténtalo más tarde.";
        }
    }

    _setupInterceptors() {
        // Interceptor para usuarios entrando a sala
        this.ext.interceptByHeaderId(HDirection.TOCLIENT, 519, hMessage => {
            const [_, id, username, mision, imagen_keko, index] = hMessage.getPacket().read("iiSSSi");
            console.log(`Usuario ${username} ha ingresado a la sala`);
            
            const usuario = new Usuario(id, username, index);
            this.usuariosPorIndex.set(index, usuario);
        });

        // Interceptor para mensajes de chat
        this.ext.interceptByHeaderId(HDirection.TOCLIENT, 1597, async hMessage => {
            const hPacket = hMessage.getPacket();
            const index = hPacket.readInteger();
            const message = hPacket.readString();
            
            const usuario = this.usuariosPorIndex.get(index);

            if (message.toLowerCase().startsWith('!ai ')) {
                if (!usuario) return;
                
                const prompt = message.substring(4);
                const aiResponse = await this._getAIResponse(usuario.id, prompt);
                this.enviarMensaje(`${usuario.username}, ${aiResponse}`);
            }
        });
    }

    enviarMensaje(mensaje) {
        const hPacket = new HPacket(`{out:Chat}{s:"${mensaje}"}{i:0}{i:3}`);
        this.ext.sendToServer(hPacket);
        console.log(`Mensaje enviado: "${mensaje}"`);
    }

    moverPersonaje(x, y) {
        const hPacket = new HPacket(`{out:MoveAvatar}{i:${x}}{i:${y}}`);
        this.ext.sendToServer(hPacket);
        console.log(`Personaje movido a coordenadas (${x}, ${y})`);
    }
}

module.exports = new GEarthManager();