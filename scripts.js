const Modal = {
    open() { //Abrir Modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close() { // Fechar modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

const Storage = {
    get () {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },
    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
    },
}

const Transactions = {
    all: Storage.get(),
    
    add(transaction) {
        Transactions.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transactions.all.splice(index, 1)

        App.reload()

    },
    income() {
        let income = 0

        Transactions.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income
    },
    expense() {
        let expense = 0

        Transactions.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })

        return expense
    },
    total() {
        let total = 0

        total = Transactions.income() + Transactions.expense()

        return total
    }
}

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransactions(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransactions(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const html =

            `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td>${transaction.date}</td>
        <td>
        <img onclick="Transactions.remove(${(index)})" src="./assets/minus.svg" alt="Remover">
        </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transactions.income())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transactions.expense())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transactions.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }

    },
    validateFields() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error('Preencha todos os campos!')
        }

    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        //Previne a atuação padrão do formulário (alterar URL)
        event.preventDefault()

        try {
            //verifica se os campos estão preenchidos
            Form.validateFields()
            //formata os dados
            const transaction = Form.formatValues()
            //salvar
            Transactions.add(transaction)
            //Limpar campos do modal
            Form.clearFields()
            //Fechar Modal
            Modal.close()

        } catch (error) {
            alert(error.message)
        }


    }

}


Storage.set('')
Storage.get()

const App = {
    init() {
        Transactions.all.forEach(DOM.addTransaction)

        DOM.updateBalance()
        Storage.set(Transactions.all)
    },

    reload() {
        DOM.clearTransactions()

        App.init()
        Storage.set(Transactions.all)
    },
}

App.init()