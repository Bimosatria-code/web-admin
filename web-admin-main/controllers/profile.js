'use strict'

const sql = require('mssql');
const dbConfig  = require('../utils/database');
const bcrypt = require('bcrypt');
const saltRounds = 12;

const logger = require('../utils/logger');
const trails = require('../utils/trails');

async function getPrevillage(role_id){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT p.previllage FROM webadmin.previllages AS p WHERE p.role_id='"+role_id+"'" ,function(err, results){
			const prev = [];
			for (let i = 0; i < results.recordset.length; i++) {
			  prev.push(results.recordset[i].previllage);
			}
			resolve(prev)
		  });
		})
		.catch(err => {
		  logger.error(err);
		})
	  });
	} catch (error) {
	  logger.error(error);
	}
}

exports.getIndex = async (req, res, next) => {
  try {
		const prev = await getPrevillage(req.session.user.role_id);

		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 4, 'Profile');

    await sql.connect(dbConfig.dbConnection())
		.then(profile => {
			sql.query("SELECT * FROM webadmin.users AS u WHERE u.id='"+ req.params.id +"'")
			.then(result => {
				res.render('profile/reset', {
					isAuthenticated: req.session.isLoggedIn,
					sessionUser: req.session.user,
					user: result.recordset[0],
					previllage: prev,
					path: '/',
					subpath: 'profile',
				});
			})
			.catch(err => {
				logger.error(err);  
			})
		})
    .catch(err => {
			logger.error(err);  
		})
  } catch (error) {
    logger.error(error);  
  }
};

exports.postProfile = async (req, res, next) => {
  const ids = req.body.id;
  const username = req.body.username;
  const password = req.body.password;

  const hashPassword = bcrypt.hashSync(password, saltRounds);

	try {
		// send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 4, 'Update Profile');

		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query("UPDATE webadmin.users SET username='"+ username +"', password='"+ hashPassword +"' WHERE id='"+ ids +"'")
			.then(result => {
				// res.redirect('/profile/'+ ids)
				// back to login
				req.session.destroy(() => {
					res.redirect('/');
				});
			})
			.catch(err => {
				logger.error(err);
			});
		});
	} catch (error) {
		logger.error(error);
	}
};