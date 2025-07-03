

export type VueComponentRef<VueComponent extends abstract new (...args: any) => any> = InstanceType<VueComponent> | null;

export type EditorLanguage = 'python' | 'javascript' | 'typescript' | 'json' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'php' | 'html' | 'css' | 'yaml' | 'markdown' | 'rust' | 'shell' | 'sql' | 'bash' | 'powershell' | 'kotlin' | 'swift' | 'lua' | 'perl' | 'properties' | 'scss' | 'xml' | 'plaintext' | 'auto';
