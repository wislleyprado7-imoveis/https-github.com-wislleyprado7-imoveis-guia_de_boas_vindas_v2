# Documento de Requisitos de Produto (PRD)
## Guia de Boas-Vindas Ranchos V2

Este Documento de Requisitos de Produto (PRD) detalha a especificação de software, regras de negócio, arquitetura de dados e funcionalidades do aplicativo **Guia de Boas-Vindas Ranchos V2**. Este sistema permite a proprietários de ranchos gerenciar propriedades, emitir guias interativos personalizados para hóspedes e sincronizar as informações em tempo real via nuvem utilizando **Supabase**.

---

### 1. Visão Geral do Produto
O **Guia de Boas-Vindas Ranchos V2** é uma solução digital full-stack projetada para substituir os antigos manuais impressos de ranchos e fazendas de temporada. 

O sistema divide-se em duas interfaces principais:
1. **Painel do Administrador (Anfitrião):** Onde o proprietário gerencia seus ranchos, edita o conteúdo completo do guia de cada propriedade (10 seções editáveis), cadastra os hóspedes, define as datas de estadia e gera links ou códigos QR exclusivos de acesso rápido.
2. **Guia do Hóspede (Público):** Uma página web ultra-otimizada para dispositivos móveis, elegante, interativa e de alto contraste visual. O hóspede tem acesso a instruções de check-in, senha do Wi-Fi, normas da casa, dicas de pesca detalhadas, recomendações locais e contatos de emergência.

---

### 2. Objetivos Principais
- **Experiência do Hóspede Elevada:** Oferecer um manual interativo, dinâmico e de fácil leitura para o hóspede.
- **Sincronização Híbrida Inteligente:** Armazenar dados na nuvem via **Supabase** para persistência durável, com fallback automático em **LocalStorage** para funcionamento offline ou resiliente a quedas de conexão.
- **Segurança de Acesso:** Controlar o acesso do hóspede de forma temporal (com base nas datas de check-in e check-out cadastrados) ou liberar acesso perpétuo se configurado pelo anfitrião.
- **Facilidade de Compartilhamento:** Permitir geração de links customizados por slug de hóspede e modal integrado de impressão de **QR Code**.

---

### 3. Público-Alvo e Persona
- **Anfitriões/Proprietários de Ranchos:** Pessoas que alugam suas propriedades em rios, lagos ou áreas rurais (como o Rancho Dourado) e desejam profissionalizar o atendimento, reduzindo perguntas repetitivas sobre Wi-Fi, regras e localização.
- **Hóspedes de Ranchos:** Turistas e pescadores que buscam uma estadia tranquila, necessitando de informações rápidas, diretas e offline-friendly sobre a infraestrutura e dicas de pesca locais.

---

### 4. Arquitetura de Dados (Supabase + PostgreSQL)

O modelo de dados é composto por duas tabelas principais (`ranches` e `guests`), estruturadas em banco relacional PostgreSQL com suporte a JSONB para flexibilidade de customização do guia.

#### Diagrama de Entidades e Relacionamentos (ERD)

```
+------------------------------------+          +------------------------------------+
|              ranches               |          |               guests               |
+------------------------------------+          +------------------------------------+
| id (UUID, PK)                      | <------+ | id (UUID, PK)                      |
| name (TEXT)                        |          | name (TEXT)                        |
| guide_content (JSONB)              |          | slug (TEXT, UNIQUE)                |
| created_at (TIMESTAMPTZ)            |          | ranch_id (UUID, FK)                |
+------------------------------------+          | check_in_date (DATE)               |
                                                | check_out_date (DATE)              |
                                                | is_always_unlocked (BOOLEAN)       |
                                                | created_at (TIMESTAMPTZ)            |
                                                +------------------------------------+
```

#### Script SQL de Inicialização (DDL)
Abaixo está o script executado com sucesso no console do Supabase para criar as tabelas, índices e políticas de segurança RLS (Row Level Security):

```sql
-- 1. Criar tabela de Ranchos (Propriedades)
CREATE TABLE ranches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  guide_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criar tabela de Hóspedes (Acessos)
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ranch_id UUID NOT NULL REFERENCES ranches(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  is_always_unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices para otimização de busca
CREATE INDEX idx_guests_slug ON guests(slug);
CREATE INDEX idx_guests_ranch_id ON guests(ranch_id);

-- 3. Habilitar Segurança Row Level Security (RLS)
ALTER TABLE ranches ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas públicas de acesso (CRUD completo para anon key)
-- Políticas para Ranchos (ranches)
CREATE POLICY "Permitir leitura publica de ranchos" ON ranches FOR SELECT USING (true);
CREATE POLICY "Permitir insercao publica de ranchos" ON ranches FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao publica de ranchos" ON ranches FOR UPDATE USING (true);
CREATE POLICY "Permitir delecao publica de ranchos" ON ranches FOR DELETE USING (true);

-- Políticas para Hóspedes (guests)
CREATE POLICY "Permitir leitura publica de hospedes" ON guests FOR SELECT USING (true);
CREATE POLICY "Permitir insercao publica de hospedes" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao publica de hospedes" ON guests FOR UPDATE USING (true);
CREATE POLICY "Permitir delecao publica de hospedes" ON guests FOR DELETE USING (true);
```

