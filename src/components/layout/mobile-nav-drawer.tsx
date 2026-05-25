import { getActiveMajlisList } from "@/lib/majlis/list-majlis";

import { MobileNavDrawerClient } from "@/components/layout/mobile-nav-drawer-client";

export async function MobileNavDrawer() {
  const activeMajlis = await getActiveMajlisList();

  return <MobileNavDrawerClient activeMajlis={activeMajlis} />;
}