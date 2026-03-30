import { j as jsxRuntimeExports } from "./index-W02uwOhi.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-CjFWqlgf.js";
function TabPageCard({
  icon,
  title,
  description,
  badge,
  children,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: `border-2 border-neon-cyan/30 bg-card/60 backdrop-blur-sm shadow-neon-md ${className}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            icon,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-2xl text-neon-cyan neon-text", children: title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-base mt-1", children: description })
            ] })
          ] }),
          badge
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children })
      ]
    }
  );
}
export {
  TabPageCard as T
};
