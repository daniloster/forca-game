var Partida = require('./Partida'),
	Participante = require('./Participante');

var Forca = {
	palavras:[],
	partidas:[],
	participantes:[],
	historico:[],
	obterParticipante: function(participanteID) {
		for (var i = 0; i < Forca.participantes.length; i++) {
			if (Forca.participantes[i].id == participanteID) {
				var encontrado = Forca.participantes[i];
				return encontrado;
			}
		}
		return null;
	},
	sugerirLetra: function(participanteID, partidaID, letra) {
		var partida = Forca.obterPartida(partidaID);
		partida.sugerirLetra(letra, participanteID);
		if (partida.deveFinalizar()) {
			Forca.finalizarPartida(partida);
		}
		return partida;
	},
	criarSegredo: function(palavra) {
		var arr = palavra.split('');
		for (var i = 0; i < palavra.length; i++) {
			arr[i] = '*';
		}
		return arr.join('');
	},
	existePartida: function(palavra) {
		return Forca.palavras[palavra] === true ? true : false;
	},
	obterPartida: function(id) {
		for (var i = 0; i < Forca.partidas.length; i++) {
			if (Forca.partidas[i].id == id) {
				return Forca.partidas[i];
			}
		}
		return null;
	},
	criarPartida: function(particitanteID, novaPalavra) {
		console.log('@@@@@@ criarPartida', particitanteID, 'palavra', novaPalavra, 'DataLog', new Date().toDateString());
		if (Forca.existePartida(novaPalavra)) {
			throw 'It already a game running with this word.';
		}
		Forca.palavras[novaPalavra] = true;
		var partida = Partida.criar(novaPalavra, Forca.criarSegredo(novaPalavra), Forca.obterParticipante(particitanteID));
		Forca.partidas.push(partida);
		return partida;
	},
	entrarEmPartida: function(participanteID, nome, id) {
		var partida = (id) ? Forca.obterPartida(id) : null;
		var participante = Forca.obterParticipante(participanteID);
		if (partida) {
			partida.adicionarParticipante(participante);
			return participante;
		} else {
			throw 'This game is running no more';
		}
	},
	adicionarParticipante: function(participanteID, nome) {
		var participante = Participante.criar(participanteID, nome)
		Forca.participantes.push(participante);
		return participante;
	},
	finalizarPartida: function(partida) {
		Forca.removerPartida(partida.id);
		Forca.historico.push(partida.finalizar());
		if (Forca.historico.length > 20) {
			Forca.historico.shift();
		}
	},
	removerPartida: function(partidaID) {
		for (var i = 0; Forca.partidas.length; i++) {
			if (Forca.partidas[i].id === partidaID) {
				var partida = Forca.partidas[i];
				Forca.partidas.splice(i, 1);
				try {
					Forca.palavras.splice(partida.palavra, 1);
				} catch (e) { console.log('ERRO AO REMOVER PALAVRA', e) }
				return partida;
			}
		}
		return null;
	}
};

module.exports = {
	getHistorico: function() {
		return Forca.historico;
	},
	getPartidas: function() {
		var part = [];
		for (var i = 0; i < Forca.partidas.length; i++) {
			part.push({ 
				segredo: Forca.partidas[i].segredo,
				participantes: Forca.partidas[i].participantes.length,
				id: Forca.partidas[i].id,
				erros: Forca.partidas[i].erros
			});
		}
		return part;
	},
	getParticipantes: function() {
		return Forca.participantes;
	},
	obterParticipante: Forca.obterParticipante,
	criarPartida: Forca.criarPartida,
	sugerirLetra: Forca.sugerirLetra,
	desistirDePartida: Forca.desistirDePartida,
	entrarEmPartida: Forca.entrarEmPartida,
	adicionarParticipante: Forca.adicionarParticipante
}
	
