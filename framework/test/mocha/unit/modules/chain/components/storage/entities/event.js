/* eslint-disable mocha/no-pending-tests */
/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

const {
	entities: { BaseEntity },
	errors: { NonSupportedFilterTypeError, NonSupportedOptionError },
} = require('../../../../../../../../src/components/storage');
const {
	Event,
} = require('../../../../../../../../src/modules/chain/components/storage/entities');
const { StorageSandbox } = require('../../../../../../common/storage_sandbox');
const seeder = require('../../../../../../common/storage_seed');
const eventsFixtures = require('../../../../../../fixtures').events;

describe('Event', () => {
	let adapter;
	let storage;
	let EventEntity;

	const invalidFilter = {
		foo: 'bar',
	};

	const invalidOptions = {
		foo: true,
		bar: true,
	};

	const validFilters = [
		'transactionId',
		'transactionId_eql',
		'transactionId_ne',
		'transactionId_in',
		'transactionId_like',
		'heightNextExecution',
		'heightNextExecution_eql',
		'heightNextExecution_ne',
		'heightNextExecution_gt',
		'heightNextExecution_gte',
		'heightNextExecution_lt',
		'heightNextExecution_lte',
		'heightNextExecution_in',
		'executionsLeft',
		'executionsLeft_eql',
		'executionsLeft_ne',
		'executionsLeft_gt',
		'executionsLeft_gte',
		'executionsLeft_lt',
		'executionsLeft_lte',
		'executionsLeft_in',
	];

	const validEventSQLs = [
		'select',
		'create',
		'isPersisted',
		'update',
		'updateOne',
	];

	const validEventFields = [
		'transactionId',
		'heightNextExecution',
		'executionsLeft',
	];

	const validOptions = {
		sort: 'heightNextExecution:desc',
	};

	const validEvent = new eventsFixtures.Event();
	const validFilter = { heightNextExecution: validEvent.heightNextExecution };

	before(async () => {
		storage = new StorageSandbox(
			__testContext.config.components.storage,
			'lisk_test_storage_custom_event_chain_module'
		);
		await storage.bootstrap();

		adapter = storage.adapter;
		EventEntity = storage.entities.Event;
	});

	beforeEach(() => seeder.seed(storage));

	afterEach(() => {
		sinonSandbox.restore();
		return seeder.reset(storage);
	});

	it('should be a constructable function', async () => {
		expect(Event.prototype.constructor).not.to.be.null;
		expect(Event.prototype.constructor.name).to.be.eql('Event');
	});

	it('should extend BaseEntity', async () => {
		expect(Event.prototype instanceof BaseEntity).to.be.true;
	});

	describe('constructor()', () => {
		it('should accept only one mandatory parameter', async () => {
			expect(Event.prototype.constructor.length).to.be.eql(1);
		});

		it('should have called super', async () => {
			// The reasoning here is that if the parent's contstructor was called
			// the properties from the parent are present in the extending object
			expect(typeof EventEntity.parseFilters).to.be.eql('function');
			expect(typeof EventEntity.addFilter).to.be.eql('function');
			expect(typeof EventEntity.addField).to.be.eql('function');
			expect(typeof EventEntity.getFilters).to.be.eql('function');
			expect(typeof EventEntity.getUpdateSet).to.be.eql('function');
			expect(typeof EventEntity.getValuesSet).to.be.eql('function');
			expect(typeof EventEntity.begin).to.be.eql('function');
			expect(typeof EventEntity.validateFilters).to.be.eql('function');
			expect(typeof EventEntity.validateOptions).to.be.eql('function');
		});

		it('should assign proper sql', async () => {
			expect(EventEntity.SQLs).to.include.all.keys(validEventSQLs);
		});

		it('should call addField the exact number of times', async () => {
			const addFieldSpy = sinonSandbox.spy(Event.prototype, 'addField');
			new Event(adapter);

			expect(addFieldSpy.callCount).to.eql(
				Object.keys(EventEntity.fields).length
			);
		});

		it('should setup correct fields', async () => {
			expect(EventEntity.fields).to.include.all.keys(validEventFields);
		});

		it('should setup specific filters');
	});

	describe('getOne()', () => {
		it('should call _getResults with the correct expectedResultCount', async () => {
			const event = new Event(adapter);
			const _getResultsStub = sinonSandbox
				.stub(event, '_getResults')
				.returns(validEvent);
			event.getOne(validFilter, validOptions, null);
			const _getResultsCall = _getResultsStub.firstCall.args;
			expect(_getResultsCall).to.be.eql([validFilter, validOptions, null, 1]);
		});

		it('should fetch a record from the database', async () => {
			const randEvent = new eventsFixtures.Event();
			await storage.entities.Event.create(randEvent);
			expect(
				await storage.entities.Event.getOne(
					{ heightNextExecution: randEvent.heightNextExecution },
					{ sort: 'heightNextExecution:desc' }
				)
			).to.be.eql(randEvent);
		});
	});

	describe('get()', () => {
		it('should call _getResults with the correct expectedResultCount', async () => {
			const event = new Event(adapter);
			const _getResultsStub = sinonSandbox
				.stub(event, '_getResults')
				.returns(validEvent);
			event.get(validFilter, validOptions, null);
			const _getResultsCall = _getResultsStub.firstCall.args;
			expect(_getResultsCall).to.be.eql([validFilter, validOptions, null]);
		});

		it('should fetch records from the database', async () => {
			const randEvents = [
				new eventsFixtures.Event(),
				new eventsFixtures.Event(),
			].sort((a, b) => a.event - b.event);
			const filters = randEvents.map(aEvent => aEvent.transactionId);
			await storage.entities.Event.create(randEvents);
			expect(
				await storage.entities.Event.get({ transactionId_in: filters })
			).to.be.eql(randEvents);
		});
	});

	describe('_getResults()', () => {
		beforeEach(async () => {
			await storage.entities.Event.create(validEvent);
		});

		afterEach(async () => {
			await storage.entities.Event.delete(validFilter);
		});

		it('should accept only valid filters', async () => {
			expect(() => {
				EventEntity.getOne(validFilter, { sort: 'event:desc' });
			}).not.to.throw(NonSupportedFilterTypeError);
		});

		it('should throw error for invalid filters', async () => {
			expect(() => {
				EventEntity.getOne(invalidFilter);
			}).to.throw(NonSupportedFilterTypeError);
		});

		it('should accept only valid options', async () => {
			expect(() => {
				EventEntity.getOne(validFilter, validOptions);
			}).not.to.throw(NonSupportedOptionError);
		});

		it('should throw error for invalid options', async () => {
			expect(() => {
				EventEntity.getOne(validFilter, invalidOptions);
			}).to.throw(NonSupportedOptionError);
		});

		it('should accept "tx" as last parameter and pass to adapter.executeFile');

		it('should not change any of the provided parameter');

		describe('filters', () => {
			// To make add/remove filters we add their tests.
			it('should have only specific filters', async () => {
				expect(EventEntity.getFilters()).to.eql(validFilters);
			});
			// For each filter type
			it('should return matching result for provided filter');
		});
	});

	describe('isPersisted()', () => {
		let localAdapter;
		const isPersistedSqlFile = 'isPersisted Sql File';
		beforeEach(async () => {
			await EventEntity.create(validEvent);
			localAdapter = {
				loadSQLFiles: sinonSandbox.stub().returns({
					isPersisted: isPersistedSqlFile,
				}),
				executeFile: sinonSandbox.stub().resolves([validEvent]),
				parseQueryComponent: sinonSandbox.stub(),
			};
		});

		afterEach(async () => {
			await EventEntity.delete(validFilter);
		});

		it('should accept only valid filters', async () => {
			expect(() => {
				EventEntity.isPersisted(validFilter);
			}).not.to.throw(NonSupportedFilterTypeError);
		});

		it('should throw error for invalid filters', async () => {
			expect(() => {
				EventEntity.isPersisted(invalidFilter);
			}).to.throw(NonSupportedFilterTypeError);
		});

		it('should call mergeFilters with proper params', async () => {
			const event = new Event(localAdapter);
			event.mergeFilters = sinonSandbox.stub();
			event.parseFilters = sinonSandbox.stub();
			event.isPersisted(validFilter);
			expect(event.mergeFilters.calledWith(validFilter)).to.be.true;
		});

		it('should call parseFilters with proper params', async () => {
			const event = new Event(localAdapter);
			event.mergeFilters = sinonSandbox.stub().returns(validFilter);
			event.parseFilters = sinonSandbox.stub();
			event.isPersisted(validFilter);
			expect(event.parseFilters.calledWith(validFilter)).to.be.true;
		});

		it('should call adapter.executeFile with proper params', async () => {
			const event = new Event(localAdapter);
			event.mergeFilters = sinonSandbox.stub().returns(validFilter);
			event.parseFilters = sinonSandbox.stub();
			event.getUpdateSet = sinonSandbox.stub();
			event.isPersisted(validFilter);
			expect(
				localAdapter.executeFile.calledWith(
					isPersistedSqlFile,
					{
						parsedFilters: undefined,
					},
					{ expectedResultCount: 1 },
					null
				)
			).to.be.true;
		});

		it('should resolve with true if matching record found', async () => {
			const randEvent = { ...validEvent };
			await EventEntity.create(randEvent);
			const res = await EventEntity.isPersisted({
				transactionId: randEvent.transactionId,
			});
			expect(res).to.be.true;
		});

		it('should resolve with false if matching record not found', async () => {
			const randEvent = new eventsFixtures.Event();
			await EventEntity.create(randEvent);
			const res = await EventEntity.isPersisted({ transactionId: 'invalid' });
			expect(res).to.be.false;
		});
	});

	describe('create()', () => {
		it('should save single event', async () => {
			const randEvent = new eventsFixtures.Event();
			await EventEntity.create(randEvent);
			expect(
				await storage.entities.Event.getOne({
					transactionId: randEvent.transactionId,
				})
			).to.be.eql(randEvent);
		});

		it('should save multiple rounds', async () => {
			const randEvents = [
				new eventsFixtures.Event(),
				new eventsFixtures.Event(),
			].sort((a, b) => a.event - b.event);
			const filters = randEvents.map(aEvent => aEvent.transactionId);
			await EventEntity.create(randEvents);
			const result = await EventEntity.get({ transactionId_in: filters });
			expect(result).to.be.eql(randEvents);
		});
	});

	describe('delete', () => {
		let localAdapter;
		const deleteSqlFile = 'deleteSqlFile Sql File';
		beforeEach(async () => {
			localAdapter = {
				loadSQLFiles: sinonSandbox.stub().returns({
					delete: deleteSqlFile,
				}),
				parseQueryComponent: sinonSandbox.stub(),
			};
		});
		it('should accept only valid filters', async () => {
			const randEvent = new eventsFixtures.Event();
			expect(() => {
				EventEntity.delete(validFilter, randEvent);
			}).not.to.throw(NonSupportedFilterTypeError);
		});

		it('should throw error for invalid filters', async () => {
			const randEvent = new eventsFixtures.Event();
			expect(() => {
				EventEntity.delete(invalidFilter, randEvent);
			}).to.throw(NonSupportedFilterTypeError);
		});

		it('should call mergeFilters with proper params', async () => {
			const randEvent = new eventsFixtures.Event();
			localAdapter.executeFile = sinonSandbox.stub().resolves([randEvent]);

			const event = new Event(localAdapter);
			event.mergeFilters = sinonSandbox.stub();
			event.parseFilters = sinonSandbox.stub();
			event.delete(validFilter);
			expect(event.mergeFilters.calledWith(validFilter)).to.be.true;
		});

		it('should call parseFilters with proper params', async () => {
			const randEvent = new eventsFixtures.Event();
			localAdapter.executeFile = sinonSandbox.stub().resolves([randEvent]);

			const event = new Event(localAdapter);
			event.mergeFilters = sinonSandbox.stub().returns(validFilter);
			event.parseFilters = sinonSandbox.stub();
			event.delete(validFilter);
			expect(event.parseFilters.calledWith(validFilter)).to.be.true;
		});

		it('should only delete records specified by filter', async () => {
			const randEventA = new eventsFixtures.Event();
			const randEventB = new eventsFixtures.Event();
			await EventEntity.create([randEventA, randEventB]);
			await EventEntity.delete({ transactionId: randEventA.transactionId });
			const resp = await EventEntity.getOne({
				transactionId: randEventB.transactionId,
			});
			expect(resp).to.eql(randEventB);
		});

		it('should delete all records if no filter is specified', async () => {
			const randEventA = new eventsFixtures.Event();
			const randEventB = new eventsFixtures.Event();
			await EventEntity.create([randEventA, randEventB]);
			await EventEntity.delete();
			const found = await EventEntity.get({
				transactionId_in: [randEventA.transactionId, randEventB.transactionId],
			});
			expect(found.length).to.eql(0);
		});
	});
});
