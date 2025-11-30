<!-- e1596e7f-cdb3-4ed5-a017-973905040d88 516b4753-51fd-4ff9-81a4-f64428f44388 -->
# Fix Build Errors Plan

The build failed due to linting errors and a missing export `EPresaleOnchainState`.

## 1. Fix Linting

- **Action**: Run `pnpm lint --fix` to resolve Prettier/ESLint formatting issues in `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, and others.

## 2. Fix Missing Export

- **Action**: Check `src/lib/presales/hooks.ts` and `src/lib/presales/types.ts`.
- **Investigation**: `EPresaleOnchainState` is likely an enum that needs to be exported from `src/lib/presales/types.ts` or `models.ts` and imported correctly in `Actions.tsx`.
- **Resolution**: Ensure `EPresaleOnchainState` is correctly defined and exported.

## 3. Verify Build

- **Action**: Run `pnpm build` again to confirm success.

### To-dos

- [ ] Add Google Fonts imports to src/app/layout.tsx
- [ ] Update src/app/globals.css for global pixel variables (radius, fonts)
- [ ] Run pnpm lint --fix
- [ ] Investigate and fix EPresaleOnchainState export
- [ ] Run pnpm build to verify