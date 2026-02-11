import { useState } from "react";

interface TagInputProps {
  placeholder?: string;
  onChange: (skills: string[]) => void;
  suggestions?: string[]; // predefined list of skills
}

const TagInput: React.FC<TagInputProps> = ({
  placeholder,
  onChange,
  suggestions = [],
}) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const addSkill = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || skills.includes(trimmed)) return;

    const newSkills = [...skills, trimmed];
    setSkills(newSkills);
    setInput("");
    setFilteredSuggestions([]);
    onChange?.(newSkills);
  };

  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
    onChange?.(newSkills);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(input);
    } else if (e.key === "Backspace" && !input && skills.length) {
      removeSkill(skills.length - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text");
    const items = paste.split(",").map((i) => i.trim());
    items.forEach((item) => addSkill(item));
    e.preventDefault();
  };

  const handleChange = (value: string) => {
    setInput(value);
    if (value) {
      const filtered = suggestions.filter(
        (s) =>
          s.toLowerCase().includes(value.toLowerCase()) && !skills.includes(s)
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addSkill(suggestion);
  };

  return (
    <div className="w-full relative">
      <div className="flex flex-wrap gap-3 p-3 border rounded-xl min-h-[60px] bg-gray-800 border-gray-700">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm"
          >
            {skill}
            <button
              type="button"
              className="text-white/70 hover:text-white"
              onClick={() => removeSkill(index)}
            >
              ×
            </button>
          </span>
        ))}

        <input
          type="text"
          className="flex-1 bg-transparent focus:outline-none text-white placeholder-gray-400 min-w-[150px] py-2"
          value={input}
          placeholder={placeholder || "Type a skill and press Enter"}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>

      {filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-40 overflow-y-auto w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg">
          {filteredSuggestions.map((s, idx) => (
            <li
              key={idx}
              className="px-4 py-2 cursor-pointer hover:bg-gray-700"
              onClick={() => handleSuggestionClick(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagInput;
