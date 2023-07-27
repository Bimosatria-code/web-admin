'use strict'

const sql = require('mssql');
const dbConfig  = require('../utils/database');
const logger = require('../utils/logger');
const trails = require('../utils/trails');

async function getPrevillage(role_id){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT previllage FROM webadmin.previllages WHERE role_id='"+role_id+"'" ,function(err, results){
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

exports.getIndex = async (req, res) => {
  try {
    const prev = await getPrevillage(req.session.user.role_id);
		const id = req.session.user.id;
		const role_id = req.session.user.role_id;

		// send to audit trails
		trails.trails(id, role_id, req.socket.localAddress, 11, 21, 'Home');

    res.render('dashboard', {
      isAuthenticated: req.session.isLoggedIn,
      sessionUser: req.session.user,
      previllageUser: req.session.previllage,
      previllage: prev,
      path: '/',
      subpath: 'dashboard'
    });
  } catch (error) {
    logger.error(error);
  }
};