---

### 5. Requisitos Funcionais (Módulos de Sistema)

#### 5.1 Painel Administrativo (Anfitrião)
- **Gerenciamento de Propriedades (Ranchos):**
  - Criação de novos ranchos.
  - Seleção rápida de rancho para edição do conteúdo.
  - Exclusão em cascata (remove hóspedes vinculados).
- **Editor do Guia Dinâmico (10 Seções):**
  - **Capa:** Título do banner, subtítulo e imagem de destaque.
  - **Mensagem de Boas-vindas:** Texto acolhedor e foto do anfitrião.
  - **Instruções de Check-In e Check-Out:** Horários, código da fechadura eletrônica, passo-a-passo detalhado e link para instruções em vídeo.
  - **Localização:** Link do Google Maps integrado e coordenadas para chegada segura.
  - **Wi-Fi:** SSID (Nome da Rede), senha e notas complementares sobre conectividade.
  - **Normas e Equipamentos:** Lista dinâmica de regras da casa e inventário de utensílios disponíveis.
  - **Dicas de Pesca:** Melhores horários, técnicas, guia de espécies de peixes locais com iscas recomendadas.
  - **Recomendações Locais:** Cadastro estruturado de restaurantes, farmácias, mercados e lojas de pesca (com nome, endereço e link no mapa).
  - **Contatos de Emergência:** Cadastro de telefone, cargo e hospitais mais próximos com orientações de socorro.
  - **Perguntas Frequentes (FAQ):** Criação e exclusão de pares de perguntas e respostas personalizadas.
- **Painel de Controle de Hóspedes (Acessos):**
  - Lista de hóspedes com barra de pesquisa por nome.
  - Cadastro de hóspedes com geração automatizada de slug (URL amigável).
  - Controle de datas (Check-in/Check-out) e flag para liberação de acesso perpétuo.
  - Ações rápidas: Visualizar guia em tempo real, copiar link amigável, editar registro, remover hóspede, e modal de QR Code.

#### 5.2 Guia do Hóspede (Público)
- **Validação de Acesso Temporal:**
  - O sistema calcula dinamicamente se o hóspede está no período de hospedagem (data de hoje está entre o check-in e o check-out).
  - Se estiver fora da data e sem acesso perpétuo ativado, as informações sensíveis (como código da porta, senha do Wi-Fi) aparecem bloqueadas com cadeado.
- **Componentes Interativos de Visualização:**
  - Abas rápidas categorizadas: Informações Essenciais, Regras e Lazer, Recomendados e Ajuda.
  - Painéis sanfonados (Accordion) para espécies de peixes e perguntas frequentes.
  - Botão de atalho "Ligar para Contato" e link direto para rota GPS.
  - Botões de copiar senha de Wi-Fi e código de porta com apenas um toque.

---

### 6. Requisitos Não-Funcionais

- **Interface Responsiva e Visual Premium:** Layout desktop fluido de alta fidelidade e visual totalmente voltado para mobile com o tema personalizado em tons sofisticados (Azul Marinho Royal, Dourado Ocre e Areia Clara).
- **Conectividade e Sincronização:**
  - Sincronização automática em nuvem via requisições assíncronas do Supabase.
  - Estado local reativo instantâneo na UI.
  - Backup resiliente em `localStorage` para casos em que o usuário esteja offline na propriedade ou as credenciais Supabase ainda não estejam configuradas.
- **Tecnologia & Desempenho:**
  - **Frontend:** React 18+ com Vite e TypeScript para digitação estrita e segura.
  - **Estilização:** Tailwind CSS 4.0 utilizando variáveis de tema centralizadas em `index.css`.
  - **Ícones:** Lucide-react para consistência visual leve.
  - **Sinalização de Conexão:** Barra de status no topo indicando se o banco está conectado ao Supabase Cloud ou se opera localmente.

---

### 7. Configurações de Variáveis de Ambiente
O projeto lê as chaves do arquivo `.env` para apontar ao banco na nuvem:

```env
# Supabase Credentials
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

Caso as variáveis não estejam preenchidas, o sistema inicia um modo de simulação conectando ao banco de homologação ou ativando o fallback em `localStorage` com dados de demonstração autogerados, garantindo que o app nunca quebre.

---

Este PRD serve como o guia único de verdade para o desenvolvimento contínuo, auditoria e implantação do **Guia de Boas-Vindas Ranchos V2**.
