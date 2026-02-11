export const formatAiResponseToHtml = (text: string) => {
	if (!text) return "";

	return text
		.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **Bold** -> <strong>
		.split("\n")
		.map(line => {
			line = line.trim();
			if (line.startsWith("* ")) {
				// * Punkt -> <li> (Soddalashtirilgan variant, editor buni ul/li ga o'raydi)
				return `<li>${line.substring(2)}</li>`;
			}
			return line ? `<div>${line}</div>` : "<div><br></div>";
		})
		.join("");
};
