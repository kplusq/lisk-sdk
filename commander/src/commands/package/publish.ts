import * as path from 'path';
import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../../base';
// tslint:disable-next-line: no-require-imports
const ipfsClient = require('ipfs-http-client');

class PackagePublishCommand extends BaseCommand {
	static description = 'Publishes a package to IPFS.';

	static examples = ['package:publish'];

	static flags = {
		...BaseCommand.flags,
		endpoint: flagParser.string({
			description: 'Endpoint url to connect.',
			default: 'ipfs.infura.io',
		}),
		port: flagParser.string({
			description: 'Endpoint port.',
			default: '5001',
		}),
		protocol: flagParser.string({
			description: 'Protocol.',
			default: 'https',
		}),
	};

	async run(): Promise<void> {
		const {
			flags: { endpoint, port, protocol },
		} = this.parse(PackagePublishCommand);

		const workingDirectory = process.cwd();

		const pkg = require(path.join(workingDirectory, './package.json'));

		if (!pkg) {
			throw new Error(
				'package.json not found. Please run the command in the root folder',
			);
		}

		console.log({ endpoint, port, protocol });

		const ipfs = ipfsClient(endpoint, port, { protocol });

		const filesAdded = await ipfs.addFromFs(workingDirectory, {
			recursive: true,
			ignore: [
				'src/**',
				'test/**',
				'node_modules/**',
				'tslint.json',
				'tsconfig.json',
			],
		});

		console.log('Added files:', filesAdded);
		console.log('Last Item:', filesAdded.reverse()[0]);
	}
}

export default PackagePublishCommand;
