function Partida(palavra, segredo, autor) {
	this.palavra = palavra;
	this.segredo = segredo;
	this.id = Math.random() + '.' + new Date().getTime();
	this.criadaPor = autor;
	this.participantes = [];
	this.erros = 0;
	this.terminou = false;
};

Partida.prototype.adicionarParticipante = function Partida_adicionarParticipante(participante) {
	if (this.criadaPor.id !== participante.id) {
		var partidaNaoTemJogador = true;
		for (var i = 0; i < this.participantes.length; i++) {
			if (this.participantes[i].id == participante.id) {
				partidaNaoTemJogador = false;
				break;
			}
		}
		if (partidaNaoTemJogador) {
			this.participantes.push(participante);
			participante.partida = this;
			return true;
		}
	}
	return false;
};

Partida.prototype.removerParticipante = function Partida_removerParticipante(participante) {
    if (this.criadaPor.id !== participante.id) {
		var indiceParticipante = null;
		for (var i = 0; i < this.participantes.length; i++) {
			if (this.participantes[i].id == participante.id) {
				indiceParticipante = i;
				break;
			}
		}
		if (indiceParticipante) {
			delete this.participantes[indiceParticipante];
			participante.partida = null;
			return participante;
		}
	}
	return participante;
};

Partida.prototype.finalizar = function Partida_finalizar() {
	this.terminou = true;
	var nomesParticipantes = false;
	for (var i = 0; i < this.participantes.length; i++) {
		if (nomesParticipantes) {
			nomesParticipantes += ', ' + this.participantes[i].nome;
		} else {
			nomesParticipantes = this.participantes[i].nome;
		}
	}
	return {
		erros: this.erros,
		criadaPor: this.criadaPor.nome,
		participantes: nomesParticipantes,
		palavra: this.palavra
	};
};

Partida.prototype.sugerirLetra = function Partida_sugerirLetra(letra, participanteID) {
	if (this.terminou) {
		throw 'The game has finished.';
	}
	if (!this.participantes.some(function(participante) { return participante.id === participanteID; })) {
		throw 'You must join at this game to guess a letter.';
	}
	if (this.criadaPor.id === participanteID) {
		throw 'The author can not guess a letter.';
	}
	var arr = this.segredo.split(''),
		acertou = false;
	for (var i = 0; i < this.palavra.length; i++) {
		if (this.palavra.charAt(i) == letra){
			arr[i] = letra;
			acertou = true;
		}
	}
	this.segredo = arr.join('');
	if (!acertou) {
		this.erros = this.erros + 1;
	}
	return acertou;
};

Partida.prototype.deveFinalizar = function Partida_deveFinalizar() {
	return (this.segredo.indexOf('*') < 0 || this.erros >= 6);	
};

Partida.prototype.resumir = function Partida_resumir() {
	return {
		partidaID: this.id,
		segredo: this.segredo,
		participantes: this.participantes.length,
		terminou: this.terminou,
		erros: this.erros
	};
};

module.exports = {
	criar: function(palavra, segredo, autor) {
		return new Partida(palavra, segredo, autor);
	}
}