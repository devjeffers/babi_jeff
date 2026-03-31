const produtos = [
    { nome: "Bolo Caseiro de Chocolate Cacau 50%" , peso: 1.32, estoque: 10, preco: 65.00 },
    { nome: "Bolo Caseiro de Cacau 50% com Maracujá" , peso: 1.32, estoque: 8, preco: 65.00 },
    { nome: "Bolo Caseiro de Cacau 50% com Cupu" , peso: 1.32, estoque: 5, preco: 65.00 },
    { nome: "Bolo Caseiro de Cacau 50% com Cupu" , peso: 0.790, estoque: 5, preco: 45.00 },
    { nome: "Bolo Caseiro de Limão" , peso: 0.730, estoque: 5, preco: 45.00 }, 
    { nome: "Bolo Caseiro de Maracujá" , peso: 0.730, estoque: 5, preco: 45.00 },];

    function carregarProdutos() {
        const div = 
        document.getElementById("produtos");
        
        produtos.forEach((produto) => {
            div.innerHTML += `
            <div class="produto">
                <h3>${produto.nome}</h3>
                <p>Peso: ${produto.peso} kg</p>
                <p>Estoque: ${produto.estoque}</p>
                <p>Preço: R$ ${produto.preco.toFixed(2)}</p>

                <button onclick="pedir('${produto.nome}')">Pedir</button>
            </div>
            `;
        });
    }

    function pedir(nome) {
        alert("Você escolheu: " + nome);}
        carregarProdutos();
