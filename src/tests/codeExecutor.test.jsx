import { describe, it, expect } from 'vitest';
import { stripTypeScript, runWithTimeout } from '../components/CodeExecutor';

describe('CodeExecutor Hardening & TypeScript Stripping', () => {
  describe('stripTypeScript', () => {
    it('strips interface declarations cleanly', () => {
      const ts = `interface User {\n  name: string;\n  age: number;\n}\nconst u = { name: "Alice", age: 30 };\nreturn u.name;`;
      const js = stripTypeScript(ts);
      expect(js).not.toContain('interface User');
      expect(js).toContain('const u = { name: "Alice", age: 30 };');
    });

    it('strips type alias declarations', () => {
      const ts = `type ID = string | number;\nconst id = 123;\nreturn id;`;
      const js = stripTypeScript(ts);
      expect(js).not.toContain('type ID');
      expect(js).toContain('const id = 123;');
    });

    it('strips variable type annotations', () => {
      const ts = `let count: number = 42;\nconst title: string = "Hello";\nreturn count;`;
      const js = stripTypeScript(ts);
      expect(js).toContain('let count = 42;');
      expect(js).toContain('const title = "Hello";');
    });

    it('strips function parameter and return type annotations', () => {
      const ts = `function add(a: number, b: number): number {\n  return a + b;\n}\nreturn add(2, 3);`;
      const js = stripTypeScript(ts);
      expect(js).not.toContain(': number');
      expect(js).toContain('add(a, b)');
    });

    it('strips "as Type" assertions', () => {
      const ts = `const val = (document as any);\nreturn 1;`;
      const js = stripTypeScript(ts);
      expect(js).not.toContain('as any');
    });
  });

  describe('runWithTimeout execution & safety', () => {
    it('executes valid JavaScript and returns result', async () => {
      const code = `const a = 10; const b = 20; return a + b;`;
      const result = await runWithTimeout(code, 2000);
      expect(result.success).toBe(true);
      expect(result.result).toBe(30);
    });

    it('captures console.log output during execution', async () => {
      const code = `console.log("Hello from sandbox"); return 100;`;
      const result = await runWithTimeout(code, 2000);
      expect(result.success).toBe(true);
      expect(result.logs).toContain('Hello from sandbox');
      expect(result.result).toBe(100);
    });

    it('handles runtime errors gracefully without throwing unhandled exceptions', async () => {
      const code = `throw new Error("Custom test error");`;
      const result = await runWithTimeout(code, 2000);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Custom test error');
    });
  });
});
