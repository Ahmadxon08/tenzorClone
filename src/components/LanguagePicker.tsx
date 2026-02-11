import React from "react";
import { Select } from "antd";

const { Option } = Select;

interface LanguagePickerProps {
  value: "uz" | "en" | "ru";
  onChange: (val: "uz" | "en" | "ru") => void;
}

const LanguagePicker: React.FC<LanguagePickerProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onChange={onChange}
        style={{
          height: 40,
        }}
        dropdownStyle={{
          background: "rgba(10,27,48,0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: 12,
        }}
      >
        <Option value="uz">UZ</Option>
        <Option value="ru">RU</Option>
        <Option value="en">EN</Option>
      </Select>
    </div>
  );
};

export default LanguagePicker;
