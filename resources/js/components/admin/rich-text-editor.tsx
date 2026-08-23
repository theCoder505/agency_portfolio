import React, { useState, useRef, useEffect } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    Unlink,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Undo,
    Redo,
    RemoveFormatting,
    Eye,
    Code2,
    Maximize2,
    Minimize2,
    Minus,
    Type
} from 'lucide-react';

interface RichTextEditorProps {
    label?: string;
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    minHeight?: string;
    helperText?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    label = 'Article Description / Content',
    value,
    onChange,
    placeholder = 'Start writing your rich blog post here...',
    minHeight = '350px',
    helperText = 'Use toolbar formatting for headings, quotes, code snippets, lists, and media.',
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isSourceMode, setIsSourceMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [sourceContent, setSourceContent] = useState(value || '');
    const isInternalUpdate = useRef(false);

    // Sync external value with editor div
    useEffect(() => {
        if (!isInternalUpdate.current && editorRef.current) {
            if (editorRef.current.innerHTML !== (value || '')) {
                editorRef.current.innerHTML = value || '';
            }
        }
        setSourceContent(value || '');
        isInternalUpdate.current = false;
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            isInternalUpdate.current = true;
            setSourceContent(html);
            onChange(html === '<p><br></p>' || html === '<br>' ? '' : html);
        }
    };

    const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setSourceContent(val);
        onChange(val);
        if (editorRef.current) {
            editorRef.current.innerHTML = val;
        }
    };

    // Execute standard rich text commands
    const exec = (command: string, val: string | null = null) => {
        if (isSourceMode) return;
        document.execCommand(command, false, val || undefined);
        handleInput();
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    const applyHeading = (tag: string) => {
        if (isSourceMode) return;
        if (tag === 'p') {
            document.execCommand('formatBlock', false, '<p>');
        } else {
            document.execCommand('formatBlock', false, `<${tag}>`);
        }
        handleInput();
    };

    const insertLink = () => {
        if (isSourceMode) return;
        const url = prompt('Enter Hyperlink URL (e.g. https://example.com):');
        if (url) {
            const validUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') ? url : `https://${url}`;
            exec('createLink', validUrl);
        }
    };

    const insertImage = () => {
        if (isSourceMode) return;
        const url = prompt('Enter Image URL (e.g. https://images.unsplash.com/...):');
        if (url) {
            exec('insertImage', url);
        }
    };

    const insertBlockquote = () => {
        if (isSourceMode) return;
        document.execCommand('formatBlock', false, '<blockquote>');
        handleInput();
    };

    const insertCodeBlock = () => {
        if (isSourceMode) return;
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : 'console.log("Hello World");';
        const codeHtml = `<pre><code>${selectedText || 'console.log("Hello World");'}</code></pre><p><br></p>`;
        document.execCommand('insertHTML', false, codeHtml);
        handleInput();
    };

    const insertHorizontalRule = () => {
        exec('insertHorizontalRule');
    };

    return (
        <div className={`space-y-2 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950 p-6 flex flex-col' : 'relative'}`}>
            <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {label}
                </label>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                    <button
                        type="button"
                        onClick={() => setIsSourceMode(!isSourceMode)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            isSourceMode
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Toggle HTML Source Mode"
                    >
                        <Code2 className="h-3.5 w-3.5" />
                        <span>{isSourceMode ? 'Visual Editor' : 'HTML Code'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </div>

            {/* Main Rich Text Container */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col flex-grow">
                {/* Floating Formatting Toolbar */}
                <div className="p-2 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1">
                    {/* Headings Dropdown / Buttons */}
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => applyHeading('p')}
                            className="px-2 py-1 text-xs font-semibold rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                            title="Paragraph"
                        >
                            P
                        </button>
                        <button
                            type="button"
                            onClick={() => applyHeading('h1')}
                            className="px-2 py-1 text-xs font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white"
                            title="Heading 1"
                        >
                            H1
                        </button>
                        <button
                            type="button"
                            onClick={() => applyHeading('h2')}
                            className="px-2 py-1 text-xs font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white"
                            title="Heading 2"
                        >
                            H2
                        </button>
                        <button
                            type="button"
                            onClick={() => applyHeading('h3')}
                            className="px-2 py-1 text-xs font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white"
                            title="Heading 3"
                        >
                            H3
                        </button>
                    </div>

                    <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Inline Formats */}
                    <button
                        type="button"
                        onClick={() => exec('bold')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Bold (Ctrl+B)"
                    >
                        <Bold className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('italic')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Italic (Ctrl+I)"
                    >
                        <Italic className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('underline')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Underline (Ctrl+U)"
                    >
                        <Underline className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('strikeThrough')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Strikethrough"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </button>

                    <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Lists */}
                    <button
                        type="button"
                        onClick={() => exec('insertUnorderedList')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('insertOrderedList')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Numbered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={insertBlockquote}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Blockquote"
                    >
                        <Quote className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={insertCodeBlock}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Code Block"
                    >
                        <Code className="h-4 w-4" />
                    </button>

                    <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Alignment */}
                    <button
                        type="button"
                        onClick={() => exec('justifyLeft')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Align Left"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('justifyCenter')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Align Center"
                    >
                        <AlignCenter className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('justifyRight')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Align Right"
                    >
                        <AlignRight className="h-4 w-4" />
                    </button>

                    <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Links & Media */}
                    <button
                        type="button"
                        onClick={insertLink}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Insert Link"
                    >
                        <LinkIcon className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('unlink')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Remove Link"
                    >
                        <Unlink className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={insertImage}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Insert Image by URL"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={insertHorizontalRule}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Horizontal Divider"
                    >
                        <Minus className="h-4 w-4" />
                    </button>

                    <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Clear format & History */}
                    <button
                        type="button"
                        onClick={() => exec('removeFormat')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Clear Formatting"
                    >
                        <RemoveFormatting className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('undo')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('redo')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="h-4 w-4" />
                    </button>
                </div>

                {/* Editor Content Area */}
                {isSourceMode ? (
                    <textarea
                        value={sourceContent}
                        onChange={handleSourceChange}
                        className="w-full flex-grow p-4 font-mono text-sm bg-slate-900 text-slate-100 focus:outline-none resize-y"
                        style={{ minHeight }}
                        placeholder="Write raw HTML here..."
                    />
                ) : (
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onBlur={handleInput}
                        className="p-4 focus:outline-none blog-content flex-grow overflow-y-auto text-slate-900 dark:text-slate-100"
                        style={{ minHeight }}
                        data-placeholder={placeholder}
                    />
                )}
            </div>

            {helperText && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {helperText}
                </p>
            )}
        </div>
    );
};
