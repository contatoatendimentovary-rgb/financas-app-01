let grafico;

function getDados(){
    return JSON.parse(localStorage.getItem("financas")) || [];
}

function salvarDados(dados){
    localStorage.setItem("financas", JSON.stringify(dados));
}

function interpretar(texto){
    texto = texto.toLowerCase();

    let valorMatch = texto.match(/\d+/);
    if(!valorMatch) return null;

    let valor = Number(valorMatch[0]);

    let tipo = texto.includes("ganhei") || texto.includes("recebi") 
        ? "receita" : "despesa";

    let categoria = "Outros";

    if(texto.includes("mercado")) categoria = "Alimentação";
    else if(texto.includes("uber") || texto.includes("gasolina")) categoria = "Transporte";
    else if(texto.includes("cinema")) categoria = "Lazer";

    return { valor, tipo, categoria, descricao: texto };
}

function adicionar(){
    let texto = document.getElementById("texto").value;

    if(!texto) return alert("Digite algo");

    let dado = interpretar(texto);
    if(!dado) return alert("Valor inválido");

    let lista = getDados();

    lista.push({
        id: Date.now(),
        ...dado
    });

    salvarDados(lista);

    document.getElementById("texto").value = "";

    carregar();
}

function deletar(id){
    let lista = getDados();
    lista = lista.filter(d => d.id !== id);
    salvarDados(lista);
    carregar();
}

function carregar(){
    let dados = getDados();

    let receita = 0;
    let despesa = 0;
    let categorias = {};

    let lista = document.getElementById("lista");
    lista.innerHTML = "";

    dados.forEach(d => {
        let valor = Number(d.valor) || 0;

        if(d.tipo === "receita") receita += valor;
        else despesa += valor;

        categorias[d.categoria] = (categorias[d.categoria] || 0) + valor;

        lista.innerHTML += `
        <div class="item">
            <span>${d.descricao}</span>
            <span class="${d.tipo}">
                ${valor.toFixed(2)}
                <span class="delete" onclick="deletar(${d.id})">❌</span>
            </span>
        </div>`;
    });

    document.getElementById("receita").innerText = receita.toFixed(2);
    document.getElementById("despesa").innerText = despesa.toFixed(2);
    document.getElementById("saldo").innerText = (receita - despesa).toFixed(2);

    gerarIA(receita, despesa, categorias);
}

function gerarIA(receita, despesa, categorias){
    let maior = Object.keys(categorias).length
        ? Object.keys(categorias).reduce((a,b)=> categorias[a] > categorias[b] ? a : b)
        : "Nenhum";

    let texto = despesa > receita
        ? "⚠️ Você está gastando mais do que ganha."
        : "✅ Seu saldo está positivo.";

    texto += ` Maior gasto: ${maior}.`;

    document.getElementById("iaResumo").innerText = "🤖 " + texto;
}

document.getElementById("btnAdd").addEventListener("click", adicionar);

carregar();
