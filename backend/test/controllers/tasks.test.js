import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import Tasks from '../../models/tasks.model';
import {prepareServer, teardownServer, withLogin, app} from '../utils';

const { expect, assert } = chai;
const should = chai.should();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

async function deleteAllTasks(callback) {
	await Tasks.deleteMany({});
}

const testTask = {
	name: 'Task1',
	notes: 'Notes',
	completed: false,
	parent: null,
	children: []
}

async function createTestTask() {
	let task = await Tasks.create(testTask);
	return task.id
}

describe('Tasks', () => {

	before((done) => { prepareServer(done); });

	describe('task creation', () => {

		it('POST /api/s/task (no task given)', (done) => {
			withLogin(chai.request(app).post('/api/s/task'), req => {
				req.end((err, res) => {
					deleteAllTasks();
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
					deleteAllTasks();
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

		it('GET /api/s/task (valid task ID)', async (done) => {
			let test_task_id = await createTestTask();
			withLogin(chai.request(app).get('/api/s/task').send({ task_id: test_task_id }), req => {
				req.end((err, res) => {
					deleteAllTasks();
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

	describe('task updating', () => {

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

		it('PATCH /api/s/task (invalid parent task ID)', async (done) => {
			let test_task_id = await createTestTask();
			withLogin(chai.request(app).patch('/api/s/task').send({ task_id: test_task_id,
			parent: 'invalid_parent_id'}), req => {
				req.end((err, res) => {
					deleteAllTasks();
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql(`Could not find desired parent task with id 'invalid_parent_id'`);
					done();
				});
			});
		});

		it('PATCH /api/s/task (valid task ID)', (done) => {
			// Create a new task to be the parent of testTask
			let test_task_id = await createTestTask();
			let new_task = await Tasks.create({
				name: 'Task1',
				notes: 'Notes',
				completed: false,
				parent: null,
				children: []
			});
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
						deleteAllTasks();
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
					let parentTask = await Tasks.findById(new_task.id);
					expect (JSON.stringify(parentTask.children)).to.equal(JSON.stringify([test_task_id]));
					deleteAllTasks();
				});
			});
		});
	});

	describe('removing task children', () => {

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

		it('POST /api/s/removeChildren (valid child IDs)', async (done) => {
			let test_task_id_1 = await createTestTask();
			let test_task_id_2 = await createTestTask();
			console.log("Sending", [test_task_id_1, test_task_id_2])
			withLogin(chai.request(app).post('/api/s/removeChildren').send({ child_ids: [test_task_id_1, test_task_id_2] }), req => {
				req.end(async (err, res) => {
					if (err) return done(err);
					res.should.have.status(200);
					res.body.should.be.a('object');
					expect (res.body.errors).to.be.empty();
					// Check that testTask is no longer the parent of child1 and child2
					withLogin(chai.request(app).get('/api/s/task').send({ task_id: child1.task_id }), req => {
						req.end((err, res) => {
							if (err) return done(err);
							res.should.have.status(200);
							res.body.should.be.a('object');
							expect (res.body.parent).to.equal(null);
							// Check child2
							withLogin(chai.request(app).get('/api/s/task').send({ task_id: child2.task_id }), req => {
								req.end((err, res) => {
									if (err) return done(err);
									res.should.have.status(200);
									res.body.should.be.a('object');
									expect (res.body.parent).to.equal(null);
									done();
								});
							});
						});
					});
				});
			});
		});
	});

	describe('task deletion', () => {

		it('DELETE /api/s/task (no task ID)', (done) => {
			withLogin(chai.request(app).delete('/api/s/task'), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error deleting task - invalid task ID');
					done();
				});
			});
		});

		it('DELETE /api/s/task (null task ID)', (done) => {
			withLogin(chai.request(app).delete('/api/s/task').send({ task_id: null }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error deleting task - invalid task ID');
					done();
				});
			});
		});

		it('DELETE /api/s/task (empty task ID)', (done) => {
			withLogin(chai.request(app).delete('/api/s/task').send({ task_id: '' }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error deleting task - invalid task ID');
					done();
				});
			});
		});

		it('DELETE /api/s/task (nonexistent task ID)', (done) => {
			withLogin(chai.request(app).delete('/api/s/task').send({ task_id: '123' }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error deleting task - could not find task with id \'123\'');
					done();
				});
			});
		});

		it('DELETE /api/s/task (valid task ID)', async (done) => {
			let test_task_id = await createTestTask();
			withLogin(chai.request(app).delete('/api/s/task').send({ task_id: test_task_id }), req => {
				req.end(async (err, res) => {
					await deleteAllTasks();
					if (err) return done(err);
					res.should.have.status(200);
					res.body.should.have.property('message').eql(`Successfully deleted task with id '${test_task_id}'`);
					done();
				});
			});
		});
	});

	after((done) => { teardownServer('tasks', done); });

});
