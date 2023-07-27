'use strict'

const sql = require('mssql');
const bcrypt = require('bcrypt');
const dbConfig  = require('../utils/database');
const saltRounds = 12;
const password = "Admin22"; //default
const isNew = 1;

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

async function check(id, table, field){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT * FROM "+ table +" WHERE "+ field +" = '"+ id +"'" ,function(err, results){
        if (results) {
          if (results.recordset.length > 0) {
            resolve(true);  
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
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

    if (prev.includes(5)) {
      // send to audit trails
      trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 4, 5, 'User');


      await sql.connect(dbConfig.dbConnection())
      .then(user => {
        sql.query(`SELECT u.id, u.uuid, u.name, u.username, u.active, u.is_block, r.name as role
                    FROM webadmin.users AS u
                    INNER JOIN webadmin.roles AS r ON u.role_id = r.id`)
        .then(result => {
          sql.query("SELECT r.id, r.name FROM webadmin.roles AS r")
          .then(r => {
            res.render('master/user/user', {
              isAuthenticated: req.session.isLoggedIn,
              sessionUser: req.session.user,
              user: result.recordset,
              role: r.recordset,
              previllage: prev,
              path: 'management',
              subpath: 'user',
            });
          })
        })
        .catch(err => {
          logger.warn(err);
        })
      })
      .catch(err => {
        logger.warn(err);
      });
    } else {
      return res.redirect('/404');
    }
  } catch (error) {
    logger.error(error);
  }
};

exports.postUser = async (req, res, next) => {
  const name = req.body.name;
  const username = req.body.username;
  const role = req.body.role;
  const active = 1;

  // send to audit trails
  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 5, 'User');

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(user => {
      return sql.query("SELECT * FROM webadmin.Users AS u WHERE u.username = '" + username + "'");
    })
    .then(userCheck => {
      if(userCheck.recordset.length > 0) {
        return res.json({
          'code': 404,
          'label': 'Opps..',
          'status': 'error',
          'message' : 'Username has been exist'
        })
      }
      return bcrypt.hash(password, saltRounds)
    })
    .then(hashPassword => {
      return sql
      .query("INSERT INTO webadmin.Users (username, name, password, is_new, active, role_id) values ('" 
      + username + "','" 
      + name + "','" 
      + hashPassword + "','" 
      + isNew + "','"
      + active + "','" 
      + role + "')");
    })
    .then(result => {
      return res.json({
        'code': 200,
        'label': 'Success',
        'status': 'success',
        'message' : 'Username has been created'
      })
    })
    .catch(err => {
      logger.warn(err);
    })
  } catch (error) {
    logger.error(error);
  }
};

exports.getUser = async (req, res, next) => {
  const id = req.params.id;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 5, 'Update User');

    await sql.connect(dbConfig.dbConnection())
    .then(role => {
      sql.query("SELECT u.id, u.name, u.username, u.role_id  FROM webadmin.users AS u WHERE u.id='"+ id +"'")
      .then(result => {
        const id = result.recordset[0].id;
        const name = result.recordset[0].name;
        const username = result.recordset[0].username;
        const role_id = result.recordset[0].role_id;

        sql.query("SELECT r.id, r.name FROM webadmin.roles AS r")
        .then(list => {
          res.render('master/user/edit', {
            id: id,
            name: name,
            username: username,
            role_id: role_id,
            role: list.recordset
          });
        })
        .catch(err => {
          logger.warn(err);
        })
      })
      .catch(err => {
        logger.warn(err);
      });
    })
    .catch(err => {
      logger.warn(err);
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.updateUser = async (req, res, next) => {
  const id = req.body.id;
  const name = req.body.name;
  const username = req.body.username;
  const role = req.body.role;
  
  try {
    await sql.connect(dbConfig.dbConnection())
    .then(user => {
      // insert into table role
      return sql.query("UPDATE webadmin.users SET name='"+ name +"', username='"+ username +"', role_id='"+ role +"' WHERE id='"+ id +"'");
    })
    .then(result => {
        res.redirect('/user');
    })
    .catch(err => {
      logger.warn(err);
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.resetUser = async (req, res, next) => {
  const id = req.params.id;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 3, 5, 'Reset User');

    await sql.connect(dbConfig.dbConnection)
    .then(reset => {
      const hashPassword = bcrypt.hashSync(password, saltRounds);
      return sql.query("UPDATE webadmin.users SET password='"+ hashPassword +"', is_new = 1 WHERE id='"+ id +"'");
    })
    .then(result => {
      res.json({
        'code': 200,
        'status': 'success',
        'message' : 'Reset Successfully'
      })
    })
    .catch(err => {
      logger.warn(err);
    })
  } catch (error) {
    logger.error(error);
  }
}

exports.updateStatusUser = async (req, res, next) => {
  const id = req.body.id;
  const status = req.body.active

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 5, 'Update Status User');

    await sql.connect(dbConfig.dbConnection)
    .then(query => {
      return sql.query("UPDATE webadmin.users SET active='"+ status +"' WHERE id='"+ id +"'");
    })
    .then(result => {
      res.json({
        'code': 200,
        'status': 'success',
        'message' : 'Update Status Successfully'
      })
    })
    .catch(err => {
      logger.warn(err);
    })
  } catch (error) {
    logger.error(error);
  }
}

exports.updateLock = async (req, res, next) => {
  const id = req.body.id;
  const is_block = req.body.is_block;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 5, 'Update Lock User');

    await sql.connect(dbConfig.dbConnection)
    .then(query => {
      return sql.query("UPDATE webadmin.users SET is_block='"+ is_block +"' WHERE id='"+ id +"'");
    })
    .then(result => {
      res.json({
        'code': 200,
        'status': 'success',
        'message' : 'Update Lock Successfully'
      })
    })
    .catch(err => {
      logger.warn(err);
    })
  } catch (error) {
    logger.error(error);
  }
}

exports.deleteUser = async (req, res, next) => {
  const id = req.params.id;
  const purchase = await check(id, 'webadmin.purchase_bill', 'user_id');
  const transfer = await check(id, 'webadmin.transfer_dana', 'user_id');
  const inquiry = await check(id, 'webadmin.inquiry', 'user_id');

	if (purchase || transfer || inquiry) {
		return res.json({
			'code': 500,
			'status': 'error',
			'message' : 'User has been used in setting fee'
		});
	}

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 7, 5, 'Delete User');

    // get data by uuid
    await sql.connect(dbConfig.dbConnection())
    .then(user => {
      sql.query("DELETE FROM webadmin.users WHERE id='" + id + "'")
      .then(result => {
        res.json({
          'code': 200,
          'status': 'success',
          'message' : 'Delete Successfully'
        })
        // res.redirect('/user');
      })
      .catch(err => {
        logger.warn(err);
      });
    })
    .catch(err => {
      logger.warn(err);
    });
  } catch (error) {
    logger.error(error);
  }
}