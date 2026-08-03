import type { ThemeRegistration } from "shiki";

const vesperTheme: ThemeRegistration = {
   name: "vesper",
   type: "dark",
   colors: {
      "editor.background": "#101010",
      "editor.foreground": "#FFFFFF",
   },
   settings: [
      { settings: { foreground: "#FFFFFF", background: "#101010" } },
      {
         scope: ["comment"],
         settings: { foreground: "#8b8b8b", fontStyle: "italic" },
      },
      { scope: ["string"], settings: { foreground: "#99FFE4" } },
      {
         scope: ["constant.numeric", "constant.language"],
         settings: { foreground: "#A0A0A0" },
      },
      {
         scope: ["keyword", "storage.type", "storage.modifier"],
         settings: { foreground: "#FFC799" },
      },
      {
         scope: ["entity.name.function", "support.function"],
         settings: { foreground: "#A0A0A0" },
      },
      {
         scope: ["entity.name.tag", "entity.other.attribute-name"],
         settings: { foreground: "#FFC799" },
      },
      {
         scope: ["variable", "variable.parameter"],
         settings: { foreground: "#FFFFFF" },
      },
      {
         scope: ["punctuation", "meta.brace"],
         settings: { foreground: "#8b8b8b" },
      },
   ],
};

export default vesperTheme;
