//modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

// modulos internos
const fs = require("fs")

operation()

function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: "action",
            message: "O que você deseja fazer?",
            choices: ['Criar Conta', "Consultar Saldo", "Depositar", 'Sacar', 'Sair'],
        },
    ])
    .then((answer) => { // Recebe a ação que o usuário escolheu
        const action = answer['action']
        if(action == 'Criar Conta'){
            createAccount()
        }else if(action == 'Depositar') {
            deposit()

        }else if(action == 'Consultar Saldo') {
            getAccountBalance()

        }else if(action == 'Sacar') {
            widthdraw()

        } else if(action == 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
            process.exit()
        }

    })
    .catch((err) => console.log(err))
}


// create account
function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))
    buildAccount()
}

function buildAccount() {
    inquirer.prompt([
        {
            name: "accountName",
            message: 'Digite o nome para a sua conta: '
        }

    ]).then((answer) => {
        const accountName = answer['accountName']
        console.info(accountName)

        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(
                chalk.bgRed.black('Esta conta já existe, escolha um outro nome!')
            )
            buildAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function(err) {
            console.log(err)
        })

        console.log(chalk.green("conta criada com sucesso!"))
        operation()
        return

    }).catch((err) => console.log(err))
}


// add an amount to user account
function deposit() {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual é o nome da sua conta?"
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        //verify if account exists
        if(!checkAccount(accountName)){
            return deposit()
        }

        inquirer.prompt([
            {
                name: "amount",
                message: "Quanto você quer depositar?"
            }
        ])
        .then((answer) => {
            const amount = answer['amount']


            //add an amount
            addAmount(accountName, amount)
            operation()
        })
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))
}


function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Conta não encontrada, favor tentar novamente!'))
        return false
    }

    return true
}

function addAmount(accountName, amount) {

        const accountData = getAccount(accountName)

        if(!amount) {
            console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
            return deposit()
        }

        accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
        
        fs.writeFileSync(
            `accounts/${accountName}.json`,
            JSON.stringify(accountData),
            function(err){
                console.log(err)
            }
        )


        console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: "r"
    })

    return JSON.parse(accountJSON)
}


// Show account balance
function getAccountBalance(){
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?"
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        //verify if account exists
        if(!checkAccount(accountName)){
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(
                `Olá, o saldo da sua conta é de R$${accountData.balance}`
            ),
        )
        operation()
    })
    .catch(err => console.log(err))
}

function widthdraw() {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?"
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)) {
            return widthdraw()
        }

        
        inquirer.prompt([
            {
                name: "amount",
                message: "Quanto você deseja sacar?"
            }
        ])
        .then((answer) => {
            const amount = answer['amount']

            subtractAmount(accountName, amount)
            operation()
        })
        .catch((err) => console.log(err))

    })
    .catch((err) => console.log(err))
}


function subtractAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    // verify if amount an exists
    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return widthdraw()
    }
    
    if(parseFloat(amount) < parseFloat(accountData.balance)){
        accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
        
        fs.writeFileSync(
            `accounts/${accountName}.json`,
            JSON.stringify(accountData),
            function(err){
                console.info(err)
            }
        )

        console.log(chalk.green(`Saque realizado com sucesso! Novo saldo é de: ${accountData.balance}`))
    } else {
        console.log(chalk.bgRed.black('Conta não possui saldo suficiente para o saque desejado! Tente novamente mais tarde!'))
    }
}