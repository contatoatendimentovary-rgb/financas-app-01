let db;
let grafico;

// 👉 Abrir banco IndexedDB
const request = indexedDB.open("financasDB", 1);

request.onupgradeneeded = function(e) {
    db = e.target.result;
    db.createObjectStore("lancamentos", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function(e) {
    db = e.target.result;
    carregar();
};

// 👉 Mês atual
function mesAtual(){
    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                   "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    let hoje = new Date();
    return meses[hoje.getMonth()] + "/" + hoje.getFullYear();
}
document.getElementById("mesAtual").innerText = mesAtual();

// 👉 Tabs
function trocarTab(tab){
    document.getElementById('resumoTab').style.display = tab==='resumo'?'block':'none';
    document.getElementById('extratoTab').style.display = tab==='extrato'?'block':'none';
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    event.target.classList.add('active');
}

// 👉 Interpretar texto
function interpretarTexto(texto){
    texto = texto.toLowerCase();
    let valor = parseFloat(texto.match(/\d+/));
    let tipo = (texto.includes("ganhei")||texto.includes("recebi")||texto.includes("salario")||texto.includes("salário")) ? "receita":"despesa";
    let categoria = "Outros";
    if(texto.includes("mercado")||texto.includes("comida")) categoria="Alimentação";
    else if(texto.includes("uber")||texto.includes("gasolina")) categoria="Transporte";
    else if(texto.includes("cinema")) categoria="Lazer";
    return { valor, tipo, categoria, descricao:texto };
}

// 👉 Adicionar lançamento
function adicionar(){
    let texto = document.getElementById('texto').value;
    if(!texto) return;
    let dados = interpretarTexto(texto);
    const tx = db.transaction("lancamentos","readwrite");
    const store = tx.objectStore("lancamentos");
    store.add({...dados, data:new Date().toISOString()});
    tx.oncomplete = ()=> {
        document.getElementById('texto').value="";
        carregar();
    };
}

// 👉 Deletar lançamento
function deletar(id){
    const tx = db.transaction("lancamentos","readwrite");
    const store = tx.objectStore("lancamentos");
    store.delete(id);
    tx.oncomplete = ()=> carregar();
}

// 👉 Carregar lançamentos
function carregar(){
    const tx = db.transaction("lancamentos","readonly");
    const store = tx.objectStore("lancamentos");
    const req = store.getAll();
    req.onsuccess = function(){
        const dados = req.result;
        let receita=0, despesa=0, categorias={};
        let lista = document.getElementById('lista');
        lista.innerHTML="";
        dados.forEach(d=>{
            if(d.tipo==="receita") receita+=d.valor; else despesa+=d.valor;
            categorias[d.categoria] = (categorias[d.categoria]||0)+d.valor;
            lista.innerHTML+=`<div class="item">
                <span>${d.descricao}</span>
                <span class="${d.tipo}">${d.valor} <span class="delete" onclick="deletar(${d.id})">❌</span></span>
            </div>`;
        });
        document.getElementById('receita').innerText=receita;
        document.getElementById('despesa').innerText=despesa;
        document.getElementById('saldo').innerText=receita-despesa;
        atualizarGrafico(categorias);
        gerarIA(receita, despesa, categorias);
    };
}

// 👉 Atualizar gráfico
function atualizarGrafico(categorias){
    if(grafico) grafico.destroy();
    grafico = new Chart(document.getElementById('grafico'), {
        type:'pie',
        data:{ labels:Object.keys(categorias), datasets:[{ data:Object.values(categorias) }] }
    });
}

// 👉 Gerar análise IA
function gerarIA(receita, despesa, categorias){
    let maior = Object.keys(categorias).reduce((a,b)=> categorias[a]>categorias[b]?a:b,"Outros");
    let texto = despesa>receita? "⚠️ Você está gastando mais do que ganha.":"✅ Seu saldo está positivo.";
    texto += ` Maior gasto: ${maior}.`;
    document.getElementById('iaResumo').innerText = "🤖 "+texto;
}
