import { RiHeartFill, RiCalendar2Fill, RiInbox2Fill, RiUser2Fill, RiLogoutBoxFill, RiDashboardFill, RiSquareFill, RiAccountBoxLine, RiBookShelfLine, RiWalletLine } from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

export type IconName = keyof typeof availableIcons

const availableIcons = {
  'heart': RiHeartFill,
  'months': RiCalendar2Fill,
  'invite': RiInbox2Fill,
  'admin-users': RiUser2Fill,
  'logout': RiLogoutBoxFill,
  'dashboard': RiDashboardFill,
  'categories': RiBookShelfLine,
  'account': RiAccountBoxLine,
  'wallet': RiWalletLine,
}
type Props = Omit<RemixiconComponentType, 'name' | 'className'> & {
  name: IconName
  className?: string
}

export default function Icon({
  name = 'heart',
  className,
  ...props
}: Props) {
  const Component = availableIcons[name]

  if (!Component) {
    console.warn(`Icon "${name}" not found. Please make sure it's included in the availableIcons object.`)
    return null
  }

  return (
    <Component
      className={'inline ' + className}
      {...props}
    />
  )
}
