String.prototype.replaceAll = function(match, to) {
	var str = this;
	while (str.indexOf(match) > -1) {
		str = str.replace(match, to);
	}
	return str;
};
(function($){
	$(document).ready(function() {
		
		var partidaID = false,
			participanteID = false,
			nome = false,
			socket = io.connect('http://daniloster.forca-game.jit.su:8080');
		
		socket.on('atualizarMeuID', function(data) {
			if (!participanteID) {
				participanteID = data.participanteID;
			}
		});
		
		$('#minhaPartida').hide();
		
		socket.on('atualizarMeuNome', function(data) {
			if (participanteID && data.nome) {
				nome = data.nome;
				$('#headerName').html(nome);
				$('#lblNome').hide();
				$('#nome').hide();
				$('#enviarNome').hide();
				$('#novaPalavra').val('');
				$('#minhaPartida').show();
			}
		});
			
		socket.on('atualizarMinhaPartida', function(data) {
			$('#segredo').html(data.segredo);
			$('#erros').attr('src', '/img/' + data.erros + '.png');
			partidaID = data.partidaID;
			if (partidaID) {	
				document.body.onkeypress = function enviar(evt) {
					socket.emit('sugestao', { 
						letra: String.fromCharCode(evt.charCode),
						partidaID: partidaID,
						participanteID: participanteID
					});
				};
			} else {
				document.body.onkeypress = function(){};
			}
		});
		
		socket.on('erro', function(data) {
			$('#erro').html(data);
		});
		
		socket.on('atualizarHistorico', function(historico) {
			$('#historico').html('');
			for (var i = 0; i < historico.length; i++) {
				var html = "<div><h2>{palavra}</h2><p>Author: {criadaPor}</p><p>Guests: {participantes}</p><img src='/img/{erros}.png' style='width:60px;height:80px;'/></div>"
				.replaceAll("{palavra}", historico[i].palavra)
				.replaceAll("{participantes}", historico[i].participantes)
				.replaceAll("{criadaPor}", historico[i].criadaPor)
				.replaceAll("{erros}", historico[i].erros);
				$('#historico').append($(html));
			}
		});
		
		socket.on('atualizarPartidasEmAndamento', function(partidasEmAndamento) {
			$('#partidasEmAndamento').html('');
			for (var i = 0; i < partidasEmAndamento.length; i++) {
				var id = new Date().getTime();
				var html = "<div><span>{palavra}</span><span>{jogadores}</span><input type='button' value='Join' id='{id}' /></div>"
				.replaceAll("{palavra}", partidasEmAndamento[i].segredo)
				.replaceAll("{jogadores}", partidasEmAndamento[i].participantes)
				.replaceAll("{id}", id);
				$('#partidasEmAndamento').append($(html));
				$('#' + id).click((function(partida) {
					return function() {
						entrarEmJogo(partida.id);
					}
				})(partidasEmAndamento[i]));
			}
		});
		
		function mudarNome() {
			if (participanteID) {
				var nome = $('#nome').val();
				
				if(nome == "") {
					$('#erro').html('Please, type your name.');
					return;
				}
				socket.emit('mudarNome', { participanteID: participanteID, nome: nome });
			}
		}
		
		$('#enviarNome').click(mudarNome);
		
		function entrarEmJogo(id) {
			socket.emit('entrarEmPartida', { participanteID: participanteID, nome: nome, partidaID: id });
		}
		
		function criarJogo() {
			var novaPalavra = $('#novaPalavra').val();
			
			if (novaPalavra == "") {
				$('#erro').html('Please, type a word.');
				return;
			}
			if(nome == "") {
				$('#erro').html('Please, type your name.');
				return;
			}
			socket.emit('criarPartida', { participanteID: participanteID, nome: nome, palavra: novaPalavra });
		}
		
		$('#novoJogo').click(criarJogo);
	});
})(jQuery);