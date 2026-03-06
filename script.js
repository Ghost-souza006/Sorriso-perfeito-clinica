document.addEventListener('DOMContentLoaded', () => {
    // -------------------- Tema --------------------
    const temaBtn = document.getElementById('temaBtn');
    const temaIcon = document.getElementById('temaIcon');

    if (temaBtn && temaIcon) {
        temaBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            temaIcon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        });
    }

    // -------------------- Carrossel --------------------
    const itens = Array.from(document.querySelectorAll('.carrossel-item'));
    if (itens.length > 0) {
        let indiceAtual = itens.findIndex(i => i.classList.contains('ativo'));
        if (indiceAtual === -1) indiceAtual = 0;
        const totalItens = itens.length;

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        function mostrarIndice(novoIndice, direcao = 1) {
            const atual = itens[indiceAtual];
            const proximo = itens[novoIndice];

            atual.classList.remove('ativo');
            atual.classList.add('sair');

            setTimeout(() => {
                atual.classList.remove('sair');
                proximo.classList.add('ativo');
                indiceAtual = novoIndice;
            }, 350);
        }

        function mover(direcao) {
            const novo = (indiceAtual + direcao + totalItens) % totalItens;
            mostrarIndice(novo, direcao);
        }

        if (prevBtn) prevBtn.addEventListener('click', () => mover(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => mover(1));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') mover(-1);
            if (e.key === 'ArrowRight') mover(1);
        });
    }

    // -------------------- Formulário de agendamento --------------------
    const formAgendamento = document.getElementById('formAgendamento');
    const formFeedback = document.getElementById('formFeedback');

    if (formAgendamento && formFeedback) {
        const cepInput = formAgendamento.querySelector('#cep');
        const ruaInput = formAgendamento.querySelector('#rua');
        const cidadeInput = formAgendamento.querySelector('#cidade');
        const estadoInput = formAgendamento.querySelector('#estado');
        let cepValido = false;

        async function buscarEnderecoPorCep(cep) {
            const cepLimpo = cep.replace(/\D/g, '');

            if (cepLimpo.length !== 8) {
                formFeedback.textContent = '❌ CEP deve conter 8 dígitos.';
                formFeedback.style.color = '#c0392b';
                cepValido = false;
                if (ruaInput) ruaInput.value = '';
                if (cidadeInput) cidadeInput.value = '';
                if (estadoInput) estadoInput.value = '';
                return;
            }

            try {
                const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                const dados = await response.json();

                if (dados.erro) {
                    formFeedback.textContent = '❌ CEP não encontrado.';
                    formFeedback.style.color = '#c0392b';
                    cepValido = false;
                    if (ruaInput) ruaInput.value = '';
                    if (cidadeInput) cidadeInput.value = '';
                    if (estadoInput) estadoInput.value = '';
                    return;
                }

                if (ruaInput) ruaInput.value = dados.logradouro || '';
                if (cidadeInput) cidadeInput.value = dados.localidade || '';
                if (estadoInput) estadoInput.value = dados.uf || '';
                cepValido = true;
                formFeedback.textContent = '✓ CEP validado com sucesso!';
                formFeedback.style.color = '#27ae60';
            } catch (erro) {
                formFeedback.textContent = '❌ Erro ao buscar CEP. Tente novamente.';
                formFeedback.style.color = '#c0392b';
                cepValido = false;
                console.error('[api-cep] erro:', erro);
            }
        }

        if (cepInput) {
            cepInput.addEventListener('blur', (e) => {
                const cepValor = e.target.value.trim();
                if (cepValor) buscarEnderecoPorCep(cepValor);
            });
        }

        formAgendamento.addEventListener('submit', (e) => {
            e.preventDefault();

            const dados = {
                nome: formAgendamento.querySelector('#nome')?.value.trim() || '',
                email: formAgendamento.querySelector('#email')?.value.trim() || '',
                telefone: formAgendamento.querySelector('#telefone')?.value.trim() || '',
                cep: formAgendamento.querySelector('#cep')?.value.trim() || '',
                rua: formAgendamento.querySelector('#rua')?.value.trim() || '',
                cidade: formAgendamento.querySelector('#cidade')?.value.trim() || '',
                estado: formAgendamento.querySelector('#estado')?.value.trim() || ''
            };

            if (!dados.nome || !dados.email || !dados.telefone || !dados.cep || !dados.rua || !dados.cidade || !dados.estado) {
                formFeedback.textContent = 'Por favor, preencha os campos obrigatórios.';
                formFeedback.style.color = '#c0392b';
                return;
            }

            if (!cepValido) {
                formFeedback.textContent = '❌ Por favor, valide o CEP antes de enviar.';
                formFeedback.style.color = '#c0392b';
                return;
            }

            formFeedback.textContent = 'Pedido enviado com sucesso! Em breve entraremos em contato.';
            formFeedback.style.color = '#27ae60';
            formAgendamento.reset();
            cepValido = false;
        });
    }

    // -------------------- Clima em tempo real --------------------
    const cidadeClimaInput = document.getElementById('cidadeClima');
    const buscarClimaBtn = document.getElementById('buscarClimaBtn');
    const climaResultado = document.getElementById('climaResultado');

    function obterDescricaoClima(codigo) {
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
        return mapa[codigo] || { icon: '🌈', label: 'Condições desconhecidas' };
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
        