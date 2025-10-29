/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // Використовуємо Record<string, unknown> замість {} і unknown замість any
  const component: DefineComponent<
    Record<string, unknown>,   // props
    Record<string, unknown>,   // raw bindings (setup return)
    unknown                    // data (замість any)
  >;
  export default component;
}
