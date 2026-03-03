// openapi.config.ts
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: "http://localhost:5276/openapi/v1.json",
    output: {
        path: './src/lib/api-client',
        format: 'prettier',
        clean: true,
    },
    types: {
        enums: 'typescript',
    },
    plugins: [
        '@hey-api/client-fetch',
        {
            name: '@hey-api/typescript',
            enums: true,
        }
    ],
});