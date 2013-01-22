String.prototype.replaceAll = function(match, to) {
	var str = this;
	while (str.indexOf(match) > -1) {
		str = str.replace(match, to);
	}
	return str;
};

function erro(mensagem) {
    $('#erro').html(mensagem);
    setTimeout(function() {
        $('#erro').html('');
    }, 4000);
}

(function($){
	$(document).ready(function() {
        $('body').keyboard({
            keyboard: 'qwerty',
            clickHandler: function (el, args) {
                console.log('clickhandler:', args.text);
                if (partidaID) {    
                    socket.emit('sugestao', { 
                        letra: args.text,
                        partidaID: partidaID,
                        participanteID: participanteID
                    });
                }
            }
        });

        $('#btnKeyboard').click(function () {
            $('.keyboard').slideToggle();
        });
		
		var partidaID = false,
			participanteID = false,
			nome = false,
			socket = io.connect(document.location.protocol + '//' + document.location.hostname + ':' + document.location.port);
		
        socket.on('connect', function () {
            $('#btnAlterarNome').removeAttr("disabled");
        });
        
		socket.on('atualizarMeuID', function(data) {
            console.log('Atualizando ID...');
			if (!participanteID) {
				participanteID = data.participanteID;
			}
		});
		
		socket.on('atualizarMeuNome', function(data) {
            console.log('Atualizando nome...');
			if (participanteID && data.nome) {
				nome = data.nome;
                $('.menuToolBar li').show();
                $('#lblNome').html(nome + ', you has joined!');
				$('#lblNome').show();
				$('#nome').hide();
                $('#btnAlterarNome').hide();
			}
		});
			
		socket.on('atualizarMinhaPartida', function(data) {
            console.log('Atualizando minha partida...');
			$('#segredo').html(data.segredo);
			$('#erros').attr('src', '/img/' + data.erros + '.png');
			partidaID = data.partidaID;
			if (partidaID) {
                $('#minhaPartida').css('visibility', 'visible');
			} else {
                $('#minhaPartida').css('visibility', 'hidden');
			}
            if (data.segredo.indexOf('*') < 0) {
                $('.keyboard').slideDown();
            }
		});
		
		socket.on('erro', function(data) {
			erro(data);
		});
		
		socket.on('atualizarHistorico', function(historico) {
            console.log('Atualizando históricos...');
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
            console.log('Atualizando partidas em andamento...');
			$('#partidasEmAndamento').html('');
			for (var i = 0; i < partidasEmAndamento.length; i++) {
				var id = new Date().getTime();
				var html = "<div class='partidaDisponivel'><span class='palavraDaPartida'>{palavra}</span><span class='jogadoresDaPartida'>{jogadores}</span><button id='{id}' class='btn btn-inverse btnEntraNaPartida'>Join</button></div>"
				.replaceAll("{palavra}", partidasEmAndamento[i].segredo)
				.replaceAll("{jogadores}", partidasEmAndamento[i].participantes)
				.replaceAll("{id}", id);
				$('#partidasEmAndamento').append($(html));
				$('#' + id).click((function(partida) {
					return function() {
						entrarEmJogo(partida.id);
					};
				})(partidasEmAndamento[i]));
			}
		});
		
		function criarJogo() {
    		if(nome === '') {
				erro('Please, type your name.');
				return;
			}
			//var novaPalavra = $('#txtNovaPalavra').val();
            var novaPalavra = document.getElementById('txtNovaPalavra').value;
			if (novaPalavra === '') {
				erro('Please, type a word.');
				return;
			}
            document.getElementById('txtNovaPalavra').value = '';
			socket.emit('criarPartida', { mensagemID: participanteID + '@' + new Date().getTime(), participanteID: participanteID, nome: nome, palavra: novaPalavra });
		}
        
        function entrarEmJogo(id) {
			socket.emit('entrarEmPartida', { mensagemID: participanteID + '@' + new Date().getTime(), participanteID: participanteID, nome: nome, partidaID: id });
		}
        
        function sairDaPartida() {
            socket.emit('sairDaPartida', { mensagemID: participanteID + '@' + new Date().getTime(), participanteID: participanteID, partidaID: id });
        }
		
		function mudarNome() {
			if (participanteID) {
				var nome = $('#nome').val();
				if(nome === "") {
					erro('Please, type your name.');
					return;
				}
				socket.emit('mudarNome', { mensagemID: participanteID + '@' + new Date().getTime(), participanteID: participanteID, nome: nome });
			}
		}
        
        $('#btnNovaPalavra').popover({
            placement: 'bottom',
            trigger: 'manual',
            animation: true,
            html: true,
            title: 'Create a new challenge',
            content: $('#div-popover').html() // Adiciona o conteúdo da div oculta para dentro do popover.
        }).click(function (e) {
            e.preventDefault();
            // Exibe o popover.
            $(this).popover('show');
        });
        
        $('#txtNovaPalavra').focus(function() {
            var el = $(this);
            if (el.val() === 'Type here a word.') {
                el.val('');
            }
        });

        $('#btnEnviarNovaPalavra').live('click', function (e) {
            $('#btnNovaPalavra').popover('hide');
            criarJogo();
        });
        
        $('btnSair').click(function(e){
            sairDaPartida();
        });
        
        $('#nome').focus(function() {
            var el = $(this);
            if (el.val() === 'Type your nickname.') {
                el.val('');
            }
        });
        
		$('#btnAlterarNome').click(function(e) {
            mudarNome();
        });
	});
})(jQuery);