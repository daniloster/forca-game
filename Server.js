var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var forca = require('./Forca');
//var forca = require('./ForcaWorks');

app.listen(8080);

var clientes = [];

function handler(req, res) {
	if (req.url.indexOf('.js') > -1 || req.url.indexOf('/img/') > -1) {
		fs.readFile(__dirname + req.url,
	  	function (err, data) {
	    	if (err) {
	      		res.writeHead(500);
	      		return res.end('Error loading index.html');
	    	}
	    	res.writeHead(200);
	    	res.end(data);
		});
	} else {
		fs.readFile(__dirname + '/page/index.html',
	  	function (err, data) {
	    	if (err) {
	      		res.writeHead(500);
	      		return res.end('Error loading index.html');
	    	}
	    	res.writeHead(200);
	    	res.end(data);
		});
		
		io.sockets.on('connection', function(socket) {
			var id = Math.random() + '.' + new Date().getTime();
			clientes[id] = socket;
			
			function notificar(evento, participantes, mensagem) {
				console.log(evento, mensagem);
				for (var i in participantes) {
					clientes[participantes[i].id].emit(evento, mensagem);
				}
			}
			
			socket.emit('atualizarMeuID', { participanteID: forca.adicionarParticipante(id, '').id });
			notificar('atualizarHistorico', forca.getParticipantes(), forca.getHistorico());
			notificar('atualizarPartidasEmAndamento', forca.getParticipantes(), forca.getPartidas());
			
			socket.on('criarPartida', function (data) {
				try {
					var partida = forca.criarPartida(data.participanteID, data.palavra);
					socket.emit('atualizarMinhaPartida', partida.resumir());	
					socket.emit('atualizarMeusDados', { participanteID: data.participanteID, nome: data.nome });
				} catch (e) {
					socket.emit('erro', e);
				}
				notificar('atualizarPartidasEmAndamento', forca.getParticipantes(), forca.getPartidas());
			});
			
			socket.on('entrarEmPartida', function (data) {
				console.log('SOCKET entrarEmPartida', data);
				var participante = forca.entrarEmPartida(data.participanteID, data.nome, data.partidaID);
				if (participante.partida) {
					socket.emit('atualizarMinhaPartida', participante.partida.resumir());
					socket.emit('atualizarMeusDados', { participanteID: data.participanteID, nome: data.nome });
					notificar('atualizarPartidasEmAndamento', forca.getParticipantes(), forca.getPartidas());
				}
			});
			
			socket.on('mudarNome', function(data) {
				var participante = forca.obterParticipante(data.participanteID);
				participante.nome = data.nome;
				notificar('atualizarMeuNome', [participante], { nome: data.nome });
			});
			
			socket.on('sugestao', function(sugestao) {
				try {
					var letra = sugestao.letra,
						partidaID = sugestao.partidaID,
						participanteID = sugestao.participanteID,
						partida = forca.sugerirLetra(participanteID, partidaID, letra);
					if (partida) {
						var resumoPartida = partida.resumir();
						notificar('atualizarMinhaPartida', partida.participantes, resumoPartida);
						notificar('atualizarMinhaPartida', [partida.criadaPor], resumoPartida);
						notificar('atualizarPartidasEmAndamento', forca.getParticipantes(), forca.getPartidas());
						if (partida.terminou) {
							notificar('atualizarHistorico', forca.getParticipantes(), forca.getHistorico());
						}
					}
				} catch(e) {
					console.log(e);
					socket.emit('erro', e);
				}
			});
		});
	}
}