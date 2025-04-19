'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  CodeToggle,
  CreateLink
} from '@mdxeditor/editor';

import '@mdxeditor/editor/style.css';
import { cn } from '@/lib/utils';

// Função auxiliar para converter markdown para HTML (simulada)
const markdownToHtml = (markdown) => {
  try {
    // Esta é uma implementação básica que seria substituída por uma biblioteca
    // de renderização de markdown completa, como marked ou remark
    let html = markdown || '';
    
    // Cabeçalhos
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Negrito e itálico
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    html = html.replace(/\_\_(.*)\_\_/gim, '<strong>$1</strong>');
    html = html.replace(/\_(.*)\_/gim, '<em>$1</em>');
    
    // Listas
    html = html.replace(/^\s*\n\* (.*)/gim, '<ul>\n<li>$1</li>\n</ul>');
    html = html.replace(/^\s*\n\- (.*)/gim, '<ul>\n<li>$1</li>\n</ul>');
    html = html.replace(/^\s*\n\d\. (.*)/gim, '<ol>\n<li>$1</li>\n</ol>');
    
    // Links
    html = html.replace(/\[(.*)]\((.*)\)/gim, '<a href="$2">$1</a>');
    
    // Parágrafos
    html = html.replace(/^\s*(\n)?(.+)/gim, function(m) {
      return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>'+m+'</p>';
    });
    
    // Quebra de linha
    html = html.replace(/\n/gim, '<br />');
    
    return html.trim();
  } catch (e) {
    console.error('Erro ao converter markdown para HTML:', e);
    return markdown || '';
  }
};

const MarkdownEditor = forwardRef(
  (
    {
      markdown = '',
      onChange,
      placeholder = 'Escreva seu conteúdo aqui...',
      className,
      contentEditableClassName,
      readOnly = false,
      ...props
    },
    ref
  ) => {
    const editorRef = useRef(null);

    useImperativeHandle(ref, () => ({
      getMarkdown: () => editorRef.current?.getMarkdown(),
      getHtml: () => {
        const md = editorRef.current?.getMarkdown() || '';
        return markdownToHtml(md);
      },
      setMarkdown: (markdown) => editorRef.current?.setMarkdown(markdown),
      insertMarkdown: (markdown) => editorRef.current?.insertMarkdown(markdown),
      focus: () => editorRef.current?.focus(),
    }));

    return (
      <div className={cn('relative border rounded-md', className)}>
        <MDXEditor
          ref={editorRef}
          markdown={markdown}
          placeholder={placeholder}
          readOnly={readOnly}
          onChange={onChange}
          contentEditableClassName={cn('prose dark:prose-invert max-w-none p-4', contentEditableClassName)}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            linkPlugin(),
            imagePlugin(),
            tablePlugin(),
            codeBlockPlugin(),
            codeMirrorPlugin({
              codeBlockLanguages: {
                js: 'JavaScript',
                php: 'PHP',
                css: 'CSS',
                html: 'HTML',
                json: 'JSON',
              },
            }),
            diffSourcePlugin(),
            markdownShortcutPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <BlockTypeSelect />
                  <CodeToggle />
                  <ListsToggle />
                  <CreateLink />
                  <InsertImage />
                  <InsertTable />
                  <InsertThematicBreak />
                </>
              ),
            }),
          ]}
          {...props}
        />
      </div>
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';

export { MarkdownEditor }; 