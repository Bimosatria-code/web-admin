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

    if (prev.includes(39)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 20, 'Setting Parameter');

      await sql.connect(dbConfig.dbConnection())
      .then(user => {
        sql.query(`SELECT p.id, p.block FROM webadmin.parameters AS p`)
        .then(result => {
          res.render('setting', {
            isAuthenticated: req.session.isLoggedIn,
            parameters: result.recordset[0],
            sessionUser: req.session.user,
            previllage: prev,
            path: '/',
            subpath: 'parameter',
          });
        })
      })
      .catch(err => {
        logger.error(err);
      });
    } else {
      return res.redirect('/404');
    }
  } catch (error) {
    logger.error(error);
  }
};

exports.postParameter = async (req, res, next) => {
  const id = 1;
  const block = req.body.block;

  if (block <= 0) {
    return res.json({
      'code': 500,
      'label': 'Error',
      'status': 'error',
      'message' : 'Number can not negative or zero'
    })
  }
  
  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 20, 'Update Setting Parameter');

    await sql.connect(dbConfig.dbConnection())
    .then(user => {
      // insert into table role
      return sql.query("UPDATE webadmin.parameters SET block='"+ block +"' WHERE id='"+ id +"'");
    })
    .then(result => {
      return res.json({
        'code': 200,
        'label': 'Success',
        'status': 'success',
        'message' : 'Parameters has been setting'
      })
    })
    .catch(err => {
      logger.error(err);
    });
  } catch (error) {
    logger.error(error);
  }
}