# Habit Tracker — Vitor

PWA de registro diário de hábitos com persistência no Google Sheets.

## Arquitetura

- **Frontend**: HTML/CSS/JS puro, sem dependências npm
- **Storage**: Google Sheets, acessado via um Google Apps Script Web App (`apps-script/Code.gs`) — o script roda com a identidade do dono da planilha, então o navegador nunca precisa de nenhuma credencial do Google
- **Deploy**: GitHub Pages (privado)
- **CI/CD**: GitHub Actions só copia `src/` para `dist/` e publica — não há segredo nenhum envolvido no build

## Setup inicial

### 1. Planilha
A planilha deve ter uma aba chamada `entries` com o seguinte cabeçalho na linha 1 (colunas A a V):

```
date | sleep | water | weight | energy | mood | work | exercises | breakfast | lunch | dinner | ceia | supps | reading_min | reading_title | notes | created_at | gordura | fds | pretreino | exercises_json | meals_json
```

`exercises_json` e `meals_json` guardam o mesmo dado de `exercises`/refeições em formato estruturado (JSON) — é o que o app lê ao carregar a página pra repopular o formulário com o que já foi salvo hoje, sem precisar parsear a string legível (`exercises`, `breakfast` etc.) de volta. Essas colunas não são pra leitura humana na planilha.

### 2. Apps Script Web App
Isso substitui a antiga Service Account e só pode ser feito manualmente (exige login na conta Google dona da planilha):

1. Abra a planilha → **Extensões → Apps Script**.
2. Cole o conteúdo de `apps-script/Code.gs` no editor.
3. **Implantar → Nova implantação** → tipo "Aplicativo da web".
   - Executar como: **Eu** (dono da planilha)
   - Quem pode acessar: **Qualquer pessoa**
4. Copie a URL gerada (termina em `/exec`).
5. Em `src/index.html`, troque o placeholder `__APPS_SCRIPT_URL__` pela URL copiada.

A URL não é secreta (não dá acesso a nada sem passar pela lógica do script), então pode ficar direto no HTML publicado.

### 3. GitHub Pages
Em Settings → Pages:
- Source: GitHub Actions

### 4. Acesso mobile
Após o deploy, abra a URL no celular e use "Adicionar à tela de início".

## Adicionar campos novos

1. Adicione o campo no `src/index.html` (UI + chave no payload salvo)
2. Adicione a chave correspondente no array `COLUMNS` de `apps-script/Code.gs`, na mesma posição da coluna na planilha
3. Adicione a coluna correspondente na planilha (apenas novas linhas terão o campo)
4. Faça push — o Actions faz o deploy automático

Registros antigos ficam com a célula vazia na nova coluna. **Sem breaking changes.**

## Estrutura do projeto

```
habit-tracker/
├── src/
│   ├── index.html      # App completo (UI + lógica)
│   └── manifest.json   # PWA manifest
├── apps-script/
│   └── Code.gs          # Google Apps Script Web App (doGet/doPost, upsert por data)
├── .github/
│   └── workflows/
│       └── deploy.yml  # CI/CD
├── build.js             # Copia src/ para dist/ e gera o ícone
└── README.md
```
