# API Indiefolio

🔗 [Acessar Indiefolio](https://indiefolio.com.br)

> 🎵 API pública opensource para bandas independentes brasileiras

Uma base de dados colaborativa em JSON contendo informações sobre bandas independentes do Brasil. Projeto opensource que visa catalogar e divulgar a rica cena musical independente nacional.

## 🎸 **Cadastre sua Banda!**

**É músico ou conhece uma banda independente brasileira?**

[![Cadastrar Banda](https://img.shields.io/badge/📝_Cadastrar_Banda-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://forms.gle/3SBtvNcENmsmAi1g8)

**👆 Clique aqui para cadastrar sua banda de forma simples e rápida!**

Não precisa saber programação - basta preencher o formulário que cuidamos do resto! ✨

> ⚠️ **Por que usamos formulário?**
>
> Para garantir a segurança, privacidade e veracidade das informações, todo cadastro passa por curadoria manual. Só publicamos dados com autorização explícita da banda, conforme o consentimento no formulário.

## ℹ️ Importante: Salve o link de edição do formulário!

Após enviar o formulário de cadastro da banda, o Google Forms exibirá um link para **editar sua resposta**.  
Guarde esse link com cuidado! Ele permite que você atualize os dados da sua banda no futuro, caso seja necessário.

Se perder o link, entre em contato conosco ou envie um novo formulário informando que se trata de uma atualização.

> Dica: Salve o link em um local seguro ou envie para o e-mail oficial da banda.

---

## 🎯 Objetivo

Criar um repositório público e colaborativo com informações padronizadas sobre bandas independentes brasileiras, facilitando:

- 📊 Descoberta de novos artistas
- 🗺️ Mapeamento da cena musical por região
- 📈 Análise estatística da música independente
- 🔗 Integração com outras plataformas e aplicações

## 📋 Estrutura dos Dados

Cada banda possui as seguintes informações:

```json
{
  "nome": "Nome da Banda",
  "descricao": "Descrição da banda, história e estilo musical",
  "anoFundacao": 2001,
  "anoTermino": null,
  "avatar": "NB",
  "formacaoAtual": [
    { "nome": "Nome do Músico", "funcao": "Instrumento/Vocal" }
  ],
  "social": {
    "instagram": "https://www.instagram.com/banda",
    "youtube": "https://www.youtube.com/@banda",
    "spotify": "https://open.spotify.com/artist/...",
    "site": "https://banda.com.br",
    "facebook": "https://www.facebook.com/banda",
    "soundcloud": "https://soundcloud.com/banda"
  },
  "contato": {
    "email": "contato@banda.com.br",
    "fone": ""
  },
  "local": {
    "pais": "Brasil",
    "estado": "RS",
    "cidade": "Porto Alegre"
  },
  "generos": ["rock", "indie", "alternativo"],
  "complemento": "/bandas/nome-da-banda.json",
  "ultimaAtualizacao": "2025-07-21T16:35:10Z",
  "fontes": ["https://site-da-banda.com"]
}
```

## 🛠️ Ferramentas de Desenvolvimento

### Scripts Disponíveis

```bash
# Validar apenas arquivos alterados (mais rápido)
npm run validate

# Validar todos os arquivos (completo)
npm run validate-all

# Validar usando método legacy (sempre todos os arquivos)
npm run validate-complementary

# Verificar consistência de nomes de arquivos
npm run check-file-names

# Atualizar timestamps automaticamente
npm run update-timestamps

node scripts/generate-changelog.js --recent 10

# Executar validação completa (pre-commit)
npm run pre-commit
```

### Validação Automática

O projeto inclui validação automática que verifica:

- ✅ **Estrutura JSON** - Schema válido para arquivo principal e complementares
- ✅ **Dados obrigatórios** - Campos necessários preenchidos
- ✅ **Formatos** - URLs, emails, datas corretas
- ✅ **Duplicatas** - Nomes únicos de bandas e membros
- ✅ **Consistência** - Anos válidos, estados brasileiros
- ✅ **Nomes de arquivos** - Arquivos complementares seguem padrão correto
- ✅ **Links válidos** - URLs do YouTube, Spotify, etc.

### Sistema de Timestamps

- 🕐 **Atualização automática** do campo `ultimaAtualizacao`
- 📝 **Detecção inteligente** de mudanças nos dados
- 📊 **Histórico completo** de todas as alterações
- ⚡ **Validação incremental** - valida apenas arquivos alterados para melhor performance

### Performance e Otimização

O sistema de validação é otimizado para grandes volumes de dados:

- **Validação incremental**: No pre-commit, valida apenas arquivos que foram alterados (staged)
- **Validação completa**: Use `npm run validate-all` quando necessário
- **Detecção automática**: Identifica automaticamente se está em um repositório Git
- **Fallback inteligente**: Se não conseguir detectar alterações, valida todos os arquivos

## 🚀 Como Contribuir

### 🎵 **Para Bandas e Músicos**

**Opção 1: Formulário Simples (Recomendado)**

- 📝 [**Cadastre sua banda pelo formulário**](https://forms.gle/3SBtvNcENmsmAi1g8)
- ⚡ Rápido e fácil - sem necessidade de conhecimento técnico
- 🔍 Dados revisados e adicionados pela equipe
- 📧 Ideal para bandas que querem se cadastrar sem complicação

**Opção 2: Contribuição Técnica (Para Desenvolvedores)**

- 🛠️ Contribua diretamente editando os arquivos
- 🔧 Para pessoas com conhecimento em Git/JSON
- ⚡ Mudanças diretas no repositório

### 🛠️ **Para Desenvolvedores**

### 1. Adicionando uma Nova Banda

1. Edite o arquivo `bandas.json`
2. Adicione os dados da banda seguindo a estrutura
3. Execute `npm run validate` para verificar
4. O timestamp será atualizado automaticamente

### 2. Atualizando Dados Existentes

1. Localize a banda no arquivo `bandas.json`
2. Faça as alterações necessárias
3. Execute a validação
4. O sistema registrará as mudanças no changelog

### 3. Configuração do Ambiente

```bash
# Instalar dependências
npm install

# Configurar hooks do git (quando subir para repositório)
npm run prepare
```

## 📊 Estatísticas Atuais

Execute `npm run validate` para ver estatísticas como:

- 📈 Total de bandas cadastradas
- 🎭 Bandas ativas vs inativas
- 🗺️ Estados representados
- 🎵 Gêneros musicais únicos
- 📅 Distribuição por décadas

## 🔄 Changelog Automático

O sistema gera automaticamente:

- **CHANGELOG.md** - Histórico legível das mudanças
- **history/changes.json** - Log detalhado em JSON
- **Timestamps** - Atualizados a cada modificação

## 📝 Schema de Validação

O arquivo `schema/banda-schema.json` contém todas as regras de validação para o arquivo principal, e `schema/banda-complemento-schema.json` contém as regras para os arquivos complementares:

### Arquivo Principal (`bandas.json`)

- Campos obrigatórios e opcionais
- Tipos de dados permitidos
- Validação de URLs e formatos
- Limites de caracteres
- Valores aceitos para enums

### Arquivos Complementares (`bandas/*.json`)

- Estrutura padronizada para informações detalhadas
- Validação de discografia, vídeos, formações antigas
- Prêmios, letras destacadas e curiosidades
- Consistência entre nome da banda e nome do arquivo
- URLs válidas para plataformas musicais

## 🏷️ Como Funciona o Versionamento dos Arquivos JSON

O versionamento dos arquivos `bandas.json` e `complemento.json` segue o padrão semântico (SemVer), no formato `X.Y.Z`:

- **Major (X):** Mudanças que quebram a estrutura dos arquivos, como remoção ou alteração de campos obrigatórios. Exemplo: migrar de um array para um objeto, renomear campos principais.
- **Minor (Y):** Inclusão de novas bandas ou entradas, sem alterar a estrutura existente. Exemplo: adicionar uma nova banda ou campo opcional.
- **Patch (Z):** Correções ou atualizações pontuais em bandas já existentes. Exemplo: corrigir nome, atualizar redes sociais, ajustar avatar.

**Exemplo prático:**

- `1.2.0`: Adicionada uma nova banda
- `1.2.1`: Corrigido o nome de uma banda
- `2.0.0`: Estrutura dos dados alterada (ex: campo obrigatório removido)

**Fluxo de atualização:**

1. Sempre que uma alteração é feita, a versão do arquivo é incrementada conforme o tipo de mudança.
2. O front-end consome os arquivos via CDN e utiliza parâmetros de URL (`?v=1.2.0`) para garantir que está usando a versão correta e evitar problemas de cache.
3. O changelog (`CHANGELOG.md`) registra todas as alterações e versões publicadas.
4. O arquivo de complemento `bandas/nomebanda.json` deve respeitar as mesmas regras.

**Importante:**

- Nunca referencie diretamente o branch `main` no front-end. Use sempre URLs versionadas.
- Para projetos colaborativos, revise e documente todas as mudanças antes de publicar uma nova versão.

## 🤝 Diretrizes de Contribuição

### Dados de Qualidade

- ✅ Informações verificadas e atualizadas
- ✅ Links funcionais para redes sociais
- ✅ Descrições informativas (mínimo 10 caracteres)
- ✅ Gêneros musicais precisos

### Formatação

- ✅ JSON válido e bem formatado
- ✅ Encoding UTF-8
- ✅ Indentação de 2 espaços
- ✅ Campos em ordem consistente

### Fontes

- ✅ Sempre incluir URLs das fontes
- ✅ Priorizar sites oficiais das bandas
- ✅ Verificar informações em múltiplas fontes

## 📜 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE) - veja o arquivo LICENSE para detalhes.

## 🌟 Contribuidores

Agradecemos a todos que contribuem para manter este repositório atualizado e preciso!

### 💡 **Quer ver sua banda aqui?**

[![Cadastrar Banda](https://img.shields.io/badge/📝_Cadastrar_pelo_Formulário-4285F4?style=flat-square&logo=google&logoColor=white)](https://forms.gle/3SBtvNcENmsmAi1g8)

---

**API Indiefolio** - Conectando a música independente brasileira 🇧🇷🎵
