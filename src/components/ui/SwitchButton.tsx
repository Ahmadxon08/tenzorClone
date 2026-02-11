const SwitchButton = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) => {
  return (
    <div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div
          className="
          w-11 h-6
          bg-gray-300
          rounded-full
          peer-focus:ring-2 peer-focus:ring-blue-500
          peer-checked:bg-blue-600
          peer transition-colors
        "
        ></div>
        <span
          className="
          absolute left-1 top-1
          w-4 h-4 bg-white rounded-full
          transition-all
          peer-checked:translate-x-5
        "
        ></span>
      </label>
    </div>
  );
};

export default SwitchButton;
