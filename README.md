# 🚀 Liberta - O Seu Gerenciador Financeiro Pessoal

![Liberta Cover](https://i.postimg.cc/RhYFc3Xb/Chat-GPT-Image-28-de-jan-de-2026-18-15-52.png)

> Assuma o controle do seu dinheiro, elimine dívidas e alcance a liberdade financeira com um painel inteligente e gamificado. Desenvolvido pela **Prime Studios**.

## 📖 Sobre o Projeto

O **Liberta** (antigo AuraPix/Liberta) é uma aplicação *Full-Stack* de gestão financeira focada em mudança de comportamento. Utilizando o método 50/30/20, o app vai além de uma simples planilha, oferecendo um ecossistema completo com gamificação, radar de investimentos em tempo real e notificações inteligentes para criar o hábito do controle financeiro.

## ✨ Funcionalidades Principais

* 📊 **Dashboard Gamificado:** Score financeiro e sistema de níveis (Sobrevivente, Organizador, Poupador, Investidor Livre) baseado na saúde do seu fluxo de caixa.
* 💰 **Orçamento Inteligente (Regra 50/30/20):** Cálculo automático do "Custo de Sobrevivência" e linha do tempo visual cruzando o dia do pagamento com o vencimento das contas.
* 📈 **Radar de Investimentos:** Integração com a BrasilAPI para buscar taxas atualizadas do mercado (Selic, CDI, IPCA) e sugerir oportunidades baseadas no perfil de risco (Segurança, Equilíbrio, Arrojado).
* 🛡️ **Guerra às Dívidas:** Gerenciamento estratégico de passivos utilizando o método "Bola de Neve" (foco na menor dívida) ou escolha manual de prioridade.
* 🎯 **Gestão de Metas e Sonhos:** Acompanhamento visual do progresso de economia para objetivos específicos.
* 🔔 **Notificações Nativas (Capacitor):** Alertas de vencimento na véspera e no dia, lembretes no dia do pagamento e engajamento para usuários inativos.
* ☁️ **Cloud Sync & Modo Visitante:** Sincronização em tempo real via Firebase, persistência local de dados e possibilidade de testar o app sem criar conta.
* 📱 **Multiplataforma:** Interface responsiva adaptada para Web e Mobile, com suporte a Dark Mode e Modo Privacidade (ocultar valores).
* 👑 **Monetização & Premium:** Integração com AdMob (banners) e sistema de assinatura "Liberta Pro" para remoção de anúncios, além de uma vitrine virtual para e-books e cursos.

## 🛠️ Tecnologias Utilizadas

**Front-end & UI:**
* [React](https://reactjs.org/) (Hooks, Context, UseMemo)
* [Tailwind CSS](https://tailwindcss.com/) (Estilização responsiva e Dark Mode)
* [Lucide React](https://lucide.dev/) (Ícones)

**Back-end & BaaS:**
* [Firebase Auth](https://firebase.google.com/docs/auth) (Login com Email/Senha, Google, Facebook e Anônimo)
* [Firestore](https://firebase.google.com/docs/firestore) (Banco de dados NoSQL em tempo real)

**Mobile (Integração Nativa):**
* [Capacitor](https://capacitorjs.com/) (Core)
* `@capacitor-community/admob` (Anúncios)
* `@capacitor/local-notifications` (Notificações Push Nativas)
* `@capacitor/status-bar` (Estilização de UI nativa)

