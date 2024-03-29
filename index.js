//modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')
//modulos internos
const fs = require("fs")

operation()

function operation() {
    inquirer //utiliza o inquirer para criar um prompt de lista (list) em uma aplicação Node.js
        .prompt([
            {
                type: 'list',//Define o tipo de prompt que será exibido
                name: 'action',//É a chave pela qual a resposta do usuário será armazenada. Quando o usuário selecionar uma opção na lista, a resposta será armazenada na chave especificada aqui
                message: 'O que você deseja fazer?',//É a mensagem exibida para o usuário, uma pergunta que aparece antes da lista de opções
                choices: [
                    'Criar Conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair']
                // É um array que contém as opções disponíveis para o usuário escolher na lista.
            },
        ]).then(answer => {
            const action = answer['action']
            if (action == 'Criar Conta') {
                createAccount()
            } else if (action == 'Depositar') {
                deposit()
            } else if (action == 'Consultar Saldo') {
                getAccountBalance()
            } else if (action == 'Sacar') {
                withdraw()
            } else if (action == 'Sair') {
                console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
                process.exit()//Para encerrar o programa
            }
        }).catch((err) => console.log(err))
}

//create an account
function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))
    builAccount()
}

function builAccount() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Digite um nome para a sua conta'
            }
        ]).then(answer => {
            const accountName = answer['accountName']
            console.info(accountName) 

            if (!fs.existsSync('accounts')) {//Ao usar ! (negando a função fs.existsSync()), você inverte o valor booleano retornado pela função. Isso significa que se o caminho existir, !fs.existsSync() será false, e se o caminho não existir, !fs.existsSync() será true. Essa abordagem pode ser usada para realizar ações específicas se um determinado caminho não existir no sistema de arquivos.

                fs.mkdirSync('accounts') /*fs.mkdirSync() é um método que cria um novo diretório síncrono (ou seja, de forma bloqueante) no sistema de arquivos. Ele retorna undefined se o diretório for criado com sucesso e gera um erro caso contrário.*/   
            }
            if (fs.existsSync(`accounts/${accountName}.json`)) {
                console.log(
                    chalk.bgRed.black('Esta conta já existe, escolha outro nome!')
                )
                builAccount()
                return
            }
            fs.writeFileSync(
                `accounts/${accountName}.json`,
                '{"balance": 0}',
                function (err) {
                    console.log(err)
                }
            )
            console.log(chalk.green('Parabéns, a sua conta foi criada!'))
            operation()
        }).catch((err) => console.log(err))
}

//add an amount to user account
function deposit() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Qual o nome da sua conta?'
            }
        ])
        .then(answer => {
            const accountName = answer['accountName']

            //verify if account exists 
            if (!checkAccount(accountName)) {
                return deposit()
            }
            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Quanto você deseja depositar'
                }
            ]).then((answer) => {
                const amount = answer['amount']

                //add an amount
                addAmount(accountName, amount)
                operation()
            }).catch(err => console.log(err))
        })
        .catch((err) => console.log(err))
}

function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe, escolha outro nome!'))
        return false
    }
    return true
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData),
        function (err) {
            console.log(err)
        }
    )//fs.writeFileSync() é um método em Node.js que é usado para escrever dados em um arquivo de forma síncrona. Ele cria um novo arquivo se o arquivo não existir ou substitui o conteúdo do arquivo se ele já existir. Esse método é útil para escrever dados em arquivos de texto, como logs, configurações ou qualquer outra informação que precise ser armazenada persistentemente em um arquivo no sistema de arquivos. 

    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })
    return JSON.parse(accountJSON)
    //fs.writeFileSync() é um método em Node.js que é usado para escrever dados em um arquivo de forma síncrona. Ele cria um novo arquivo se o arquivo não existir ou substitui o conteúdo do arquivo se ele já existir. Esse método é útil para escrever dados em arquivos de texto, como logs, configurações ou qualquer outra informação que precise ser armazenada persistentemente em um arquivo no sistema de arquivos. 

}

// show account Balance

function getAccountBalance() {
inquirer.prompt([
    {
        name: 'accountName',
        message: 'Qual o nome da sua conta'
    }
]).then((answer) => {

const accountName = answer["accountName"]

//verify if account exists
if (!checkAccount(accountName)) {
    return getAccountBalance()
}

const accountData = getAccount(accountName)

console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta é de R$${accountData.balance}`))
operation()
}).catch(err => console.log(err))
}

//withdraw an amount from user account
    function withdraw() {
inquirer.prompt([
    {
        name: 'accountName' ,
        message: 'Qual o nome da sua conta?'
    }
]).then((answer) => {
    const accountName = answer['accountName']
    if (!checkAccount(accountName)) {
       return withdraw()
    }

inquirer.prompt([
    {
        name: 'amount',
        message: 'Quanto você deseja sacar?'
    }
]).then((answer) => {
    const amount = answer['amount']
removeAmount(accountName, amount)

}).catch(err => console.log(err))

}).catch((err) => console.log(err))
    }

    function removeAmount(accountName, amount) {
        const accountData = getAccount(accountName)

        if (!amount) {
console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
return withdraw()
        }
        if (accountData.balance < amount) {
           console.log(chalk.bgRed.black('Valor indisponível'))
           return withdraw()
        }
        accountData.balance = parseFloat(accountData.balance) - parseFloat(amount) 

        fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), 
        function (err) {
            console.log(err)
        }
        )
        console.log(chalk.green(`Foi realizado um saque de R$${amount} na sua conta!`))
        operation()
    }