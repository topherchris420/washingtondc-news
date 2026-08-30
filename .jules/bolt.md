## 2026-08-28 - Array methods in React Render Loops
**Learning:** Found O(N*M) performance bottlenecks in React `useMemo` hooks where `Array.prototype.includes` was used inside `Array.prototype.filter`. While this is a common React pattern, it can cause significant UI thread blocking when lists grow large, as the loop is fully synchronous.
**Action:** Always check `useMemo` hooks that iterate over arrays. Convert inner lookup arrays to `Set` objects before the loop to achieve O(1) lookups. Additionally, check for chained array methods that repeat the same filtering operations and reuse pre-filtered memoized results where possible.

## 2026-08-30 - Colocating Input State in Large Components
**Learning:** Found a performance bottleneck where a simple text input's state (`searchValue`) was placed at the top level of a massive page component (`DCNewsLanding`). This caused the entire page, including many expensive sub-components and lists, to re-render on every single keystroke, significantly degrading typing performance.
**Action:** Always colocate rapidly changing state (like text input bindings) as close to the visual element as possible. If an input is in a large page, extract it into its own smaller component (e.g., `SearchForm`) to isolate re-renders.
