# Project memory

## Product intent & audience

- Burger/hamburger restaurant or food-ordering web app.
- Interface language: Brazilian Portuguese (pt-BR).
- Audience: Portuguese-speaking customers browsing a menu and placing orders.
- Core flows: home/hero screen → menu (cardápio) → cart (carrinho) → order placement.

## Brand personality & voice

- Casual, warm, inviting tone; appetite-driven language.
- Hero headlines use direct second-person address ("Seu … está Aqui!") with enthusiastic exclamation.
- Copy stays concise and friendly; no formal or corporate phrasing.

## Visual design & UX direction

- Home screen centers on a prominent hero headline/frase plus a CTA button.
- Key UI surfaces: hero section, menu/cardápio list, cart, order flow.
- Vite + React SPA; text/content changes expected to be surgical and isolated.
- Prefer minimal, scoped edits that preserve existing layout, components, and functionality.

## Decisions, constraints & rationale

- User requested exact headline swap: "Seu próximo pedido está aqui" → "Seu Hambúrguer Favorito está Aqui!".
- Rationale: update only the requested string; do not touch button, cardápio, carrinho, or order flow.
- No `.bolt/prompt` present; no global overrides to honor yet.
- Verify build/compilation after textual changes to ensure no regressions.

## Open questions & assumptions

- Assuming pt-BR is the sole target locale; no i18n/multi-language setup confirmed.
- App name, color palette, typography, and full component inventory not yet inferred.
- Unknown whether hero headline is hardcoded vs. sourced from a config/data file.
- Unknown whether additional text changes across other screens are planned.