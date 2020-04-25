import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import Tasks from '../../models/tasks.model';
import {prepareServer, teardownServer, withLogin, app} from '../utils';

const { expect, assert } = chai;
const should = chai.should();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

const testTask = {
	name: 'Task1',
	notes: 'Notes',
	completed: false,
	parent: null,
	children: []
}

async function createTestTask(callback) {
	Tasks.create(testTask, (err, createdTask) => {
		callback(createdTask.id);
	});
}

async function deleteAllTasks(callback) {
	Tasks.deleteMany({}, (err) => {
		callback();
	});
}

describe('Tasks', () => {

	before((done) => { prepareServer(done); });

	describe('task creation', () => {

		afterEach((done) => { deleteAllTasks(done); })

		it('POST /api/s/task (no task given)', (done) => {
			withLogin(chai.request(app).post('/api/s/task'), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(200);
					res.body.should.be.a('object');
					expect (res.body.name).to.equal('Untitled');
					expect (res.body.notes).to.equal(null);
					expect (res.body.completed).to.equal(false);
					expect (res.body.parent).to.equal(null);
					expect (JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));
					done();
				});
			});
		});

		it('POST /api/s/task (given task)', (done) => {
			withLogin(chai.request(app).post('/api/s/task').send(testTask), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(200);
					res.body.should.be.a('object');
					expect (res.body.name).to.equal('Task1');
					expect (res.body.notes).to.equal('Notes');
					expect (res.body.completed).to.equal(false);
					expect (res.body.parent).to.equal(null);
					expect (JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));
					done();
				});
			});
		});
	});

	describe('getting tasks', () => {

		afterEach((done) => { deleteAllTasks(done); })

		it('GET /api/s/task (no task ID)', (done) => {
			withLogin(chai.request(app).get('/api/s/task'), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').contains('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('GET /api/s/task (empty task ID)', (done) => {
			withLogin(chai.request(app).get('/api/s/task').send({ task_id: '' }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('GET /api/s/task (valid task ID)', (done) => {
			createTestTask((test_task_id) => {
				withLogin(chai.request(app).get('/api/s/task').send({ task_id: test_task_id }), req => {
					req.end((err, res) => {
						if (err) return done(err);
						res.should.have.status(200);
						res.body.should.be.a('object');
						expect (res.body.name).to.equal('Task1');
						expect (res.body.notes).to.equal('Notes');
						expect (res.body.completed).to.equal(false);
						expect (res.body.parent).to.equal(null);
						expect (JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));
						done();
					});
				});
			});
		});

	});

	describe('task updating', () => {

		afterEach((done) => { deleteAllTasks(done); })

		it('PATCH /api/s/task (no task ID #1)', (done) => {
			withLogin(chai.request(app).patch('/api/s/task'), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('PATCH /api/s/task (no task ID #2)', (done) => {
			withLogin(chai.request(app).patch('/api/s/task').send({ }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('PATCH /api/s/task (null task ID)', (done) => {
			withLogin(chai.request(app).patch('/api/s/task').send({ task_id: null }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('PATCH /api/s/task (empty task ID)', (done) => {
			withLogin(chai.request(app).patch('/api/s/task').send({ task_id: '' }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - invalid task ID');
					done();
				});
			});
		});

		it('PATCH /api/s/task (invalid parent task ID)', (done) => {
			createTestTask((test_task_id) => { 
				withLogin(chai.request(app).patch('/api/s/task').send({ task_id: test_task_id,
					parent: 'invalid_parent_id'}), req => {
						req.end((err, res) => {
							if (err) return done(err);
							res.should.have.status(400);
							res.body.should.have.property('message').eql(`Could not find desired parent task with id 'invalid_parent_id'`);
							done();
						});
					});
			});
		});

		it('PATCH /api/s/task (valid task ID)', (done) => {
			// Create a new task to be the parent of testTask
			createTestTask((test_task_id) => {
				Tasks.create({
					name: 'Task1',
					notes: 'Notes',
					completed: false,
					parent: null,
					children: []
				}, (err, new_task) => {

					let updates = {
						name: 'updated name', 
						notes: 'updated notes', 
						completed: true,
						parent: new_task.id,
						task_id: test_task_id
					}
					withLogin(chai.request(app).patch('/api/s/task').send(updates), req => {
						req.end((err, res) => {
							if (err) {
								return done(err);
							}
							res.should.have.status(200);
							res.body.should.be.a('object');
							expect (res.body.name).to.equal('updated name');
							expect (res.body.notes).to.equal('updated notes');
							expect (res.body.completed).to.equal(true);
							expect (res.body.parent).to.equal(updates.parent);
							expect (JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));
							// Check that parent task has testTask as a child
							Tasks.findById(new_task.id, (err, parentTask) => {
								expect (err).to.be.null;
								expect (JSON.stringify(parentTask.children)).to.equal(JSON.stringify([test_task_id]));
								done();
							})
						});
					});
				});
			});
		});
	});

	describe('removing task children', () => {

		afterEach((done) => { deleteAllTasks(done); })

		it('POST /api/s/removeChildren (no child IDs)', (done) => {
			withLogin(chai.request(app).post('/api/s/removeChildren'), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(500);
					res.body.should.have.property('message').eql('Error removing children - no children given');
					done();
				});
			});
		});

		it('POST /api/s/removeChildren (null child ID)', (done) => {
			withLogin(chai.request(app).post('/api/s/removeChildren').send({ child_ids: null }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(500);
					res.body.should.have.property('message').eql('Error removing children - no children given');
					done();
				});
			});
		});

		it('POST /api/s/removeChildren (valid child IDs)', (done) => {

			// Create the two tasks
			createTestTask((test_task_id_1) => {
				createTestTask((test_task_id_2) => {
					// Attach the child to the parent
					let updates = {
						parent: test_task_id_1,
						task_id: test_task_id_2
					}
					withLogin(chai.request(app).patch('/api/s/task').send(updates), req => {
						req.end((err, res) => {
							if (err) {
								return done(err);
							}
							// Assert that we are in a state where there is a parent and child
							Tasks.findById(test_task_id_1).exec()
								.then((task_1) => {
									expect (JSON.stringify(task_1.children)).to.equal(JSON.stringify([test_task_id_2]))
									return Tasks.findById(test_task_id_2).exec()
								})
								.then((task_2) => {
									expect (task_2.parent).to.equal(test_task_id_1)
									// Now do the actual child remove operation
									withLogin(chai.request(app).post('/api/s/removeChildren').send({ child_ids: [test_task_id_2] }), req => {
										req.end((err, res) => {
											if (err) return done(err);
											res.should.have.status(200);
											res.body.should.be.a('object');
											expect (res.body.errors).to.be.empty;
											// Check that test_task_id_1 is no longer the parent of test_task_id_1
											Tasks.findById(test_task_id_1).exec()
												.then((task1) => {
													expect (JSON.stringify(task1.children)).to.equal(JSON.stringify([]))
													return Tasks.findById(test_task_id_2).exec();
												})
												.then((task2) => {
													expect (task2.parent).to.be.null;
													done();
												})
												.catch((err) => done(err))
										});
									});
								})
								.catch((err) => done(err))
						});
					});
				});
			});
		});
	});

	describe('task deletion', () => {

		afterEach((done) => { deleteAllTasks(done); })

		it('DELETE /api/s/task (nonexistent task ID)', (done) => {
			withLogin(chai.request(app).delete('/api/s/task/123'), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error deleting task - could not find task with id \'123\'');
					done();
				});
			});
		});

		it('DELETE /api/s/task (valid task ID)', (done) => {
			createTestTask((test_task_id) => {
				console.log(test_task_id);
				withLogin(chai.request(app).delete('/api/s/task/' + test_task_id), req => {
					req.end((err, res) => {
						if (err) return done(err);
						res.should.have.status(200);
						res.body.should.have.property('message').eql(`Successfully deleted task with id '${test_task_id}'`);
						done();
					});
				});
			});
		});
	});

	after((done) => { teardownServer('tasks', done); });

});
