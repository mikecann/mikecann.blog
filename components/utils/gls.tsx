import * as gls from "gls";
import * as React from "react";

/*
  This is a workaround to get around the fact that gls typescript types seem to conflict with
  the current react typescript types.
*/

// Every page used to sit inside one GLSDefaults provider (spacing 0) in Next's _app. Astro renders
// each component tree and island as its own React root, so each layout element brings the
// provider itself. Explicit spacing props still win.
const defaults = { verticalSpacing: 0, horizontalSpacing: 0 } as React.ContextType<
  typeof gls.GLSDefaults
>;
const withDefaults = (element: React.ReactElement) => (
  <gls.GLSDefaults.Provider value={defaults}>{element}</gls.GLSDefaults.Provider>
);

const GlsVertical = gls.Vertical as any;
const GlsHorizontal = gls.Horizontal as any;
const GlsGrid = gls.Grid as any;
const GlsStretch = gls.Stretch as any;

export const Vertical = React.forwardRef<HTMLDivElement, gls.VerticalProps>((props, ref) =>
  withDefaults(<GlsVertical ref={ref} {...props} />),
);

export const Horizontal = React.forwardRef<HTMLDivElement, gls.HorizontalProps>((props, ref) =>
  withDefaults(<GlsHorizontal ref={ref} {...props} />),
);

export const Grid = React.forwardRef<HTMLDivElement, gls.GridProps>((props, ref) =>
  withDefaults(<GlsGrid ref={ref} {...props} />),
);

export const Stretch = React.forwardRef<HTMLDivElement, gls.Stretch>((props, ref) =>
  withDefaults(<GlsStretch ref={ref} {...props} />),
);
