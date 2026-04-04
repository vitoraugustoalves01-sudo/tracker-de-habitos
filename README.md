# Habit Tracker — Vitor

PWA de registro diário de hábitos com persistência no Google Sheets.

## Arquitetura

- **Frontend**: HTML/CSS/JS puro, sem dependências npm
- **Storage**: Google Sheets via API (Service Account)
- **Deploy**: GitHub Pages (privado)
- **CI/CD**: GitHub Actions injeta secrets no build

## Setup inicial

### 1. Secrets no GitHub
Em Settings → Secrets and variables → Actions, adicione:

| Secret | Valor |
|--------|-------|
| `SA_KEY_JSON` | Conteúdo completo do JSON da Service Account |
| `SHEET_ID` | ID da planilha (extraído da URL do Google Sheets) |

### 2. Planilha
A planilha deve ter uma aba chamada `entries` com o seguinte cabeçalho na linha 1:

```
date | sleep | water | weight | energy | mood | work | exercises | breakfast | lunch | dinner | snacks | supps | reading_min | reading_title | notes | created_at
```

### 3. GitHub Pages
Em Settings → Pages:
- Source: GitHub Actions

### 4. Acesso mobile
Após o deploy, abra a URL no celular e use "Adicionar à tela de início".

## Adicionar campos novos

1. Adicione o campo no `src/index.html` (UI + coleta no array `entry`)
2. Adicione a coluna correspondente na planilha (apenas novas linhas terão o campo)
3. Faça push — o Actions faz o deploy automático

Registros antigos ficam com a célula vazia na nova coluna. **Sem breaking changes.**

## Estrutura do projeto

```
habit-tracker/
├── src/
│   ├── index.html      # App completo (UI + lógica)
│   └── manifest.json   # PWA manifest
├── .github/
│   └── workflows/
│       └── deploy.yml  # CI/CD
├── build.js            # Script que injeta secrets no HTML
└── README.md
```
