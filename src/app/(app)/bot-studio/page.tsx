import type { Metadata } from "next";

import { BotStudio } from "@/app/(app)/bot-studio/bot-studio";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Bot Studio" };

export default function Page() {
  return (
    <ScreenGuard screen="bot_studio">
      <BotStudio />
    </ScreenGuard>
  );
}
