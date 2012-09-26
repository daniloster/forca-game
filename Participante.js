function Participante(id, nome) {
	this.id = id;
	this.nome = nome;
	this.partida = null;
}

module.exports = {
	criar: function(id, nome) {
		return new Participante(id, nome);
	}
}