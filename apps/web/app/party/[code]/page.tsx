"use client";

import { use } from "react";
import { PartyScreen } from "@reelparty/app";

export default function PartyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  return <PartyScreen code={code} />;
}
