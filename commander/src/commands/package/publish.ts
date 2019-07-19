import * as path from 'path';
import BaseCommand from '../../base';
// tslint:disable-next-line: no-require-imports
const ipfsClient = require('ipfs-http-client');

class PackagePublishCommand extends BaseCommand {
	static description = 'Publishes a package to IPFS.';

	static examples = ['package:publish'];

	async run(): Promise<void> {
		const workingDirectory = process.cwd();

		const pkg = require(path.join(workingDirectory, './package.json'));

		if (!pkg) {
			throw new Error(
				'package.json not found. Please run the command in the root folder',
			);
		}
		const ipfs = ipfsClient('ipfs.infura.io', '5001', { protocol: 'https' });

		const version = await ipfs.version();

		console.log('Version:', version.version);

		const filesAdded = await ipfs.addFromFs(
			path.join(workingDirectory, './bin'),
			{
				recursive: true,
			},
		);

		console.log('Added files:', filesAdded);

		const fileBuffer = await ipfs.cat(filesAdded[1].hash);

		console.log('Added file contents:', fileBuffer.toString());
	}
}

export default PackagePublishCommand;
