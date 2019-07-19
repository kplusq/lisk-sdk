import * as path from 'path';
import BaseCommand from '../../base';
import { isIPFSInstalled } from '../../utils/package';

class PackagePublishCommand extends BaseCommand {
	static description = 'Publishes a package to IPFS.';

	static examples = ['package:publish'];

	async run(): Promise<void> {
		if (!isIPFSInstalled()) {
			throw new Error('Please install IPFS');
		}

		const workingDirectory = process.cwd();

		const pkg = require(path.join(workingDirectory, './package.json'));

		if (!pkg) {
			throw new Error(
				'package.json not found. Please run the command in the root folder',
			);
		}

		// tslint:disable-next-line: no-require-imports
		const IPFS = require('ipfs');

		const node = new IPFS();

		node.on('ready', async () => {
			const version = await node.version();

			console.log('Version:', version.version);

			const filesAdded = await node.addFromFs(
				path.join(workingDirectory, './bin'),
				{
					recursive: true,
				},
			);

			console.log('Added files:', filesAdded);

			const fileBuffer = await node.cat(filesAdded[1].hash);

			console.log('Added file contents:', fileBuffer.toString());

			await node.stop();
		});
	}
}

export default PackagePublishCommand;
