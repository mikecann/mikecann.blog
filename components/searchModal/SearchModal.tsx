import * as React from "react";
import type { SearchModalProps } from "./SearchModalContent";

// The search modal and the Algolia client are only downloaded when the modal is first opened (it
// is rendered conditionally by the sidebars and navbar).
const SearchModalContent = React.lazy(() => import("./SearchModalContent"));

export const SearchModal: React.FC<SearchModalProps> = (props) => (
  <React.Suspense fallback={null}>
    <SearchModalContent {...props} />
  </React.Suspense>
);
