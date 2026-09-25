import { VerticalProps } from "gls";
import * as React from "react";
import { Horizontal, Vertical } from "./utils/gls";

interface Props extends VerticalProps {
  onClose?: () => any;
  /** Accessible name for the dialog. Use this or `ariaLabelledBy`. */
  ariaLabel?: string;
  /** Id of a visible element inside the dialog that names it (e.g. its heading). */
  ariaLabelledBy?: string;
}

const focusableSelector = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  "[tabindex]",
].join(",");

const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (el) => el.tabIndex >= 0 && el.getClientRects().length > 0,
  );

export const Modal: React.FC<Props> = ({
  onClose,
  ariaLabel,
  ariaLabelledBy,
  style,
  children,
  ...rest
}) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // Keep the latest onClose without re-running the effects below on every render
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Move focus into the dialog on open and restore it to whatever had it before on close
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (!dialog.contains(document.activeElement)) {
      const [first] = getFocusableElements(dialog);
      (first ?? dialog).focus();
    }

    return () => {
      const active = document.activeElement;
      // Only restore if focus was lost with the dialog, don't steal it from something else
      const focusWasLost = !active || active === document.body || dialog.contains(active);
      if (focusWasLost && previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, []);

  // Escape to close, keep Tab / Shift+Tab cycling inside the dialog
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog || e.defaultPrevented || e.isComposing) return;

      if (e.key === "Escape") {
        if (!onCloseRef.current) return;
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = getFocusableElements(dialog);
      if (focusable.length == 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === dialog || !dialog.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    // If focus escapes anyway (e.g. tabbing out of an iframe) pull it back into the dialog
    const onFocusIn = (e: FocusEvent) => {
      const dialog = dialogRef.current;
      if (!dialog || !(e.target instanceof Node) || dialog.contains(e.target)) return;
      const [first] = getFocusableElements(dialog);
      (first ?? dialog).focus();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  return (
    <Horizontal
      data-comment="Modal"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 100,
      }}
      horizontalAlign="center"
      verticalAlign="center"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 101,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      />
      <Vertical
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 6,
          zIndex: 102,
          outline: "none",
          ...style,
        }}
        {...rest}
      >
        {children}
      </Vertical>
    </Horizontal>
  );
};
