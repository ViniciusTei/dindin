import { RiHeartFill, RiCalendar2Fill, RiInbox2Fill, RiUser2Fill, RiLogoutBoxFill } from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

type IconName = 
  | "heart"
  | "months"
  | "invite"
  | "admin-users"
  | "logout"

type IconProps = React.ComponentPropsWithoutRef<RemixiconComponentType> & {
  name: IconName;
};

function Icon({ name, ...props }: IconProps) {
  if (name === "heart") {
    return <RiHeartFill {...props} />;
  }

  if (name === "months") {
    return <RiCalendar2Fill {...props} />;
  }

  if (name === "invite") {
    return <RiInbox2Fill {...props} />;
  }

  if (name === "admin-users") {
    return <RiUser2Fill {...props} />;
  }

  if (name === "logout") {
    return <RiLogoutBoxFill {...props} />;
  }

  return (
    <div>Icon</div>
  )
}

export default Icon