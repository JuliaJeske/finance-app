// Definicoes do popUp de transacao
const Modal = {
  open(){
    //Abrir modal
    //Adicionar a class active ao modal
    document
    .querySelector(".modal-overlay")
    .classList
    .add ("active")
  },
  close(){
    //fechar o modal
    //remover a class active do modal
    document
    .querySelector(".modal-overlay")
    .classList
    .remove("active")
  }
}


// Armazena os dados de transacoes no localStorage do navegador
const Storage = {
  // Pega os dados de transacoes
  get() {
    let data = JSON.parse(localStorage.getItem("my.finance:transactions")) || []
    return data
  },

  // salva a transacao
  set(transaction) {

    localStorage.setItem("my.finance:transactions",JSON.stringify(transaction))
  }
}

// Classe de transactions
const Transactions = {
  all: Storage.get(),
  
  // adiciona uma transacao
  add(transaction) {
    Transactions.all.push(transaction)

    App.reload()
  },

  // remove uma transacao  
  remove(index) {
    Transactions.all.splice(index,1)

    App.reload()
  },

  // le as entradas (transacoes positivas)
  incomes() {
    //somas as entradas
    let income = 0;

    Transactions.all.forEach((transaction) => {
      if( transaction.amount > 0){
        income += transaction.amount;
      }
    })

    return income;
  },

  // le as saidas (transacoes negativas)
  expenses() {
    //somar as saidas
    let expense = 0;

    Transactions.all.forEach((transaction) => {
      if (transaction.amount < 0){
        expense += transaction.amount;
      }
    })

    return expense;
  },

  // junta entradas e saidas retornando a diferenca
  total(){
    //entradas-saidas
    return Transactions.incomes() + Transactions.expenses();
  }
}

// CARA QUE LIDA COM TODA ALTERACAO NO HTML
const DOM = {

  transactionsContainer: document.querySelector('#data-table tbody'),
  
  addTransaction(transaction, index) {
    // cria uma linha de tabela
    const tr = document.createElement('tr')

    // insere o retorno da funcao innerHTML na linha
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)

    // define o index dessa linha
    tr.dataset.index = index
    
    // adiciona a linha
    DOM.transactionsContainer.appendChild(tr)
  },

  // Cria o html da linha da tabela (transacao)
  innerHTMLTransaction(transaction, index) {

    // Define a classe (para entrada e saida)
    const CSSclass = transaction.amount > 0 ? "income" : "expense"

    // retorna o valor da transacao formatado
    const amount = Utils.formatCurrency(transaction.amount)

    // Criando um html com valores personalizados
    const html = ` 
    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
        <img onclick="Transactions.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
    </td>
    `

    // retorna o html da linha de transacao pronto para entrar na pagina
    return html
  },
  
  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transactions.incomes())

    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transactions.expenses())
    
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transactions.total())
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
  }
}

const Utils = {
  // formata o valor 
  formatAmount(value){

    value = Number(value.replace(/\,\./g,"")) * 100

    return Math.round(value)
  },

  // formata as datas
  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  // formata os valores para moeda
  formatCurrency(value){
    const signal = Number(value) < 0 ? "-" : ""

    value = String (value).replace(/\D/g, "") 
    value= Number(value) /100
    value=value.toLocaleString("pt-BR",{
      style: "currency",
      currency:"BRL"
    })

    return signal + value 
  }
}

const Form ={
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  // retorna um objeto com as informacoes da transation
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  // valida os campos do formulario
  validateFields() {
    const { description, amount, date } = Form.getValues()

    if (description.trim() === "" ||
        amount.trim() === "" || 
        date.trim === "" ) {

          throw new Error('Por favor,preencha todos os campos')
    }
  },

  // formata os valores do formulario
  formatValues(){
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  // limpa os campos do formulario
  clearFields(){
    Form.description.value=""
    Form.amount.value=""
    Form.date.value=""
  },

  // envia o evento do formulario
  submit(event){
    event.preventDefault()

    try{ 
      Form.validateFields() // valida se todos campos sao validos

      const transaction = Form.formatValues()

      Transactions.add(transaction) // adiciona uma transacao

      
      Form.clearFields()

      Modal.close() //fechar popup de transacao  
    }

    catch(error){
      alert(error.message)
    }
    
  }
}

const App={
  init() {
    Transactions.all.forEach(DOM.addTransaction)
    
    DOM.updateBalance() 
    
    Storage.set(Transactions.all)
  },
  
  reload() {
    DOM.clearTransactions()
    App.init()
  },
}

App.init()


