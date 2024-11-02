import { jest, it, describe } from "@jest/globals";
import {
	createPXEClient,
	AccountWalletWithSecretKey,
	TxStatus,
} from "@aztec/aztec.js";
import {
	deployInitialTestAccounts,
	getDeployedTestAccountsWallets,
} from "@aztec/accounts/testing";
import { SANDBOX_URL, TIMEOUT } from "./constants.js";
import { TestContract } from "./Test.js";

const pxe = createPXEClient(SANDBOX_URL);
let deployer: AccountWalletWithSecretKey;
let testContract: TestContract;

beforeEach(async () => {
	deployer = (await getDeployedTestAccountsWallets(pxe))[0];
	console.log("deployer: ", deployer.getAddress());

	const isDeployed = await pxe.isContractInitialized(deployer.getAddress());
	if (!isDeployed) {
		await deployInitialTestAccounts(pxe);
	}

	testContract = (await TestContract.deploy(deployer).send().wait()).contract;
}, TIMEOUT);

describe("Private Mutable Read", () => {
	jest.setTimeout(TIMEOUT);
	it("should fail due to no note emission", async () => {
		// first read
		const first = await testContract.methods
			.test_private_mutable_read()
			.send()
			.wait();
		console.log("first: ", first.status);

		// second read
		await expect(
			testContract.methods.test_private_mutable_read().prove()
		).rejects.toThrow(`Assertion failed 'self.is_some()'`);
	});
});

describe("Private Mutable Read With Note Emission", () => {
	jest.setTimeout(TIMEOUT);
	it("should succeed with note emission", async () => {
		// first read
		const first = await testContract.methods
			.test_private_mutable_read_with_note_emission()
			.send()
			.wait();
		console.log("first: ", first.status);

		// second read
		const second = await testContract.methods
			.test_private_mutable_read_with_note_emission()
			.send()
			.wait();
		console.log("second: ", second.status);
		expect(first.status).toBe(TxStatus.SUCCESS);
	});
});
