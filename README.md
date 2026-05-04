# 🔍 Sistema de Monitoramento e Relatórios de Commits

Sistema automatizado de monitoramento de commits no GitHub com análise de qualidade de código, segurança, detecção de segredos e relatórios gerados por IA (GPT-4o).

> ✅ **Testado e validado** no repositório `cefeangel/api-convidados` em 15/03/2026.

---

## 📁 Estrutura dos Arquivos

```
.github/
└── workflows/
    ├── commit-monitor.yml      # Monitora cada commit em tempo real (5 jobs)
    ├── weekly-report.yml       # Relatório semanal toda segunda-feira
    └── codeql-security.yml     # Análise de segurança avançada com CodeQL
.gitleaks.toml                  # Regras de detecção de segredos expostos
README.md                       # Este arquivo
```

---

## ⚙️ Passo a Passo de Implementação

### PASSO 1 — Clonar o repositório no seu computador

Abra o terminal (Git Bash no Windows, Terminal no Mac/Linux) e execute:

```bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
cd SEU-REPOSITORIO
```

> 💡 Substitua `SEU-USUARIO/SEU-REPOSITORIO` pelo endereço do seu repositório.

---

### PASSO 2 — Copiar os arquivos para dentro do repositório

Extraia o arquivo `.zip` deste sistema. Dentro dele você vai encontrar a pasta `.github/` e o arquivo `.gitleaks.toml`. Copie ambos para a raiz do seu repositório.

**No Windows (Git Bash):**
```bash
cp -r /c/Users/SEU-NOME/Downloads/github-monitoring-completo/.github .
cp /c/Users/SEU-NOME/Downloads/github-monitoring-completo/.gitleaks.toml .
```

**No Mac/Linux:**
```bash
cp -r ~/Downloads/github-monitoring-completo/.github .
cp ~/Downloads/github-monitoring-completo/.gitleaks.toml .
```

> ⚠️ **Windows:** pastas que começam com ponto (`.github`) ficam ocultas no Explorador de Arquivos. Ative "Itens ocultos" em Ver → Mostrar para visualizá-las.

Confirme que os 3 arquivos `.yml` estão no lugar certo:
```bash
ls .github/workflows/
# Deve mostrar: commit-monitor.yml  codeql-security.yml  weekly-report.yml
```

---

### PASSO 3 — Configurar o Secret OPENAI_API_KEY

Esta chave permite que o GPT-4o gere os resumos automáticos dos commits.

