let carrinho = [];

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
                ? `<button onclick="adicionar('${id}', '${produto.nome}', ${produto.preco})">
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

    function adicionar(id, nome, preco) {

        const itemExistente = carrinho.find(item => item.id === id);

        if (itemExistente) {
            itemExistente.quantidade += 1;
        
        } else {
            carrinho.push({ 
                id, 
                nome, 
                preco, 
                quantidade: 1 
            });
        }
        
        calcularTotal();
        atualizarCarrinho(); //novo
        salvarCarrinho();

        alert("Adicionado ao carrinho!");
    }

    function calcularTotal() {
        total = 0;
        carrinho.forEach(item => {
            total += item.preco * item.quantidade;
        });

        atualizarTotal();
    }

    function removerItem(index) {
        total -= carrinho[index].preco;
        
        carrinho.splice(index, 1);

        atualizarTotal();
        atualizarCarrinho();
        salvarCarrinho();
    }
    function atualizarCarrinho() {
        const div = document.getElementById("carrinho");
        
        div.innerHTML = "";

        carrinho.forEach((item, index) => {
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
        carrinho[index].quantidade += 1;
        calcularTotal();
        atualizarCarrinho();
        salvarCarrinho();
    }

    function diminuir(index) {
        if (carrinho[index].quantidade > 1) {
            carrinho[index].quantidade -= 1;
        } else {
            carrinho.splice(index, 1);
        }
        calcularTotal();
        atualizarCarrinho();
        salvarCarrinho
    }

    function salvarCarrinho() {
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
    }

    function carregarCarrinhoSalvo() {
        const dados = localStorage.getItem("carrinho");
        if (dados) {
            carrinho = JSON.parse(dados);
            calcularTotal();
            atualizarCarrinho();
        }
    }

    function atualizarTotal() {
        const totalDiv = document.getElementById("total");
        
        totalDiv.innerHTML = "Total: R$ " + total.toFixed(2);
    }

    function finalizarPedido() {
        if (carrinho.length === 0) {
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

        carrinho.forEach((item) => {
            mensagem += `- ${item.nome} x${item.quantidade} (R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
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
            itens: carrinho,
            status: "Pendente",//novo campo para status do pedido
            criadoEm: new Date()
        }).then(() => {
            console.log("Pedido salvo no Firestore!");

            Promise.all(
            carrinho.map((item) => {
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
                        estoque: estoqueAtual - 1
                    });
                });
            })
            )
            .then(() => {
                window.open(url, "_blank");

                carrinho = [];
                total = 0;
                atualizarTotal();
                atualizarCarrinho(); // importante para manter a ordem correta do estoque
                localStorage.removeItem("carrinho");
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
