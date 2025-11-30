import { createModalHook, EModalKey } from "./root";

export type TZwethWrapModalData = {
  closeable: boolean;
};
export const useZwethWrapModal = createModalHook<TZwethWrapModalData>(EModalKey.ZwethWrapModal);