**Como obter a chave:**
1. Acesse [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Clique em **"Create new secret key"**
3. Copie a chave gerada (ela só aparece uma vez)

**Como adicionar no GitHub:**
1. No repositório → clique na aba **Settings**
2. Menu esquerdo → **Secrets and variables → Actions**
3. Botão verde **"New repository secret"**
4. **Name:** `OPENAI_API_KEY`
5. **Secret:** cole a chave copiada
6. Clique em **"Add secret"**

> ✅ Quando salvo corretamente, aparece a mensagem **"Secret updated"** no topo da página.

---

### PASSO 4 — Ativar as funcionalidades de segurança

Acesse: **Settings → Security → Advanced Security**

Ative os itens que estiverem com botão "Enable":
- ✅ **Dependabot alerts** — alertas de dependências vulneráveis
- ✅ **Code scanning** → **CodeQL** → clique em **"Set up → Default"**
- ✅ **Secret Protection** — já ativo em repositórios públicos (botão mostra "Disable")
- ✅ **Push protection** — já ativo em repositórios públicos (botão mostra "Disable")

> 💡 Em repositórios públicos, Secret Protection e Push Protection já vêm ativos por padrão. Se o botão mostrar "Disable", significa que já está funcionando.

---

### PASSO 5 — Enviar os arquivos para o GitHub

```bash
git add .
git commit -m "feat: adicionar workflows de monitoramento automatico"
git push
```

> ⚠️ **Windows:** o aviso `LF will be replaced by CRLF` é normal e pode ser ignorado. Não é um erro.

---

### PASSO 6 — Verificar se está funcionando

1. Acesse a aba **Actions** do repositório
2. Você verá os workflows sendo executados automaticamente
3. Clique em qualquer execução → **Summary** para ver o relatório completo

**Resultado esperado — todos os checks verdes:**
```
✅ Coletar Metadados do Commit
✅ Análise de Qualidade de Código
✅ Scan de Segurança e Vulnerabilidades
✅ Detecção de Segredos Expostos
✅ Gerar Relatório com IA
```

---

## 🔄 O que acontece em cada commit

### Workflow 1: `commit-monitor.yml`
Dispara automaticamente em cada `push` ou abertura de `Pull Request`.

```
Push/PR
  │
  ├─► [Job 1] Coletar Metadados
  │     └── Captura: autor, e-mail, SHA, branch, arquivos alterados, timestamp
  │
  ├─► [Job 2] Análise de Qualidade de Código
  │     ├── Detecta a linguagem do projeto automaticamente
  │     ├── JavaScript/TS: roda ESLint (se houver configuração)
  │     ├── Python: roda Flake8 + Black
  │     ├── Go: roda go vet
  │     └── Verifica arquivos sensíveis (.env, .pem, .key) e arquivos grandes (>1MB)
  │
  ├─► [Job 3] Scan de Vulnerabilidades (Trivy)
  │     └── Analisa dependências do projeto e envia alertas para a aba Security
  │
  ├─► [Job 4] Detecção de Segredos (Gitleaks)
  │     └── Verifica se há API keys, tokens, senhas, chaves RSA/SSH expostas no código
  │
  └─► [Job 5] Relatório com IA (GPT-4o)
        ├── Coleta o diff do commit
        ├── Envia para o GPT-4o via API da OpenAI
        ├── Recebe resumo em português com: Propósito, Impacto, Qualidade e Riscos
        ├── Gera relatório consolidado no Job Summary
        └── Posta comentário automático em Pull Requests
```

### Workflow 2: `weekly-report.yml`
Executa toda **segunda-feira às 09h UTC** (ou manualmente na aba Actions).

Gera automaticamente:
- Ranking de commits por desenvolvedor no período
- Arquivos mais modificados
- Atividade por dia da semana
- Branches ativas
- Análise gerencial em português gerada pelo GPT-4o
- Issue criada automaticamente com link para o relatório completo

### Workflow 3: `codeql-security.yml`
Executa em pushes para `main`/`master`/`develop` e toda **quarta-feira às 02h UTC**.

- Detecta automaticamente as linguagens do projeto
- **Verificação inteligente:** antes de rodar o CodeQL, verifica se existem arquivos da linguagem no repositório. Se não houver, exibe a mensagem *"Ignorado — quando o código for adicionado, a análise rodará automaticamente"* sem gerar erro
- Gera SBOM (Software Bill of Materials) como artefato para auditorias
- Revisão de dependências em Pull Requests

---

## 📊 Onde ver os relatórios

| Tipo de Relatório | Localização |
|---|---|
| Relatório por commit (com análise IA) | Actions → [execução] → Summary |
| Comentário automático em PR | Pull Requests → [PR] → Comments |
| Vulnerabilidades de dependências | Security → Vulnerability alerts |
| Análise estática de código | Security → Code scanning alerts |
| Segredos detectados | Security → Secret scanning alerts |
| Relatório semanal | Issues → [tag: relatório] |
| SBOM (inventário de dependências) | Actions → [execução] → Artifacts |

---

## 🛠️ Ferramentas utilizadas

| Ferramenta | Função | Quando roda |
|---|---|---|
| **GitHub Actions** | Orquestra todos os workflows | Sempre |
| **GPT-4o (OpenAI)** | Gera resumos e análises em português | A cada commit |
| **Trivy** | Scan de vulnerabilidades em dependências | A cada commit |
| **Gitleaks** | Detecta segredos e chaves expostas | A cada commit |
| **CodeQL** | Análise estática de segurança do código | Pushes no main + semanal |
| **ESLint** | Qualidade de código JavaScript/TypeScript | A cada commit (se houver código JS) |
| **Flake8/Black** | Qualidade e formatação Python | A cada commit (se houver código Python) |
| **Syft** | Gera SBOM (inventário de dependências) | Pushes no main |

---

## 🔧 Personalizações

### Alterar horário do relatório semanal
No arquivo `weekly-report.yml`, altere a linha `cron`:
```yaml
- cron: '0 9 * * 1'  # seg às 09h UTC
# Formato: minuto hora dia-mês mês dia-semana
# Exemplos:
# '0 6 * * 1'   → segunda às 06h UTC (03h horário de Brasília)
# '0 12 * * 5'  → sexta às 12h UTC (09h horário de Brasília)
```

### Alterar severidade mínima do Trivy
No `commit-monitor.yml`, na etapa do Trivy:
```yaml
severity: 'CRITICAL,HIGH'  # Remova MEDIUM para menos alertas
```

### Monitorar branches específicas
No `commit-monitor.yml`:
```yaml
on:
  push:
    branches: ["main", "develop", "release/*"]
```

### Executar relatório semanal manualmente
Acesse: **Actions → Relatório Semanal de Contribuições → Run workflow**
Você pode definir quantos dias de histórico analisar (padrão: 7 dias).

---

## ❓ Problemas comuns e soluções

### "Invalid workflow file — YAML syntax error"
**Causa:** Conflito de sintaxe no arquivo `.yml`.
**Solução:** Use sempre os arquivos originais deste pacote sem editar manualmente. Se precisar de ajustes, faça pelo GitHub → edite o arquivo → o site valida o YAML automaticamente.

### "Análise de IA — Erro ao gerar resumo"
**Causa:** JSON inválido enviado à API da OpenAI (geralmente por caracteres especiais no diff).
**Solução:** Esta versão já usa `jq` para montar o JSON com segurança, evitando esse problema.

### "CodeQL — javascript: Failing"
**Causa:** CodeQL tenta analisar JavaScript mas não encontra arquivos `.js` no repositório.
**Solução:** Esta versão já verifica a existência de arquivos antes de rodar o CodeQL. Se não houver código, exibe *"Ignorado"* sem gerar erro.

### "O resumo de IA não aparece"
**Causa:** `OPENAI_API_KEY` não configurado ou inválido.
**Solução:**
1. Acesse Settings → Secrets → Actions
2. Confirme que o secret `OPENAI_API_KEY` existe
3. Se necessário, delete e recrie com a chave correta de [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### "Avisos amarelos sobre Node.js 20 deprecated"
**Causa:** O GitHub está avisando que vai migrar para Node.js 22 em breve.
**Solução:** Nenhuma ação necessária. São apenas informativos e não afetam o funcionamento. Serão resolvidos automaticamente quando o GitHub fizer a migração.

### "git push pede usuário e senha"
**Causa:** Autenticação por HTTPS requer Personal Access Token (não a senha da conta).
**Solução:**
1. Acesse github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Clique em "Generate new token"
3. Selecione o escopo `repo`
4. Use o token gerado como senha no `git push`

---

## 📋 Checklist de implementação

- [ ] Arquivos `.github/workflows/` copiados para o repositório
- [ ] Arquivo `.gitleaks.toml` copiado para a raiz do repositório
- [ ] Secret `OPENAI_API_KEY` configurado em Settings → Secrets → Actions
- [ ] Code scanning ativado em Settings → Security → Advanced Security
- [ ] Primeiro `git push` realizado com sucesso
- [ ] Aba Actions mostra todos os checks verdes ✅
- [ ] Job Summary exibe o relatório completo com análise da IA

---

*Sistema criado para aumentar a qualidade e segurança do desenvolvimento.*
*Versão final validada em 15/03/2026.*
