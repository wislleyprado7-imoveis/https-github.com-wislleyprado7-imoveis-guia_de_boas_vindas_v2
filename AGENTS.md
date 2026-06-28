# Agent Instructions for Rancho Guide V2

Welcome, agent! This file contains the project instructions and reference definitions for the **Guia de Boas-Vindas Ranchos V2** (Rancho Guide V2). This is loaded automatically by the system.

Please respect the following product specifications, architecture, and developer constraints when working on this repository:

---

## 1. Product Requirements Document (PRD)

### Visão Geral do Produto
O **Guia de Boas-Vindas Ranchos V2** é uma solução digital full-stack projetada para substituir os antigos manuais impressos de ranchos e fazendas de temporada.

O sistema divide-se em duas interfaces principais:
1. **Painel do Administrador (Anfitrião):** Onde o proprietário gerencia seus ranchos, edita o conteúdo completo do guia de cada propriedade (10 seções editáveis), cadastra os hóspedes, define as datas de estadia e gera links ou códigos QR exclusivos de acesso rápido.
2. **Guia do Hóspede (Público):** Uma página web ultra-otimizada para dispositivos móveis, elegante, interativa e de alto contraste visual. O hóspede tem acesso a instruções de check-in, senha do Wi-Fi, normas da casa, dicas de pesca detalhadas, recomendações locais e contatos de emergência.

---

### 2. Arquitetura de Dados (Supabase + PostgreSQL)

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
                                                | phone (TEXT)                       |
                                                | created_at (TIMESTAMPTZ)            |
                                                +------------------------------------+
```

#### Script SQL de Inicialização (DDL)
Este é o script SQL oficial executado e configurado no painel do Supabase:

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
  phone TEXT,
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

## 3. Diretrizes de Sincronização de Código e Cliente Supabase

- O arquivo `/src/supabaseClient.ts` cria o cliente do Supabase apontando para o banco de dados oficial.
- Se o Supabase estiver indisponível ou as tabelas ainda não existirem, o aplicativo entra no **Modo Offline**, operando com backup local automático no `localStorage` para que nenhuma modificação seja perdida.
- Ao atualizar Ranchos ou Hóspedes no aplicativo, as atualizações são enviadas em tempo real por meio de comandos `upsert` e `delete` sincronizados.

---

Este arquivo serve como as instruções persistentes para você e futuros agentes de desenvolvimento. Siga sempre o design visual premium do aplicativo em tons de **Dourado, Azul Marinho e Off-White** ao criar novas telas ou componentes.
