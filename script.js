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

    // interação via teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') mover(-1);
        if (e.key === 'ArrowRight') mover(1);
    });

    console.log('[carrossel] inicializado com sucesso');
});

 document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('formAgendamento');
            const feedback = document.getElementById('formFeedback');

            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const dados = {
                    nome: form.nome.value.trim(),
                    email: form.email.value.trim(),
                    telefone: form.telefone.value.trim(),
                    mensagem: form.mensagem.value.trim(),
                };

                console.log('[agendamento] envio solicitado', dados);

                // validação simples
                if (!dados.nome || !dados.email || !dados.telefone) {
                    feedback.textContent = 'Por favor, preencha os campos obrigatórios.';
                    feedback.style.color = '#c0392b';
                    console.warn('[agendamento] validação falhou');
                    return;
                }

                // aqui você poderia enviar os dados para um servidor via fetch
                // ex: fetch('/api/agendar', { method: 'POST', body: JSON.stringify(dados) })

                // Simular sucesso localmente
                feedback.textContent = 'Pedido enviado com sucesso! Em breve entraremos em contato.';
                feedback.style.color = '#117a8b';
                console.log('[agendamento] formulário válido — simulação de envio concluída');

                form.reset();
            });
        });
        