# 🔐 Checklist de Segurança — O Mister

## ✅ CRÍTICO (Implementado)

- [x] **JWT Validation** — `/api/chat.js` valida tokens Supabase via `jwt.verify()`
- [x] **XSS Prevention** — DOMPurify sanitiza markdown antes de inserir no DOM
- [x] **Tokens em sessionStorage** — Mudar de localStorage para sessionStorage (tokens perdidos ao fechar aba)
- [x] **API Key Exposure** — `/api/config` removido; nunca exponha secrets públicas
- [x] **delete-account Seguro** — Autenticação JWT obrigatória + deleção real em Supabase

## ✅ ALTO (Implementado)

- [x] **Rate Limiting** — 30 requisições/minuto por IP/usuário em `/api/chat`
- [x] **Validação de Inputs** — Sanitização de `userName` e validação de estrutura de mensagens
- [x] **Security Headers** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy em `vercel.json`
- [x] **Magic Bytes Validation** — Arquivos (imagens, PDFs) validados por assinatura, não apenas MIME type
- [x] **CORS Explícito** — Apenas origins permitidas em `/api/chat` e `/api/delete-account`
- [x] **Generalizar Erros** — Mensagens genéricas ao cliente, detalhes apenas em logs

## ✅ MÉDIO (Implementado)

- [x] **Soft Delete** — Conversas marcadas com `deleted_at`, não removidas do banco
- [x] **RLS Policies** — Conversas não-deletadas filtradas por `deleted_at IS NULL`
- [x] **Tamanho de Arquivo** — Limite 10 MB para imagens, 50 MB para PDFs
- [x] **Validação de Imagem** — Blocos base64 inválidos são substituídos por "[Imagem inválida]"

## 📋 TODO (Próximas Prioridades)

- [ ] **CSRF Token** — Implementar token CSRF para formulários POST (se não usar SameSite cookies)
- [ ] **Supabase RLS Audit** — Auditar que todos endpoints respeitam RLS policies
- [ ] **Rate Limit no Supabase** — Configurar rate limiting no nível do banco (se disponível no tier)
- [ ] **Audit Logs** — Registrar logins, exclusões de conta e ações sensíveis
- [ ] **Encryption at Rest** — Verificar se Supabase criptografa dados em repouso (padrão no Postgres 13+)
- [ ] **Senhas Fortes** — Adicionar validação de força de senha (se usar auth por email)
- [ ] **2FA** — Considerar implementar 2FA via TOTP ou SMS
- [ ] **Refresh Token Rotation** — Implementar rotação de refresh tokens
- [ ] **Content Security Policy (CSP)** — Testar CSP e ajustar conforme necessário
- [ ] **Dependências Seguras** — Executar `npm audit` regularmente
- [ ] **HTTPS Obrigatória** — Configurar HSTS headers em produção

## 🔍 Testes de Segurança Recomendados

### 1. XSS
```javascript
// Testar em um chat
<img src=x onerror="alert('XSS')">
<script>alert('XSS')</script>
```
**Esperado:** Renderizado como texto, sem executar código.

### 2. SQL Injection (Supabase RLS protege)
```javascript
// Não é aplicável — Supabase usa parametrized queries
```

### 3. CSRF
```bash
# Testar POST /api/chat de outro origin
curl -X POST https://mister-intelligence.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [...]}'
```
**Esperado:** Bloqueado por CORS se origin não está na whitelist.

### 4. JWT Tampering
```bash
# Enviar token inválido
curl -X POST https://mister-intelligence.vercel.app/api/chat \
  -H "Authorization: Bearer invalid.token.here"
```
**Esperado:** 401 Unauthorized.

### 5. Rate Limiting
```bash
# Fazer 31 requisições em 60 segundos
for i in {1..31}; do
  curl -X POST https://mister-intelligence.vercel.app/api/chat ...
done
```
**Esperado:** 31ª requisição retorna 429 Too Many Requests.

## 🛠️ Monitoramento Contínuo

1. **npm audit** — Executar antes de cada deployment
   ```bash
   npm audit --audit-level=moderate
   ```

2. **Logs** — Monitorar erros de autenticação em Vercel Analytics

3. **Supabase Metrics** — Verificar dashboard de segurança do Supabase

4. **OWASP ZAP** — Rodar scanner de segurança antes de produção:
   ```bash
   zaproxy scan https://mister-intelligence.vercel.app
   ```

## 📚 Referências

- OWASP Top 10: https://owasp.org/Top10/
- Supabase Security: https://supabase.com/docs/guides/security
- MDN Web Security: https://developer.mozilla.org/en-US/docs/Web/Security
- CWE: https://cwe.mitre.org/

---

**Última atualização:** 2026-07-19  
**Responsável:** Sistema de Auditoria Automática
