# Ctrl+c Diarium

Este é um aplicativo simples de blog desenvolvido com Node.js, Express e MongoDB.

## Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado em sua máquina:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Instalação

1. Clone este repositório:
https://github.com/NathanAzvdo/ProjetoNODE.git
   
2. Navegue até o diretório do projeto:
cd projetoNode

3. Instale as dependências:
npm install

4. Certifique que o mongodb está em execução em sua máquina.
   
5. Inicie o servidor:
node app.js

6. Acesse no seu navegador pela url:
http://localhost:8084

## Acesso conta adm:

Para ter acesso a conta de ADM, modifique o valor default do campo eAdmin no model usuário para 1, crie sua conta pela interface e coloque o valor como 0 novamente.

## Como uso a recuperação por email?

Crie uma conta na mailtrap, e pegue os dados necessários para a integração, logo após crie um arquivo chamado mail.json na pasta config.

{<BR>
    "host": "",<br>
    "port": "",<br>
    "user": "",<br>
    "pass": ""<br>
}<br><br>

Troque pelos seus dados fornecidos na plataforma(não esqueça de selecionar a integração com node no site)

## Futuros upgrades:

<ul>
  <li>Webchat entre os usuários</li>
  <li>Recuperação de senha</li>
  <li>Verificação de duas etapas</li>
  <li>Terminar a conexão com OpenIa Api</li>
</ul>