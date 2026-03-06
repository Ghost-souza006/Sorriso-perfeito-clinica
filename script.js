document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("temaBtn");
    const icon = document.getElementById("temaIcon");

    btn.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            icon.textContent = "☀️";
        } else {
            icon.textContent = "🌙";
        }
    });
});

// Carrossel: logs e carregamento seguro
document.addEventListener('DOMContentLoaded', () => {
    console.log('[carrossel] DOM carregado');

    const itens = Array.from(document.querySelectorAll('.carrossel-item'));
    if (!itens || itens.length === 0) {
        console.warn('[carrossel] Nenhum item encontrado. Verifique o HTML.');
        return;
    }

    let indiceAtual = itens.findIndex(i => i.classList.contains('ativo'));
    if (indiceAtual === -1) indiceAtual = 0;
    const totalItens = itens.length;
    console.log(`[carrossel] total de itens: ${totalItens}, índice inicial: ${indiceAtual}`);

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    function mostrarIndice(novoIndice, direcao = 1) {
        console.log(`[carrossel] mudando de ${indiceAtual} para ${novoIndice} (direção ${direcao})`);
        const atual = itens[indiceAtual];
        const proximo = itens[novoIndice];

        // animação de saída
        atual.classList.remove('ativo');
        atual.classList.add('sair');

        // depois da animação, ajustar classes
        setTimeout(() => {
            atual.classList.remove('sair');
            proximo.classList.add('ativo');
            indiceAtual = novoIndice;
            console.log(`[carrossel] índice atualizado para ${indiceAtual}`);
        }, 350);
    }

    function mover(direcao) {
        const novo = (indiceAtual + direcao + totalItens) % totalItens;
        mostrarIndice(novo, direcao);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => mover(-1));
    else console.warn('[carrossel] botão anterior não encontrado (prevBtn)');

    if (nextBtn) nextBtn.addEventListener('click', () => mover(1));
    else console.warn('[carrossel] botão próximo não encontrado (nextBtn)');

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') mover(-1);
        if (e.key === 'ArrowRight') mover(1);
    });

    console.log('[carrossel] inicializado com sucesso');
});

 document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('formAgendamento');
    const feedback = document.getElementById('formFeedback');
    const cepInput = form?.querySelector('#cep');
    const ruaInput = form?.querySelector('#rua');
    const cidadeInput = form?.querySelector('#cidade');
    const estadoInput = form?.querySelector('#estado');

    if (!form) return;

    // Flag para rastrear se o CEP foi validado com sucesso
    let cepValido = false;

    // Função para buscar endereço na API ViaCEP
    async function buscarEnderecoPorCep(cep) {
        const cepLimpo = cep.replace(/\D/g, '');

        if (cepLimpo.length !== 8) {
            feedback.textContent = '❌ CEP deve conter 8 dígitos.';
            feedback.style.color = '#c0392b';
            cepValido = false;
            ruaInput.value = '';
            cidadeInput.value = '';
            estadoInput.value = '';
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const dados = await response.json();

            if (dados.erro) {
                feedback.textContent = '❌ CEP não encontrado.';
                feedback.style.color = '#c0392b';
                cepValido = false;
                ruaInput.value = '';
                cidadeInput.value = '';
                estadoInput.value = '';
                return;
            }

            // Preenche os campos automaticamente
            ruaInput.value = dados.logradouro || '';
            cidadeInput.value = dados.localidade || '';
            estadoInput.value = dados.uf || '';
            cepValido = true;
            feedback.textContent = '✓ CEP validado com sucesso!';
            feedback.style.color = '#27ae60';
            console.log('[api-cep] endereço encontrado:', dados);
        } catch (erro) {
            feedback.textContent = '❌ Erro ao buscar CEP. Tente novamente.';
            feedback.style.color = '#c0392b';
            cepValido = false;
            console.error('[api-cep] erro:', erro);
        }
    }

    // Listener no campo CEP
    if (cepInput) {
        cepInput.addEventListener('blur', (e) => {
            const cepValor = e.target.value.trim();
            if (cepValor) {
                buscarEnderecoPorCep(cepValor);
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const dados = {
            nome: form.querySelector('#nome')?.value.trim() || '',
            email: form.querySelector('#email')?.value.trim() || '',
            telefone: form.querySelector('#telefone')?.value.trim() || '',
            cep: form.querySelector('#cep')?.value.trim() || '',
            rua: form.querySelector('#rua')?.value.trim() || '',
            cidade: form.querySelector('#cidade')?.value.trim() || '',
            estado: form.querySelector('#estado')?.value.trim() || '',
            mensagem: form.querySelector('#mensagem')?.value.trim() || ''
        };

        console.log('[agendamento] envio solicitado', dados);

        // Validação dos campos obrigatórios
        if (!dados.nome || !dados.email || !dados.telefone || !dados.cep || !dados.rua || !dados.cidade || !dados.estado) {
            feedback.textContent = 'Por favor, preencha os campos obrigatórios.';
            feedback.style.color = '#c0392b';
            console.warn('[agendamento] validação falhou');
            return;
        }

        // Validação do CEP - impede envio se CEP for inválido
        if (!cepValido) {
            feedback.textContent = '❌ Por favor, valide o CEP antes de enviar.';
            feedback.style.color = '#c0392b';
            console.warn('[agendamento] CEP não foi validado');
            return;
        }

        feedback.textContent = 'Pedido enviado com sucesso! Em breve entraremos em contato.';
        feedback.style.color = '#27ae60';
        console.log('[agendamento] formulário válido — simulação de envio concluída');

        form.reset();
        cepValido = false;
    });

    // ---------- API de clima em tempo real ----------
    const cidadeClimaInput = document.getElementById('cidadeClima');
    const buscarClimaBtn = document.getElementById('buscarClimaBtn');
    const climaResultado = document.getElementById('climaResultado');

    function obterDescricaoClima(codigo) {
        // Mapeamento de códigos de clima para emoji + texto (Open-Meteo)
        const mapa = {
            0: { icon: '☀️', label: 'Céu limpo' },
            1: { icon: '🌤️', label: 'Poucas nuvens' },
            2: { icon: '⛅', label: 'Parcialmente nublado' },
            3: { icon: '☁️', label: 'Nublado' },
            45: { icon: '🌫️', label: 'Nevoeiro' },
            48: { icon: '🌫️', label: 'Nevoeiro com cristais de gelo' },
            51: { icon: '🌦️', label: 'Chuvisco leve' },
            53: { icon: '🌦️', label: 'Chuvisco moderado' },
            55: { icon: '🌧️', label: 'Chuvisco forte' },
            56: { icon: '🌧️', label: 'Chuva congelante leve' },
            57: { icon: '🌧️', label: 'Chuva congelante forte' },
            61: { icon: '🌧️', label: 'Chuva fraca' },
            63: { icon: '🌧️', label: 'Chuva moderada' },
            65: { icon: '🌧️', label: 'Chuva forte' },
            66: { icon: '🌧️', label: 'Chuva congelante leve' },
            67: { icon: '🌧️', label: 'Chuva congelante forte' },
            71: { icon: '🌨️', label: 'Neve leve' },
            73: { icon: '🌨️', label: 'Neve moderada' },
            75: { icon: '🌨️', label: 'Neve forte' },
            77: { icon: '🌨️', label: 'Granizo' },
            80: { icon: '🌦️', label: 'Chuva de intensidade variável' },
            81: { icon: '🌧️', label: 'Chuva forte' },
            82: { icon: '🌧️', label: 'Chuva muito forte' },
            85: { icon: '🌨️', label: 'Neve fraca' },
            86: { icon: '🌨️', label: 'Neve forte' },
            95: { icon: '⛈️', label: 'Trovoadas' },
            96: { icon: '⛈️', label: 'Trovoadas com granizo' },
            99: { icon: '⛈️', label: 'Trovoadas fortes com granizo' }
        };
        const condicao = mapa[codigo];
        if (!condicao) return { icon: '🌈', label: 'Condições desconhecidas' };
        return condicao;
    }

    function getDirecaoDoVento(grau) {
        const direcoes = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(((grau % 360) / 22.5)) % 16;
        return direcoes[index];
    }

    function exibirClima(mensagemHtml, isError = false) {
        if (!climaResultado) return;
        climaResultado.innerHTML = mensagemHtml;
        climaResultado.style.color = isError ? '#c0392b' : '#27ae60';
    }

    async function buscarClimaPorCidade(cidade) {
        const nomeCidade = (cidade || '').trim();
        if (!nomeCidade) {
            exibirClima('Digite uma cidade para ver o clima.', true);
            return;
        }

        try {
            exibirClima('Buscando clima…');

            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nomeCidade)}&count=1&language=pt&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData || !geoData.results || geoData.results.length === 0) {
                exibirClima('Cidade não encontrada. Verifique o nome e tente novamente.', true);
                return;
            }

            const place = geoData.results[0];
            const { latitude, longitude, name, country, admin1 } = place;

            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
            const weatherRes = await fetch(weatherUrl);
            const weatherData = await weatherRes.json();

            if (!weatherData || !weatherData.current_weather) {
                exibirClima('Não foi possível obter os dados do clima agora. Tente novamente mais tarde.', true);
                return;
            }

            const { temperature, windspeed, winddirection, weathercode } = weatherData.current_weather;
            const local = `${name}${admin1 ? `, ${admin1}` : ''}${country ? ` - ${country}` : ''}`;
            const clima = obterDescricaoClima(weathercode);
            const ventoDir = getDirecaoDoVento(winddirection);

            exibirClima(`
                <strong>${clima.icon} ${local}</strong><br>
                🌡️ ${temperature.toFixed(1)}°C&nbsp;&nbsp;💨 ${windspeed.toFixed(1)} km/h (${ventoDir})<br>
                ${clima.label}
            `);
        } catch (erro) {
            console.error('[api-clima] erro:', erro);
            exibirClima('Erro ao buscar o clima. Verifique a conexão e tente novamente.', true);
        }
    }

    if (buscarClimaBtn) {
        buscarClimaBtn.addEventListener('click', () => {
            buscarClimaPorCidade(cidadeClimaInput?.value);
        });
    }

});
        