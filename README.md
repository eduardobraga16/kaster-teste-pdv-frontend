# PDV — Frontend

Frontend desenvolvido com React + TypeScript.


## Funcionalidades

* Busca de produtos por nome ou EAN
* Adição de produtos ao carrinho
* Alteração de quantidade e remoção de itens
* Cálculo do total da venda
* Seleção da forma de pagamento
* Cálculo de troco para pagamentos em dinheiro
* Finalização da venda através da API
* Consulta de vendas realizadas
* Visualização do resumo/comprovante da venda
* Persistência temporária do carrinho no `localStorage`

O total da venda é recalculado e validado pelo backend no momento da finalização.

## Como executar

Instale as dependências:

npm install

Execute o projeto:

npm run dev


O frontend espera que o backend Laravel esteja em:

http://localhost:8000

## Login Padrão

E-mail: admin@admin.com 
Senha: 123

## Estrutura

O projeto possui uma estrutura simples, separando as páginas, componentes e serviços responsáveis pela comunicação com a API.

A prioridade foi entregar um PDV funcional, com código organizado e regras importantes de negócio sendo garantidas pelo backend.
