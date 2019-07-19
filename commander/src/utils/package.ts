import semver from 'semver';

const isIPFSInstalled = () => {
	try {
		// tslint:disable-next-line: no-require-imports
		const commanderPkg = require('../../package.json');
		// tslint:disable-next-line: no-require-imports no-submodule-imports no-implicit-dependencies
		const ipfsPkg = require('ipfs/package.json');

		if (semver.lt(ipfsPkg.version, commanderPkg.optionalDependencies.ipfs)) {
			throw new Error(
				`ipfs version must be greater than ${
					commanderPkg.optionalDependencies.ipfs
				}`,
			);
		}

		return true;
	} catch (er) {
		return false;
	}
};

export { isIPFSInstalled };
