import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { mergeConfig, build as viteBuild } from 'vite';
import { createFragmentFile } from './createFragmentFile.js';
import { createConfig } from './createConfig.js';
import { getEntries } from './getEntries.js';
import { log, magenta } from './log.js';
import * as p from './prompts.js';
import { handleCancelledPrompt, mkdirp, prettifyTime } from './utils.js';
import hotShaderReplacement from './plugins/hot-shader-replacement.js';

/**
 * Build a sketch for production
 * @param {string} entry
 * @param {object} options
 * @param {string} options.base
 * @param {string} options.outDir
 * @param {boolean} options.emptyOutDir
 * @param {boolean} options.development
 * @param {boolean} [options.prompts=true]
 */
export async function build(entry, options) {
	const cwd = process.cwd();
	const command = 'build';
	const prefix = log.prefix(command);

	const { prompts = true } = options;

	try {
		const entries = await getEntries(entry, cwd, command, prefix);

		if (!entries.length) return;

		log.message(`${magenta(entry)}\n`, prefix);

		let outDir =
			options.outDir ?? entries[0].split(path.extname(entries[0]))[0];

		if (prompts) {
			outDir = await p.text({
				message: 'Output directory:',
				placeholder: '.',
				hint: '(hit Enter to use current directory)',
				initialValue: outDir,
			});

			handleCancelledPrompt(outDir, prefix);
		}

		if (!outDir) {
			outDir = '';
		}

		let outDirPath = path.join(cwd, outDir);

		// create directory if it doesn't exist
		mkdirp(outDirPath);

		const files = await readdir(outDirPath);

		let emptyOutDir = options.emptyOutDir ?? true;

		if (files.length > 0) {
			log.warn(`${outDirPath} is not an empty folder.\n`);

			if (prompts) {
				emptyOutDir = await p.confirm({
					message: 'Empty folder before building?',
					active: 'Yes',
					inactive: 'No',
					initialValue: emptyOutDir,
				});

				handleCancelledPrompt(emptyOutDir, prefix);
			}
		}

		let base = options.base;

		if (prompts) {
			base = await p.text({
				message: 'Base public path:',
				placeholder: `/`,
				hint: '(Hit Enter to validate)',
				initialValue: base,
			});

			handleCancelledPrompt(base, prefix);
		}

		if (entries.length > 0) {
			log.message(
				`Building ${magenta(entries[0])} for production...\n`,
				prefix,
			);

			const fragmentFilepath = await createFragmentFile(entries, cwd);
			const config = await createConfig(
				entries,
				fragmentFilepath,
				{
					dev: options.development,
					build: true,
				},
				options.config,
				cwd,
			);

			if (entries.length > 1) {
				log.error(
					`fragment can only build one sketch at a time.`,
					prefix,
				);
				return;
			}

			let startTime = Date.now();

			await viteBuild(
				mergeConfig(config, {
					logLevel: 'info',
					base,
          assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr'],
					build: {
						outDir: outDirPath,
						emptyOutDir,
					},
					plugins: [hotShaderReplacement({ cwd })],
				}),
			);

			// line break after vite logs
			log.message();

			log.success(
				`Done in ${prettifyTime(Date.now() - startTime)}`,
				prefix,
			);
		}
	} catch (error) {
		log.error(`Error\n`, prefix);
		console.error(error);
	}
}
