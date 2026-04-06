// ===== BANCO LOCAL =====
function getDados(){
    try {
        return JSON.parse(localStorage.getItem("financas")) || [];
    } catch {
        return [];
    }
}

function salvarDados(dados){
    localStorage.setItem("financas", JSON.stringify(dados));
}

// ===== IA DE INTERPRETAÇÃO =====
function interpretar(texto){
    texto = texto.toLowerCase();

    let valorMatch = texto.match(/\d+(\.\d+)?/);
    if(!valorMatch) return null;

    let valor = Number(valorMatch[0]);

    let tipo = (
        texto.includes("ganhei") ||
        texto.includes("recebi") ||
        texto.includes("salario")
    ) ? "receita" : "despesa";

    let categoria = "Outros";

    if(texto.includes("mercado")) categoria = "Alimentação";
    else if(texto.includes("uber") || texto.includes("gasolina")) categoria = "Transporte";
    else if(texto.includes("cinema") || texto.includes("lazer")) categoria = "Lazer";

    return { valor, tipo, categoria, descricao: texto };
}

// ===== ADICIONAR =====
function adicionar(){
    let input = document.getElementById("texto");
    let texto = input.value.trim();

    if(!texto) return alert("Digite algo");

    let dado = interpretar(texto);
    if(!dado) return alert("Não consegui entender o valor");

    let lista = getDados();

    lista.push({
        id: Date.now(),
        ...dado
    });

    salvarDados(lista);

    input.value = "";

    carregar();
}

// ===== DELETAR =====
function deletar(id){
    let lista = getDados();
    lista = lista.filter(d => d.id !== id);
    salvarDados(lista);
    carregar();
}

// ===== CARREGAR TELA =====
function carregar(){
    let dados = getDados();

    let receita = 0;
    let despesa = 0;
    let categorias = {};

    let lista = document.getElementById("lista");

    if(!lista) return;

    lista.innerHTML = "";

    dados.forEach(d => {
        let valor = Number(d.valor) || 0;

        if(d.tipo === "receita"){
            receita += valor;
        } else {
            despesa += valor;
        }

        categorias[d.categoria] = (categorias[d.categoria] || 0) + valor;

        lista.innerHTML += `
        <div class="item">
            <span>${d.descricao}</span>
            <span class="${d.tipo}">
                R$ ${valor.toFixed(2)}
                <span class="delete" onclick="deletar(${d.id})">❌</span>
            </span>
        </div>`;
    });

    document.getElementById("receita").innerText = receita.toFixed(2);
    document.getElementById("despesa").innerText = despesa.toFixed(2);
    document.getElementById("saldo").innerText = (receita - despesa).toFixed(2);

    gerarIA(receita, despesa, categorias);
}

// ===== IA RESUMO =====
function gerarIA(receita, despesa, categorias){
    let maior = "Nenhum";

    if(Object.keys(categorias).length > 0){
        maior = Object.keys(categorias).reduce((a,b)=>
            categorias[a] > categorias[b] ? a : b
        );
    }

    let texto = "";

    if(despesa > receita){
        texto = "⚠️ Você está gastando mais do que ganha.";
    } else {
        texto = "✅ Seu saldo está positivo.";
    }

    texto += ` Maior gasto: ${maior}.`;

    let ia = document.getElementById("iaResumo");
    if(ia){
        ia.innerText = "🤖 " + texto;
    }
}

// ===== INICIALIZAÇÃO SEGURA =====
document.addEventListener("DOMContentLoaded", () => {
    let btn = document.getElementById("btnAdd");

    if(btn){
        btn.addEventListener("click", adicionar);
    }

    carregar();
});
