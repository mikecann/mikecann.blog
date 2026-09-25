import dynamic from "next/dynamic";
import type { SearchModalProps } from "./SearchModalContent";

/**
 * The search modal and the Algolia client are only downloaded when the modal is first opened
 * (it is rendered conditionally by the sidebars and navbar).
 */
export const SearchModal = dynamic<SearchModalProps>(() => import("./SearchModalContent"), {
  ssr: false,
});
