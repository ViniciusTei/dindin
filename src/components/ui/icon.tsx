import { IconBaseProps } from "react-icons";
import { BsBarChart } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { GiTakeMyMoney } from "react-icons/gi";
import { GoHome } from "react-icons/go";
import { HiOutlineCalculator } from "react-icons/hi";
import { IoSettingsOutline } from "react-icons/io5";
import { VscLoading } from "react-icons/vsc";

interface Props extends IconBaseProps {
  name: string;
}

export default function Icon({ name, ...props }: Props) {
  const cls = props.className ?? "";
  switch (name) {
    case "take-my-money":
      return <GiTakeMyMoney {...props} />;
    case "home":
      return <GoHome {...props} />;
    case "calculator":
      return <HiOutlineCalculator {...props} />;
    case "settings":
      return <IoSettingsOutline {...props} />;
    case "chart-bar":
      return <BsBarChart {...props} />;
    case "plus":
      return <FaPlus {...props} />;
    case "loading":
      return <VscLoading className={`animate-spin ${cls}`} {...props} />;
    default:
      console.error(`Sorry, icon ${name} is not implemented.`);
  }
}
