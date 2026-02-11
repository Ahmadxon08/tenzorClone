import React, { useRef, useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Type } from "lucide-react";

interface RichEditorProps {
	value: string;
	onChange: (html: string) => void;
	label: string;
	placeholder?: string;
	children: React.ReactNode;
}

const RichEditor = ({
	value,
	onChange,
	label,
	placeholder,
	children,
}: RichEditorProps) => {
	const editorRef = useRef<HTMLDivElement>(null);

	// Initial value loading
	useEffect(() => {
		if (!editorRef.current) return;

		// Faqat tashqaridan kelgan value boshqa bo‘lsa
		if (editorRef.current.innerHTML !== value) {
			editorRef.current.innerHTML = value || "";
		}
	}, [value]);

	const execCommand = (command: string, event: React.MouseEvent) => {
		event.preventDefault(); // Tugmani bosganda fokus editor'dan ketib qolmasligi uchun

		if (editorRef.current) {
			editorRef.current.focus(); // Har doim fokusi editor'ga qaytaramiz
			document.execCommand(command, false);
			onChange(editorRef.current.innerHTML);
		}
	};

	const handleInput = () => {
		if (!editorRef.current) return;
		onChange(editorRef.current.innerHTML);
	};

	return (
		<div className='w-full'>
			<label className='block text-xs sm:text-sm font-medium text-gray-300 mb-2'>
				{label}
			</label>

			<div className='border border-white/10 rounded-xl overflow-hidden bg-[#0a1b30]/50 transition-all focus-within:border-blue-500/50 relative'>
				{/* Toolbar */}
				<div className='flex items-center gap-1 p-2 border-b border-white/10 bg-white/5'>
					<button
						type='button'
						onMouseDown={e => execCommand("bold", e)}
						className='p-1.5 hover:bg-white/10 rounded text-gray-300 transition-colors active:scale-95'
					>
						<Bold size={18} />
					</button>
					<button
						type='button'
						onMouseDown={e => execCommand("italic", e)}
						className='p-1.5 hover:bg-white/10 rounded text-gray-300 transition-colors active:scale-95'
					>
						<Italic size={18} />
					</button>
					<div className='w-[1px] h-4 bg-white/10 mx-1' />
					<button
						type='button'
						onMouseDown={e => execCommand("insertUnorderedList", e)}
						className='p-1.5 hover:bg-white/10 rounded text-gray-300 transition-colors active:scale-95'
					>
						<List size={18} />
					</button>
					<button
						type='button'
						onMouseDown={e => execCommand("insertOrderedList", e)}
						className='p-1.5 hover:bg-white/10 rounded text-gray-300 transition-colors active:scale-95'
					>
						<ListOrdered size={18} />
					</button>
					<button
						type='button'
						onMouseDown={e => execCommand("removeFormat", e)}
						className='p-1.5 hover:bg-white/10 rounded text-gray-300 transition-colors'
						title='Tozalash'
					>
						<Type size={18} />
					</button>
				</div>

				{/* Editable Area */}
				{/* <div
					ref={editorRef}
					// dangerouslySetInnerHTML={{ __html: value || "" }}
					contentEditable
					onInput={handleInput}
					onBlur={handleInput}
					className='w-full min-h-[150px] px-4 py-3 text-white outline-none text-sm leading-relaxed list-inside'
					data-placeholder={placeholder}
					style={{
						whiteSpace: "pre-wrap",
					}}
				/> */}
				<div
					ref={editorRef}
					contentEditable
					spellCheck={false}
					onInput={handleInput}
					onBlur={handleInput}
					className='w-full min-h-[150px] px-4 py-3 text-white outline-none text-sm leading-relaxed list-inside'
					data-placeholder={placeholder}
					style={{ whiteSpace: "pre-wrap" }}
				/>
				{children}
			</div>

			{/* CSS for list items inside the div */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #6b7280;
                    cursor: text;
                }
                [contenteditable] ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 0.5rem 0; }
                [contenteditable] ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 0.5rem 0; }
                [contenteditable] li { display: list-item !important; }
            `,
				}}
			/>
			<style
				dangerouslySetInnerHTML={{
					__html: `
    [contenteditable]:empty:before {
        content: attr(data-placeholder);
        color: #6b7280;
        cursor: text;
    }
    /* Sarlavhalar (Strong) uchun rang va masofa */
    [contenteditable] strong {
        color: #ffffff;
        display: block;
        margin-top: 10px;
        margin-bottom: 5px;
        font-size: 1rem;
    }
    /* Ro'yxat elementlari uchun (Rasmdagi kabi oq nuqtalar) */
    [contenteditable] ul, [contenteditable] li {
        list-style-type: disc !important;
        color: #d1d5db; /* matn rangi */
        margin-left: 1rem;
        margin-bottom: 4px;
    }
    [contenteditable] div {
        margin-bottom: 2px;
    }
`,
				}}
			/>
		</div>
	);
};
export default RichEditor;
