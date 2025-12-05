import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import fs from 'fs/promises';
import path from 'path';

export default defineConfig({
    plugins: [
        pluginReact(),
        {
            name: 'plugin-htaccess-spa',
            setup(api) {
                api.onAfterBuild(async () => {
                    const distPath = path.resolve('dist');
                    const htaccessPath = path.join(distPath, '.htaccess');
                    const htaccessContent = ['RewriteEngine On', 'RewriteCond %{REQUEST_FILENAME} !-f', 'RewriteCond %{REQUEST_FILENAME} !-d', 'RewriteRule ^ index.html [L]'].join('\n');
                    try {
                        await fs.access(distPath);
                        await fs.writeFile(htaccessPath, htaccessContent);
                        api.logger.info('htaccess build xong');
                    } catch {
                        api.logger.error('htaccess build fail');
                    }
                });
            }
        }
    ],
    tools: {
        postcss: {
            postcssOptions: {
                plugins: [tailwindcss]
            }
        }
    },
    resolve: {
        alias: {
            '@': './src'
        }
    },
    html: {
        title: ' ',
    },
    source: {
        tsconfigPath: './jsconfig.json'
    },
    output: {
        dataUriLimit: {
            image: Number.MAX_SAFE_INTEGER,
            svg: Number.MAX_SAFE_INTEGER,
            font: Number.MAX_SAFE_INTEGER,
            media: Number.MAX_SAFE_INTEGER,
            assets: Number.MAX_SAFE_INTEGER
        }
    }
});
