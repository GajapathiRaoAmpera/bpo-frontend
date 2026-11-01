import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { BotStudioPage } from "@/views/bot-studio/bot-studio-page";

export const metadata: Metadata = { title: "Bot Studio" };

export default function Page() {
  return (
    <ScreenGuard screen="bot_studio">
      <BotStudioPage />
    </ScreenGuard>
  );
}
