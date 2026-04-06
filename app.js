document.addEventListener("DOMContentLoaded", function(){

    function getDados(){
        return JSON.parse(localStorage.getItem("financas")) || [];
    }

    function salvarDados(dados){
        localStorage.setItem("financas", JSON.stringify(dados));
    }

    function atualizarTela(){

        let dados = getDados();

        let receita = 0;
        let despesa = 0;

        let lista = document.getElementById("lista");
        lista.innerHTML = "";

        dados.forEach(d => {

            let valor = Number(d.valor);

            if(d.tipo === "receita") receita += valor;
            else despesa += valor;

            lista.innerHTML += `
            <div class="item">
                <span>${d.descricao}</span>
                <span class="${d.tipo}">
                    ${valor.toFixed(2)}
                    <span onclick="deletar(${d.id})">❌</span>
                </span>
            </div>`;
        });

        document.getElementById("receita").innerText = receita.toFixed(2);
        document.getElementById("despesa").innerText = despesa.toFixed(2);
        document.getElementById("saldo").innerText = (receita - despesa).toFixed(2);
    }

    function interpretar(texto){

        texto = texto.toLowerCase();

        let valorMatch = texto.match(/\d+/);
        if(!valorMatch) return null;

        let valor = Number(valorMatch[0]);

        let tipo = texto.includes("ganhei") ? "receita" : "despesa";

        return { valor, tipo, descricao:texto };
    }

    document.getElementById("btnAdd").onclick = function(){
    alert("clicou"); // TESTE
            alert("Digite algo");
            return;
        }

        let dado = interpretar(texto);

        if(!dado){
            alert("Digite valor válido");
            return;
        }

        let lista = getDados();

        lista.push({
            id: Date.now(),
            ...dado
        });

        salvarDados(lista);

        document.getElementById("texto").value = "";

        atualizarTela();
    });

    window.deletar = function(id){

        let lista = getDados();

        lista = lista.filter(d => d.id !== id);

        salvarDados(lista);

        atualizarTela();
    }

    atualizarTela();

});
