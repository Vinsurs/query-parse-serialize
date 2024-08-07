import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'QueryParseSerialize',
            fileName: (format) => `query-parse-serialize.${format}.js`
        },
        sourcemap: true,
        target: "es2015"
    },
})