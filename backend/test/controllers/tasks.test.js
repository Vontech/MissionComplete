import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import {prepareServer, teardownServer, testTask, withLogin, app} from '../utils';

const { expect, assert } = chai;
const should = chai.should();

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Tasks', () => {

	before((done) => { prepareServer(done); });

	describe('task creation', () => {

		it('POST /api/s/createTask (no task provided)', (done) => {
			withLogin(chai.request(app).post('/api/s/createTask'), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(200);
					res.body.should.be.a('object');
					expect (res.body.name === 'New task with the name Untitled has been created');
					done();
				});s
			});
		});

		it('POST /api/s/createTask (given task)', (done) => {
			withLogin(chai.request(app).post('/api/s/createTask').send(testTask), req => {
				req.end((err, res) => {
					if (err) return done(err);
					res.should.have.status(200);
					res.body.should.be.a('object');
					expect (res.body.name === 'New task with the name Task1 has been created');
					done();
				});
			});
		});
	});

	after((done) => { teardownServer('tasks', done); });

});