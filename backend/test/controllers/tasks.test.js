import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import {prepareServer, teardownServer, testTask, testTask2, updates, withLogin, app} from '../utils';

const { expect, assert } = chai;
const should = chai.should();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Tasks', () => {

	let test_task_id;
	before((done) => { prepareServer(done); });

	describe('task creation', () => {

		it('POST /api/s/createTask (no task given)', (done) => {
			withLogin(chai.request(app).post('/api/s/createTask'), req => {
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

		it('POST /api/s/createTask (given task)', (done) => {
			withLogin(chai.request(app).post('/api/s/createTask').send(testTask), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(200);
					res.body.should.be.a('object');
					expect (res.body.name).to.equal('Task1');
					expect (res.body.notes).to.equal('Notes');
					expect (res.body.completed).to.equal(false);
					expect (res.body.parent).to.equal(null);
					expect (JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));
					test_task_id = res.body._id; // For the updateTask and removeTask tests
					done();
				});
			});
		});
	});

	describe('getting tasks', () => {

		it('GET /api/s/getTask (no task ID)', (done) => {
			withLogin(chai.request(app).get('/api/s/getTask'), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - given undefined task ID');
					done();
				});
			});
		});

		it('GET /api/s/getTask (empty task ID)', (done) => {
			withLogin(chai.request(app).get('/api/s/getTask').send({ task_id: '' }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - given empty task ID');
					done();
				});
			});
		});

		it('GET /api/s/getTask (valid task ID)', (done) => {
			withLogin(chai.request(app).get('/api/s/getTask').send({ task_id: test_task_id }), req => {
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

	describe('task updating', () => {

		it('PUT /api/s/updateTask (no task ID)', (done) => {
			withLogin(chai.request(app).put('/api/s/updateTask'), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - given undefined task ID');
					done();
				});
			});
		});

		it('PUT /api/s/updateTask (no task ID)', (done) => {
			withLogin(chai.request(app).put('/api/s/updateTask').send({ }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - given undefined task ID');
					done();
				});
			});
		});

		it('PUT /api/s/updateTask (null task ID)', (done) => {
			withLogin(chai.request(app).put('/api/s/updateTask').send({ task_id: null }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - given null task ID');
					done();
				});
			});
		});

		it('PUT /api/s/updateTask (empty task ID)', (done) => {
			withLogin(chai.request(app).put('/api/s/updateTask').send({ task_id: '' }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error getting task - given empty task ID');
					done();
				});
			});
		});

		it('PUT /api/s/updateTask (invalid task ID)', (done) => {
			withLogin(chai.request(app).put('/api/s/updateTask').send({ task_id: test_task_id,
			parent: 'invalid_parent_id'}), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql(`Error updating task - could not find parent task with id 'invalid_parent_id'`);
					done();
				});
			});
		});

		it('PUT /api/s/updateTask (valid task ID)', (done) => {
			// Create a new task (testTask2) to be the parent of testTask
			withLogin(chai.request(app).post('/api/s/createTask').send(testTask2), req => {
				req.end((err, res) => {
					if (err) return done(err);
					updates.parent = res.body._id;
					updates.task_id = test_task_id;
					withLogin(chai.request(app).put('/api/s/updateTask').send(updates), req => {
						req.end((err, res) => {
							if (err) return done(err);
							res.should.have.status(200);
							res.body.should.be.a('object');
							expect (res.body.name).to.equal('updated name');
							expect (res.body.notes).to.equal('updated notes');
							expect (res.body.completed).to.equal(true);
							expect (res.body.parent).to.equal(updates.parent);
							expect (JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));
							done();
						});
						// Add GET and check for updated children list for parent
						withLogin(chai.request(app).get('/api/s/getTask').send({ task_id: updates.parent }), req => {
							req.end((err, res) => {
								if (err) return done(err);
								res.should.have.status(200);
								res.body.should.be.a('object');
								expect (JSON.stringify(res.body.children)).to.equal(JSON.stringify([]));
								done();
							});
						});
					});
				});
			});
		});



	});

	describe('task deletion', () => {

		it('DELETE /api/s/removeTask (no task ID)', (done) => {
			withLogin(chai.request(app).delete('/api/s/removeTask'), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error deleting task - given undefined task ID');
					done();
				});
			});
		});

		it('DELETE /api/s/removeTask (null task ID)', (done) => {
			withLogin(chai.request(app).delete('/api/s/removeTask').send({ task_id: null }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error deleting task - given null task ID');
					done();
				});
			});
		});

		it('DELETE /api/s/removeTask (empty task ID)', (done) => {
			withLogin(chai.request(app).delete('/api/s/removeTask').send({ task_id: '' }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error deleting task - given empty task ID');
					done();
				});
			});
		});

		it('DELETE /api/s/removeTask (nonexistent task ID)', (done) => {
			withLogin(chai.request(app).delete('/api/s/removeTask').send({ task_id: '123' }), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(400);
					res.body.should.have.property('message').eql('Error deleting task - could not find task with id \'123\'');
					done();
				});
			});
		});

		it('DELETE /api/s/removeTask (valid task ID)', (done) => {
			withLogin(chai.request(app).delete('/api/s/removeTask').send({ task_id: test_task_id }), req => {
				req.end((err, res) => {
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
