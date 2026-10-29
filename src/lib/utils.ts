import { createCn } from "cn/config";

// Register the Stitch tokens from globals.css so class merging knows `text-headline-sm` is a size
// (not a colour) and `p-space-lg` is spacing; otherwise they get dropped when combined.
export const cn = createCn({
  extend: {
    theme: { spacing: ["space-xs", "space-sm", "space-md", "space-lg", "space-xl", "gutter", "gutter-desktop"] },
    classGroups: {
      "font-size": [{ text: ["display", "headline-lg", "headline-md", "headline-sm", "body-lg", "body-md",
        "body-sm", "data-mono", "label-md", "label-sm", "label-xs"] }],
      shadow: [{ shadow: ["card", "chrome", "popover", "modal"] }],
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  console.assert(cn("text-headline-sm", "text-primary") === "text-headline-sm text-primary", "cn: font-size token merged as colour");
  console.assert(cn("p-space-lg", "p-2") === "p-2", "cn: spacing token not merged");
}
