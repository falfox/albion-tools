import classname from "classnames";
import { components, OptionTypeBase, SingleValueProps } from "react-select";
import "../styles/main.css";

export const CustomOption = (props) => {
  const { data, innerRef, innerProps } = props;

  return (
    <div
      ref={innerRef}
      className="flex items-center px-3 py-2 hover:bg-blue-100"
      {...innerProps}
    >
      <img
        className="w-10 h-10 bg-gray-300 rounded"
        src={`https://gameinfo.albiononline.com/api/gameinfo/items/${data.value}`}
        alt=""
      />
      <span className="pl-2 text-lg">{data.label}</span>
    </div>
  );
};

export const CustomSingleValue: React.FC<SingleValueProps<OptionTypeBase>> = ({
  selectProps,
  data,
  isDisabled,
  className,
}) => {
  return (
    <div
      className={classname("flex items-center", {
        "single-value": true,
        "single-value--is-disabled": isDisabled,
      })}
    >
      <img
        className="w-8 h-8"
        src={`https://gameinfo.albiononline.com/api/gameinfo/items/${data.value}`}
        alt=""
      />
      <span className="pl-2 text-lg truncate whitespace-no-wrap">
        {selectProps.getOptionLabel(data)}
      </span>
    </div>
  );
};

export const Input = (props) => {
  return <components.Input className="flex-shrink-0 w-1" {...props} />;
};
