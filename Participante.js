function Participante(id, nome) {
	this.id = id;
	this.nome = nome;
	this.partida = null;
}

Participante.prototype.resumir = function Participante_resumir(opt) {
    if (!opt) {
        opt = {};
    }
    opt.id = this.id;
    opt.nome = this.nome;
    opt.partidaID = this.partida ? this.partida.id : null;
    return opt;
}

module.exports = {
	criar: function(id, nome) {
		return new Participante(id, nome);
	},
    resumir: Participante.resumir
}