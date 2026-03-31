let carrinho = [];

//const produtos = [
    //{ nome: "Bolo Caseiro de Chocolate Cacau 50%" , peso: 1.32, estoque: 10, preco: 65.00 },
   // { nome: "Bolo Caseiro de Cacau 50% com Maracujá" , peso: 1.32, estoque: 8, preco: 65.00 },
   // { nome: "Bolo Caseiro de Cacau 50% com Cupu" , peso: 1.32, estoque: 5, preco: 65.00 },
   // { nome: "Bolo Caseiro Pequeno de Cacau 50% com Cupu" , peso: 0.790, estoque: 5, preco: 45.00 },
   // { nome: "Bolo Caseiro de Limão" , peso: 0.730, estoque: 5, preco: 45.00 },
   // { nome: "Bolo Caseiro de Maracujá" , peso: 0.730, estoque: 5, preco: 45.00 }
//];

    function carregarprodutos() {
        const div = 
        document.getElementById("produtos");
        
        //produtos.forEach((produto, index) => {
            div.innerHTML = "";
            // <div class="produto"> comentei para não aparecer os produtos na tela, mas o código continua aqui caso queira reativar
            //     <h3>${produto.nome}</h3>
            //     <p>Peso: ${produto.peso} kg</p>
            //     <p>Estoque: ${produto.estoque}</p>
            //     <p>Preço: R$ ${produto.preco.toFixed(2)}</p>

            //     <button onclick="adicionar('${index}')">Adicionar</button>
            // </div>
            // `;
        db.collection("produtos").get().then((snapshot) => {
            snapshot.forEach((doc) => {
                const produto = doc.data();
                const id = doc.id;
                div.innerHTML += `
                <div class="produto">
                <h3>${produto.nome}</h3>
                <p>Disponível: ${produto.estoque}</p>
                <p>Preço: R$ ${produto.preco.toFixed(2)}</p>
                <button onclick="adicionar('${id}', '${produto.nome}', ${produto.preco})">Adicionar</button>
                </div>
                `;
            });
        });
    }

    function adicionar(id, nome, preco) {
    carrinho.push({ id, nome, preco });
    alert("Adicionado ao carrinho!");
}

    function finalizarPedido() {
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

         db.collection("pedidos").add({
            nome: nome,
            celular: celular,
            endereco: endereco,
            pagamento: pagamento,
            itens: carrinho,
            criadoEm: new Date()
        }).then(() => {
            console.log("Pedido salvo no Firestore!");
        })
        .catch((error) => {
            console.error("Erro ao salvar pedido: ", error);
        });

        carrinho.forEach((item) => {
            mensagem += "- " + item.nome + " (R$ " + item.preco.toFixed(2) + ")\n";
        });

        mensagem += "\n💰 Pagamento: " + pagamento;

        const numero = "5597981024922";

        const url = 
        `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, "_blank");
    }
     
        carregarprodutos();
