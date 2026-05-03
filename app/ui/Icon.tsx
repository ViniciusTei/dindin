import {
  RiArrowLeftFill,
  RiArrowRightFill,
  RiBankCardFill,
  RiBankFill,
  RiHeartFill,
  RiInbox2Fill,
  RiUser2Fill,
  RiLogoutBoxFill,
  RiDashboardFill,
  RiAccountBoxLine,
  RiBookShelfLine,
  RiWalletLine,
  RiMoonLine,
  RiSunLine,
  RiSettings3Line,
  RiGroupLine,
  RiDeleteBin2Line,
  RiPencilLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

export type IconName = keyof typeof availableIcons;

const availableIcons = {
  heart: RiHeartFill,
  invite: RiInbox2Fill,
  "admin-users": RiUser2Fill,
  logout: RiLogoutBoxFill,
  dashboard: RiDashboardFill,
  moon: RiMoonLine,
  sun: RiSunLine,
  categories: RiBookShelfLine,
  account: RiAccountBoxLine,
  settings: RiSettings3Line,
  wallet: RiWalletLine,
  "credit-card": RiBankCardFill,
  bank: RiBankFill,
  "arrow-left": RiArrowLeftFill,
  "arrow-right": RiArrowRightFill,
  team: RiGroupLine,
  trash: RiDeleteBin2Line,
  pencil: RiPencilLine,
  "menu-fold": RiMenuFoldLine,
  "menu-unfold": RiMenuUnfoldLine,
};

type Props = Omit<RemixiconComponentType, "name" | "className"> & {
  name: IconName;
  className?: string;
};

export default function Icon({ name = "heart", className, ...props }: Props) {
  const Component = availableIcons[name];

  if (!Component) {
    console.warn(
      `Icon "${name}" not found. Please make sure it's included in the availableIcons object.`,
    );
    return null;
  }

  return <Component className={"inline " + className} {...props} />;
}
