# Reading Wishlist Tracker

## Membros do Grupo
* Marcus Vinicius Gomes de Oliveira
* Guilherme Novais de Souza

## Sobre o Sistema
O Reading Wishlist é uma aplicação web desenvolvida para ajudar utilizadores a gerir os seus hábitos de leitura. Permite adicionar livros a uma lista de desejos, acompanhar o progresso de leitura, avaliar livros concluídos (com um sistema de 1 a 5 estrelas), adicionar notas pessoais e visualizar estatísticas de leitura.

## Tecnologias Utilizadas
* **Frontend:** React, Next.js, CSS Modules
* **Backend:** Next.js Route Handlers (API REST), Node.js
* **Base de Dados:** PostgreSQL gerido com Prisma ORM
* **Infraestrutura:** Docker e Docker Compose
* **Testes & CI/CD:** Jest (Unit e E2E), GitHub Actions, Codecov

## Como executar os testes localmente
Para correr a suite de testes, certifique-se de que tem o Node.js instalado e execute os seguintes comandos na raiz do projeto:

```bash
npm install
npm run test
npm run test:coverage

### 4. Configurar CI/CD com GitHub Actions e Codecov
Este é o coração do requisito do professor. Precisamos de dizer ao GitHub para correr os testes em Linux, Mac e Windows.
* Cria uma pasta na raiz do projeto chamada `.github`.
* Lá dentro, cria outra pasta chamada `workflows`.
* Lá dentro, cria um ficheiro chamado `ci.yml` (`.github/workflows/ci.yml`) e cola este código:

```yaml
name: CI e Cobertura de Testes

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  test:
    name: Test on ${{ matrix.os }}
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests with coverage
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      if: matrix.os == 'ubuntu-latest'
      uses: codecov/codecov-action@v4
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
        fail_ci_if_error: true