# .

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

## Tests (Happy/Sad Path)

1. Happy Path: App-Layout zeigt die wichtigsten Navigationseintraege (Branding und Links) zur Grundorientierung.
2. Happy Path: Klick auf "+" fuegt eine neue Zutatenzeile hinzu, damit Nutzer mehrere Zutaten eingeben koennen.
3. Happy Path: Nach dem Laden werden nur die Rezepte des aktuellen Users angezeigt (Filter nach ownerId).
4. Happy Path: Speichern eines neuen Rezepts sendet einen POST und setzt das Formular zurueck.
5. Happy Path: Aufklappen eines Rezepts zeigt die Edit-Aktionen (Aendern und Loeschen).
6. Sad Path: Wenn das Laden fehlschlaegt, wird eine Fehlermeldung mit HTTP-Status angezeigt.
7. Sad Path: Wenn das Speichern fehlschlaegt, erscheint eine Fehlermeldung im Formular.
8. Sad Path: Favoriten werden nicht angezeigt, wenn der Nutzer nicht authentifiziert ist.
9. Sad Path: Leere Kommentarantwort fuehrt zu keinem neuen Eintrag in den Bewertungen.
10. Sad Path: Leerer Ergebniszustand, wenn kein Rezept dem aktuellen Nutzer gehoert.

## Test-Report (Struktur und Funktionsweise)

Diese Sektion beschreibt, wie die Frontend-Tests angelegt sind, wo sie liegen, wie Vitest sie erkennt und wie sie ausgeführt werden.

### Wie wir die Tests erstellt haben
- Wir nutzen **Vitest** mit **@vue/test-utils** (Mount/Shallow-Mount) und **Mocking** fuer Netzwerkaufrufe.
- Externe Abhaengigkeiten wie Auth0 werden gemockt, damit die Tests isoliert laufen.
- Fetch-Aufrufe werden im Test mit `vi.stubGlobal('fetch', ...)` simuliert.
- Ziel: 10 Tests mit klarer Trennung in 5 Happy Path und 5 Sad Path (siehe Liste oben).

### Test-Hierarchie (Ordnerstruktur)
- `src/__tests__/`  
  Allgemeine App-Tests (z. B. `App.spec.ts`).
- `src/components/__tests__/`  
  Komponententests (z. B. `RezeptListe.spec.ts`).

Beispielhafte Baumansicht:
```
src/
  __tests__/
    App.spec.ts
  components/
    __tests__/
      RezeptListe.spec.ts
```

### Wo Tests gespeichert werden
- Alle Testdateien liegen im Projektordner `src` in `__tests__`-Unterordnern.
- Beispielpfade:
  - `src/__tests__/App.spec.ts`
  - `src/components/__tests__/RezeptListe.spec.ts`

### Wie Vitest Tests erkennt
- Standard: Vitest scannt `src` nach Dateien mit dem Muster `*.spec.ts` oder `*.test.ts`.
- Durch `vitest.config.ts` wird die Testumgebung auf `jsdom` gesetzt.
- Die Tests werden automatisch gefunden, sobald sie dem Namensmuster folgen.

### Wie Tests funktionieren
- Jede Datei nutzt `describe`-Bloecke (Test-Suites) und `it`-Bloecke (einzelne Testfaelle).
- `mount` rendert echte Vue-Komponenten fuer Interaktionstests.
- `flushPromises()` wartet auf asynchrone Updates (z. B. nach Fetch).
- Globale Browser-Funktionen wie `fetch`, `confirm`, `scrollTo` werden per `vi.stubGlobal` ersetzt.

Mini-Beispiel (gekürzt):
```ts
it('should add an ingredient row when the plus button is clicked', async () => {
  const wrapper = mount(RezeptListe)
  const initial = wrapper.findAll('input[placeholder="Name"]').length
  await wrapper.find('button').trigger('click')
  const updated = wrapper.findAll('input[placeholder="Name"]').length
  expect(updated).toBe(initial + 1)
})
```

### Testausfuehrung
```sh
npm run test:unit -- --pool=threads
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
