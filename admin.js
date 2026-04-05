console.log("Admin script carregado com sucesso!");

function carregarPedidos() {
    const div = document.getElementById("pedidos");

    div.innerHTML = "";

    db.collection("pedidos").onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {

            const pedido = doc.data();
            
            let itensHTML = "";

            let statusColor = "#999";
                    if (pedido.status === "pendente") statusColor = "orange";
                    if (pedido.status === "preparando") statusColor = "blue";
                    if (pedido.status === "entregue") statusColor = "green";

            pedido.itens.forEach(item => {
                const quantidade = item.quantidade || 1; // Garantir que quantidade seja pelo menos 1
                const preco = item.preco || 0; // Garantir que preço seja pelo menos 0

                itensHTML += `
                <li>
                    ${item.nome} x${quantidade}
                    (R$ ${(preco * quantidade).toFixed(2)})
                </li>
                `;
            });

            div.innerHTML += `
                <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 10px;">
                    <h3>👤${pedido.nome}</h3>
                    <p>📞${pedido.celular}</p>
                    <p>📍${pedido.endereco}</p>
                    <p>💳${pedido.pagamento}</p>
                    <p><strong>🛒Itens:</strong></p>
                    <ul>
                        ${itensHTML}
                    </ul>

                    <p>Status: <strong>${pedido.status}</strong></p>
                    
                    <button onclick="atualizarStatus('${doc.id}', 'pendente')">🟡</button>

                    <button onclick="atualizarStatus('${doc.id}', 'preparando')">🟠</button>

                    <button onclick="atualizarStatus('${doc.id}', 'entregue')">🟢</button>

                    <hr>

                </div>
            `;
        });
    });
}

function atualizarStatus(id, novoStatus) {
    db.collection("pedidos").doc(id).update({
        status: novoStatus
    })
    .then(() => {
        console.log("Status atualizado com sucesso!");
    })
    .catch((error) => {
        console.error("Erro ao atualizar status: ", error);
    });
}

carregarPedidos();