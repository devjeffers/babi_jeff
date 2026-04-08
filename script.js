let listaCarrinho = [];

let total = 0;

    function carregarprodutos() {
        const div = 
        document.getElementById("produtos");
        
            div.innerHTML = "";

        db.collection("produtos").onSnapshot((snapshot) => {
            div.innerHTML = "";

            snapshot.forEach((doc) => {
                const produto = doc.data();
                const id = doc.id;
                
                div.innerHTML += `
                <div class="produto">
                <h3>${produto.nome}</h3>
                <p>
                ${produto.estoque > 0 
                    ? `Disponível: ${produto.estoque}` 
                    : `<span style="color:red;">ESGOTADO</span>`
                }
                </p>
                <p>Preço: R$ ${produto.preco.toFixed(2)}</p>
                ${produto.estoque > 0 
                ? `<button onclick="adicionar('${id}', '${produto.nome}', '${produto.preco}', ${produto.estoque})">
                        Adicionar
                    </button>`
                : `<button disabled style="background: gray;">
                        Esgotado
                    </button>`
                }
                </div>
                `;
            });
        });
    }

    function adicionar(id, nome, preco, estoque) {

        const itemExistente = listaCarrinho.find(item => item.id === id);

        if (itemExistente) {
            if (itemExistente.quantidade >= estoque) {
            alert("❌Quantidade máxima disponível atingida!")
                return;
            }

            itemExistente.quantidade += 1;

        } else {
                listaCarrinho.push({ 
                id, 
                nome, 
                preco, 
                quantidade: 1,
                estoque //novo
         
            });
        }
        
        calcularTotal();
        atualizarCarrinho(); //novo
        salvarCarrinho();

        alert("Adicionado ao carrinho!");
    }

    function calcularTotal() {
        total = 0;
        listaCarrinho.forEach(item => {
            total += item.preco * item.quantidade;
        });

        atualizarTotal();
    }

    function removerItem(index) {
        total -= listaCarrinho[index].preco * listaCarrinho[index].quantidade;
        
        listaCarrinho.splice(index, 1);

        atualizarTotal();
        atualizarCarrinho();
        salvarCarrinho();
    }
    function atualizarCarrinho() {
        const div = document.getElementById("lista-carrinho");
        
        div.innerHTML = "";

        listaCarrinho.forEach((item, index) => {
            div.innerHTML += `
                <div style="margin-bottom: 10px;">
                    <strong>${item.nome}</strong><br>
                    
                    <button onclick="diminuir(${index})">➖</button>
                    ${item.quantidade}

                    <button onclick="aumentar(${index})">➕</button>
                  
                    <br>

                    R$ ${(item.preco * item.quantidade).toFixed(2)}

                <button onclick="removerItem(${index})">❌</button>

                <hr>

                </div>
            `;
        });
    }

    function aumentar(index) {
        const item = listaCarrinho[index];

        db.collection("produtos").doc(item.id).get().then((doc) => {
            const estoqueAtual = doc.data().estoque;
            
        if (item.quantidade >= item.estoque) {
            alert("❌Quantidade máxima disponível atingida!");
            return;
        }

        item.quantidade += 1;

       // listaCarrinho[index].quantidade += 1;

        calcularTotal();
        atualizarCarrinho();
        salvarCarrinho();
    });
    }

    function diminuir(index) {
        if (listaCarrinho[index].quantidade > 1) {
            listaCarrinho[index].quantidade -= 1;
        } else {
            listaCarrinho.splice(index, 1);
        }
        calcularTotal();
        atualizarCarrinho();
        salvarCarrinho();
    }

    function salvarCarrinho() {
        localStorage.setItem("lista-carrinho", JSON.stringify(listaCarrinho));
    }

    function carregarCarrinhoSalvo() {
        const dados = localStorage.getItem("lista-carrinho");
        if (dados) {
            listaCarrinho = JSON.parse(dados);

            listaCarrinho.forEach((item, index) => {

                db.collection("produtos").doc(item.id).get().then((doc) => {
                    if (doc.exists) {
                        const produto = doc.data();
                        listaCarrinho[index].estoque = produto.estoque; //atualiza o estoque do item no carrinho
            
                    calcularTotal();
                    atualizarCarrinho();
                    }
                });
            });
        }
    }

    function atualizarTotal() {
        const totalDiv = document.getElementById("total");
        
        totalDiv.innerHTML = "Total: R$ " + total.toFixed(2);
    }

    function finalizarPedido() {
        if (listaCarrinho.length === 0) {
        alert("Adicione itens ao carrinho!");
        return;
}
        const nome = document.getElementById("nome").value;
        const celular = document.getElementById("celular").value;
        const endereco = document.getElementById("endereco").value;
        const pagamento = document.getElementById("pagamento").value;
   
        let mensagem = "🍰 *Novo Pedido* 🍰\n\n";

        mensagem += "👤 Nome: " + nome + "\n";
        mensagem += "📞 Celular: " + celular + "\n";
        mensagem += "🏠 Endereço: " + endereco + "\n";

        mensagem += "🛒 Pedido: \n";


        if (!nome || !celular || !endereco || !pagamento) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        listaCarrinho.forEach((item) => {
            mensagem += `- ${item.nome} x${item.quantidade} (R$ ${(item.preco * item.quantidade).toFixed(2)})\n`;
        });

        mensagem += "\n💰 Pagamento: " + pagamento;
        
        mensagem += `\n💰 Total: R$ ${total.toFixed(2)}`;

        const numero = "5597981024922";

        const url = 
        `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

        if (!nome || !celular || !endereco || !pagamento) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

         db.collection("pedidos").add({
            nome: nome,
            celular: celular,
            endereco: endereco,
            pagamento: pagamento,
            itens: listaCarrinho,
            status: "Pendente",//novo campo para status do pedido
            criadoEm: new Date()

        }).then(() => {
            console.log("Pedido salvo no Firestore!");

            Promise.all(
            listaCarrinho.map((item) => {
                const ref = db.collection("produtos").doc(item.id);

                return db.runTransaction(async (transaction) => {
                    const doc = await transaction.get(ref);

                    if (!doc.exists) {
                        throw "Produto não existe!";
                    }

                    let estoqueAtual = doc.data().estoque;

                    if (estoqueAtual <= 0) {
                        throw `Produto ${item.nome} esgotado!`;
                    }

                    transaction.update(ref, {
                        estoque: estoqueAtual - item.quantidade
                    });
                });
            })
            )
            .then(() => {
                window.open(url, "_blank");

                listaCarrinho = [];
                total = 0;
                atualizarTotal();
                atualizarCarrinho(); // importante para manter a ordem correta do estoque
                localStorage.removeItem("lista-carrinho");
            })
            .then(() => {
                console.log("Estoque atualizado com sucesso!");
            })
            .catch((error) => {
                alert(error);
            });
        });
    }

    carregarprodutos();
    carregarCarrinhoSalvo();
