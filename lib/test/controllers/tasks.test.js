'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiHttp = require('chai-http');

var _chaiHttp2 = _interopRequireDefault(_chaiHttp);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var _tasks = require('../../models/tasks.model');

var _tasks2 = _interopRequireDefault(_tasks);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect,
    assert = _chai2.default.assert;

var should = _chai2.default.should();

_chai2.default.use(_chaiHttp2.default);
_chai2.default.use(_chaiAsPromised2.default);

var testTask = {
	name: 'Task1',
	notes: 'Notes',
	completed: false,
	parent: null,
	children: []
};

async function createTestTask(callback) {
	_tasks2.default.create(testTask, function (err, createdTask) {
		callback(createdTask.id);
	});
}

async function deleteAllTasks(callback) {
	_tasks2.default.deleteMany({}, function (err) {
		callback();
	});
}

describe('Tasks', function () {

	before(function (done) {
		(0, _utils.prepareServer)(done);
	});

	describe('task creation', function () {

		afterEach(function (done) {
			deleteAllTasks(done);
		});

		it('POST /api/s/task (no task given)', function (done) {
			(0, _utils.withLogin)(_chai2.default.request(_utils.app).post('/api/s/task'), function (req) {
				req.end(function (err, res) {
					if (err) return done(err);
					res.should.have.status(200);
					res.body.should.be.a('object');
					expect(res.body.name).to.equal('Untitled');
					expect(res.body.notes).to.equal(null);
					expect(res.body.completed).to.equal(false);
					expect(res.body.parent).to.equal(null);
					expect(JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));
					done();
				});
			});
		});

		it('POST /api/s/task (given task)', function (done) {
			(0, _utils.withLogin)(_chai2.default.request(_utils.app).post('/api/s/task').send(testTask), function (req) {
				req.end(function (err, res) {
					if (err) return done(err);
					res.should.have.status(200);
					res.body.should.be.a('object');
					expect(res.body.name).to.equal('Task1');
					expect(res.body.notes).to.equal('Notes');
					expect(res.body.completed).to.equal(false);
					expect(res.body.parent).to.equal(null);
					expect(JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));
					done();
				});
			});
		});

		it('POST /api/s/task (given task with a parent)', function (done) {
			createTestTask(function (test_task_id) {
				var newTask = Object.assign({}, testTask);
				newTask['parent'] = test_task_id;
				newTask['name'] = 'Task2';
				(0, _utils.withLogin)(_chai2.default.request(_utils.app).post('/api/s/task').send(newTask), function (req) {
					req.end(function (err, res) {
						if (err) return done(err);
						res.should.have.status(200);
						res.body.should.be.a('object');
						expect(res.body.name).to.equal('Task2');
						expect(res.body.notes).to.equal('Notes');
						expect(res.body.completed).to.equal(false);
						expect(res.body.parent).to.equal(test_task_id);
						expect(JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));

						// Expect parent to have children
						_tasks2.default.findById(test_task_id).then(function (task) {
							expect(task.children.length).to.equal(1);
							expect(task.children[0]).to.equal(res.body._id);
						}).then(done).catch(done);
					});
				});
			});
		});
	});

	describe('getting tasks', function () {

		afterEach(function (done) {
			deleteAllTasks(done);
		});

		it('GET /api/s/task (no task ID)', function (done) {
			(0, _utils.withLogin)(_chai2.default.request(_utils.app).get('/api/s/task'), function (req) {
				req.end(function (err, res) {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').contains('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('GET /api/s/task (empty task ID)', function (done) {
			(0, _utils.withLogin)(_chai2.default.request(_utils.app).get('/api/s/task').send({ task_id: '' }), function (req) {
				req.end(function (err, res) {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('GET /api/s/task (valid task ID)', function (done) {
			createTestTask(function (test_task_id) {
				(0, _utils.withLogin)(_chai2.default.request(_utils.app).get('/api/s/task').send({ task_id: test_task_id }), function (req) {
					req.end(function (err, res) {
						if (err) return done(err);
						res.should.have.status(200);
						res.body.should.be.a('object');
						expect(res.body.name).to.equal('Task1');
						expect(res.body.notes).to.equal('Notes');
						expect(res.body.completed).to.equal(false);
						expect(res.body.parent).to.equal(null);
						expect(JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));
						done();
					});
				});
			});
		});
	});

	describe('task updating', function () {

		afterEach(function (done) {
			deleteAllTasks(done);
		});

		it('PATCH /api/s/task (no task ID #1)', function (done) {
			(0, _utils.withLogin)(_chai2.default.request(_utils.app).patch('/api/s/task'), function (req) {
				req.end(function (err, res) {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('PATCH /api/s/task (no task ID #2)', function (done) {
			(0, _utils.withLogin)(_chai2.default.request(_utils.app).patch('/api/s/task').send({}), function (req) {
				req.end(function (err, res) {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('PATCH /api/s/task (null task ID)', function (done) {
			(0, _utils.withLogin)(_chai2.default.request(_utils.app).patch('/api/s/task').send({ task_id: null }), function (req) {
				req.end(function (err, res) {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('PATCH /api/s/task (empty task ID)', function (done) {
			(0, _utils.withLogin)(_chai2.default.request(_utils.app).patch('/api/s/task').send({ task_id: '' }), function (req) {
				req.end(function (err, res) {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('PATCH /api/s/task (invalid parent task ID)', function (done) {
			createTestTask(function (test_task_id) {
				(0, _utils.withLogin)(_chai2.default.request(_utils.app).patch('/api/s/task').send({ task_id: test_task_id,
					parent: 'invalid_parent_id' }), function (req) {
					req.end(function (err, res) {
						if (err) return done(err);
						res.should.have.status(400);
						res.body.should.have.property('message').eql('Could not find desired parent task with id \'invalid_parent_id\'');
						done();
					});
				});
			});
		});

		it('PATCH /api/s/task (valid task ID)', function (done) {
			// Create a new task to be the parent of testTask
			createTestTask(function (test_task_id) {
				_tasks2.default.create({
					name: 'Task1',
					notes: 'Notes',
					completed: false,
					parent: null,
					children: []
				}, function (err, new_task) {

					var updates = {
						name: 'updated name',
						notes: 'updated notes',
						completed: true,
						parent: new_task.id,
						task_id: test_task_id
					};
					(0, _utils.withLogin)(_chai2.default.request(_utils.app).patch('/api/s/task').send(updates), function (req) {
						req.end(function (err, res) {
							if (err) {
								return done(err);
							}
							res.should.have.status(200);
							res.body.should.be.a('object');
							expect(res.body.name).to.equal('updated name');
							expect(res.body.notes).to.equal('updated notes');
							expect(res.body.completed).to.equal(true);
							expect(res.body.parent).to.equal(updates.parent);
							expect(JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));
							// Check that parent task has testTask as a child
							_tasks2.default.findById(new_task.id, function (err, parentTask) {
								expect(err).to.be.null;
								expect(JSON.stringify(parentTask.children)).to.equal(JSON.stringify([test_task_id]));
								done();
							});
						});
					});
				});
			});
		});
	});

	describe('removing task children', function () {

		afterEach(function (done) {
			deleteAllTasks(done);
		});

		it('POST /api/s/removeChildren (no child IDs)', function (done) {
			(0, _utils.withLogin)(_chai2.default.request(_utils.app).post('/api/s/removeChildren'), function (req) {
				req.end(function (err, res) {
					if (err) return done(err);
					res.should.have.status(500);
					res.body.should.have.property('message').eql('Error removing children - no children given');
					done();
				});
			});
		});

		it('POST /api/s/removeChildren (null child ID)', function (done) {
			(0, _utils.withLogin)(_chai2.default.request(_utils.app).post('/api/s/removeChildren').send({ child_ids: null }), function (req) {
				req.end(function (err, res) {
					if (err) return done(err);
					res.should.have.status(500);
					res.body.should.have.property('message').eql('Error removing children - no children given');
					done();
				});
			});
		});

		it('POST /api/s/removeChildren (valid child IDs)', function (done) {

			// Create the two tasks
			createTestTask(function (test_task_id_1) {
				createTestTask(function (test_task_id_2) {
					// Attach the child to the parent
					var updates = {
						parent: test_task_id_1,
						task_id: test_task_id_2
					};
					(0, _utils.withLogin)(_chai2.default.request(_utils.app).patch('/api/s/task').send(updates), function (req) {
						req.end(function (err, res) {
							if (err) {
								return done(err);
							}
							// Assert that we are in a state where there is a parent and child
							_tasks2.default.findById(test_task_id_1).exec().then(function (task_1) {
								expect(JSON.stringify(task_1.children)).to.equal(JSON.stringify([test_task_id_2]));
								return _tasks2.default.findById(test_task_id_2).exec();
							}).then(function (task_2) {
								expect(task_2.parent).to.equal(test_task_id_1);
								// Now do the actual child remove operation
								(0, _utils.withLogin)(_chai2.default.request(_utils.app).post('/api/s/removeChildren').send({ child_ids: [test_task_id_2] }), function (req) {
									req.end(function (err, res) {
										if (err) return done(err);
										res.should.have.status(200);
										res.body.should.be.a('object');
										expect(res.body.errors).to.be.empty;
										// Check that test_task_id_1 is no longer the parent of test_task_id_1
										_tasks2.default.findById(test_task_id_1).exec().then(function (task1) {
											expect(JSON.stringify(task1.children)).to.equal(JSON.stringify([]));
											return _tasks2.default.findById(test_task_id_2).exec();
										}).then(function (task2) {
											expect(task2.parent).to.be.null;
											done();
										}).catch(function (err) {
											return done(err);
										});
									});
								});
							}).catch(function (err) {
								return done(err);
							});
						});
					});
				});
			});
		});
	});

	describe('task deletion', function () {

		afterEach(function (done) {
			deleteAllTasks(done);
		});

		it('DELETE /api/s/task (nonexistent task ID)', function (done) {
			(0, _utils.withLogin)(_chai2.default.request(_utils.app).delete('/api/s/task/123'), function (req) {
				req.end(function (err, res) {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error deleting task - could not find task with id \'123\'');
					done();
				});
			});
		});

		it('DELETE /api/s/task (valid task ID)', function (done) {
			createTestTask(function (test_task_id) {
				console.log(test_task_id);
				(0, _utils.withLogin)(_chai2.default.request(_utils.app).delete('/api/s/task/' + test_task_id), function (req) {
					req.end(function (err, res) {
						if (err) return done(err);
						res.should.have.status(200);
						res.body.should.have.property('message').eql('Successfully deleted task with id \'' + test_task_id + '\'');
						done();
					});
				});
			});
		});
	});

	after(function (done) {
		(0, _utils.teardownServer)('tasks', done);
	});
});