# Instruções e Contexto do Projeto para Gemini AI - Rancho Guide V2

Este arquivo contém o contexto completo, especificações técnicas e o **Documento de Requisitos de Produto (PRD)** do projeto **Guia de Boas-Vindas Ranchos V2**. Ele é injetado automaticamente nas instruções do sistema para garantir que futuros agentes ajam em total conformidade com as regras de negócio e de design do aplicativo.

---

## 1. Documento de Requisitos de Produto (PRD)

### Visão Geral
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

### 3. Arquitetura de Dados (Supabase + PostgreSQL)

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

## 4. Diretrizes de Desenvolvimento e Design

- **Identidade Visual Premium:** Manter rigorosamente o tema em tons de **Dourado (Ocre/Ouro)**, **Azul Marinho Royal** e **Off-White (Areia/Cinza Claro)**.
- **Sincronização Local e Remota:** O arquivo `/src/supabaseClient.ts` cria o cliente Supabase. Caso as credenciais não estejam no `.env`, o app entra em **Modo Offline** utilizando backup no `localStorage` automático. No desenvolvimento de novas telas ou recursos, utilize sempre funções reativas que protegem o estado contra quebras de rede.
- **Fontes Utilizadas:** O projeto utiliza fontes modernas com excelente legibilidade tanto em desktops quanto em displays portáteis de alta densidade de pixels.
