var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var forca = require('./Forca');

app.listen(process.env.PORT, process.env.IP);

var logging = console.log;
var trace = function(){
    var parametros = arguments;
    return function() {
        var nomeMetodoChamado = arguments.caller.name;
        logging('@ METODO:', nomeMetodoChamado, '[', parametros, ']');
    };
}

function notificar(evento, participantes, mensagem) {
	trace(evento, mensagem);
    var cliente = null;
	for (var i in participantes) {
        cliente = clientes[participantes[i].id];
        if (cliente) {
            cliente.emit(evento, mensagem);
        }
	}
}

var clientes = [], mensagens = [];

function handler(req, res) {
	if (req.url.indexOf('.js') > -1 || req.url.indexOf('.css') > -1 || req.url.indexOf('/img/') > -1) {
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
			var id = Math.random() + '#' + new Date().getTime();
            trace('Conectado com id', id);
			clientes[id] = socket;
			
			socket.emit('atualizarMeuID', { participanteID: forca.adicionarParticipante(id, '').id });
			notificar('atualizarHistorico', forca.getParticipantes(), forca.getHistorico());
			notificar('atualizarPartidasEmAndamento', forca.getParticipantes(), forca.getPartidas());
            
            
            socket.on('mudarNome', function(data) {
                if (mensagens[data.mensagemID])
                    return;
                mensagens[data.mensagemID] = true;
                trace('mudarNome');
                var participante = forca.obterParticipante(data.participanteID);
                participante.nome = data.nome;
                notificar('atualizarMeuNome', [participante], { nome: data.nome });
            });
            
            socket.on('criarPartida', function (data) {
                if (mensagens[data.mensagemID])
                    return;
                mensagens[data.mensagemID] = true;
                try {
                    trace('criarPartida');
                    var partida = forca.criarPartida(data.participanteID, data.palavra);
                    socket.emit('atualizarMinhaPartida', partida.resumir());	
                    socket.emit('atualizarMeusDados', { participanteID: data.participanteID, nome: data.nome });
                } catch (e) {
                    socket.emit('erro', e);
                }
                notificar('atualizarPartidasEmAndamento', forca.getParticipantes(), forca.getPartidas());
            });
            
            socket.on('entrarEmPartida', function (data) {
                if (mensagens[data.mensagemID])
                    return;
                mensagens[data.mensagemID] = true;
                trace('entrarEmPartida', data);
                var participante = forca.entrarEmPartida(data.participanteID, data.nome, data.partidaID);
                if (participante.partida) {
                    socket.emit('atualizarMinhaPartida', participante.partida.resumir());
                    socket.emit('atualizarMeusDados', { participanteID: data.participanteID, nome: data.nome });
                    notificar('atualizarPartidasEmAndamento', forca.getParticipantes(), forca.getPartidas());
                }
            });
            
            socket.on('sugestao', function(sugestao) {
                if (mensagens[sugestao.mensagemID])
                    return;
                mensagens[sugestao.mensagemID] = true;
                try {
                    trace('sugestao', sugestao);
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
            
            socket.on('sairDaPartida', function (data) {
                if (mensagens[data.mensagemID])
                    return;
                mensagens[data.mensagemID] = true;
                trace('sairDaPartida', data);
                var participante = forca.desistirDePartida(data.participanteID);
                if (participante.partida) {
                    socket.emit('atualizarMinhaPartida', participante.resumir({segredo : '', erros: ''}));
                    notificar('atualizarPartidasEmAndamento', forca.getParticipantes(), forca.getPartidas());
                }
            });
            /*
            socket.on('disconnect', function (data) {
                delete clientes[data.participanteID];
                forca.limparConexaoDoParticipante(data.participanteID);
            });*/
		});
	}
}