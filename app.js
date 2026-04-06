let grafico;

function getDados(){
    return JSON.parse(localStorage.getItem("financas")) || [];
}

function salvarDados(dados){
    localStorage.setItem("financas", JSON.stringify(dados));
}

function mesAtual(){
    let hoje = new Date();
    return hoje.getMonth() + "-" + hoje.getFullYear();
}

function interpretar(texto){

    texto = texto.toLowerCase();

    let valorMatch = texto.match(/\d+/);
    if(!valorMatch) return null;

    let valor = Number(valorMatch[0]);

    let tipo = (
        texto.includes("ganhei") ||
        texto.includes("recebi") ||
        texto.includes("salario") ||
        texto.includes("salário")
    ) ? "receita" : "despesa";

    let categoria = "Outros";

    if(texto.includes("mercado") || texto.includes("comida")) categoria = "Alimentação";
    else if(texto.includes("uber") || texto.includes("gasolina")) categoria = "Transporte";
    else if(texto.includes("cinema")) categoria = "Lazer";

    return { valor, tipo, categoria, descricao:texto };
}

function adicionar(){

    let texto = document.getElementById("texto").value;

    if(!texto) return alert("Digite algo");

    let dado = interpretar(texto);

    if(!dado) return alert("Valor inválido");

    let lista = getDados();

    lista.push({
        id: Date.now(),
        ...dado,
        data: new Date().toISOString()
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

    let todos = getDados();

    let dados = todos.filter(d => {
        let data = new Date(d.data);
        let mes = data.getMonth() + "-" + data.getFullYear();
        return mes === mesAtual();
    });

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

    document.getElementById("mesAtual").innerText =
        new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    atualizarGrafico(categorias);
    gerarIA(receita, despesa, categorias);
}

function atualizarGrafico(categorias){

    let canvas = document.getElementById("grafico");
    if(!canvas) return;

    if(grafico) grafico.destroy();

    grafico = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: Object.keys(categorias),
            datasets: [{
                data: Object.values(categorias),
                backgroundColor: ["#2e7d32","#e53935","#fb8c00","#1e88e5","#8e24aa"]
            }]
        }
    });
}

function gerarIA(receita, despesa, categorias){

    let keys = Object.keys(categorias);

    if(keys.length === 0){
        document.getElementById("iaResumo").innerText = "🤖 Sem dados ainda...";
        return;
    }

    let maior = keys.reduce((a,b)=>
        categorias[a] > categorias[b] ? a : b
    );

    let texto = despesa > receita
        ? "⚠️ Você está gastando mais do que ganha."
        : "✅ Seu saldo está positivo.";

    texto += ` Maior gasto: ${maior}.`;

    document.getElementById("iaResumo").innerText = "🤖 " + texto;
}

function trocarTab(tab, ev){

    document.getElementById("resumoTab").style.display = tab==="resumo" ? "block" : "none";
    document.getElementById("extratoTab").style.display = tab==="extrato" ? "block" : "none";

    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    ev.target.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("btnAdd").addEventListener("click", adicionar);

    carregar();
});y

