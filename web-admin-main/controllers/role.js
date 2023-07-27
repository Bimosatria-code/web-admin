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

    if (prev.includes(1)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 6, 'Role');


      await sql.connect(dbConfig.dbConnection())
      .then(role => {
        sql.query("SELECT TOP 1000 r.id, r.uuid, r.name, r.description, r.created_at, r.updated_at FROM webadmin.roles AS r")
        .then(result => {
          res.render('master/role/role', {
            isAuthenticated: req.session.isLoggedIn,
            role: result.recordset,
            sessionUser: req.session.user,
            previllage: prev,
            path: 'management',
            subpath: 'role',
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

exports.postRole = async (req, res, next) => {
  const name = req.body.name;
  const description = req.body.description;
  const access = req.body['module[]'];

  if (access === undefined) {
    return res.json({
      'code': 500,
      'label': 'Error',
      'status': 'error',
      'message' : 'Please check one of Role access'
    })
  }
  
  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 4, 6, 'Create Role');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      // check role is exists
      sql.query("SELECT * FROM webadmin.roles AS r WHERE r.name='"+name+"'")
      .then(role => {
        if(role.recordset.length > 0) {
          return res.json({
            'code': 500,
            'label': 'Error',
            'status': 'error',
            'message' : 'Role has been exists'
          })
        }

        sql.query("INSERT INTO webadmin.roles (name, description) values ('" + name + "','" + description + "'); SELECT SCOPE_IDENTITY() AS id")
        .then(roleCheck => {
          let role_id = roleCheck.recordset[0].id;
          // insert into table previllage
          for (let i = 0; i < access.length; i++) {
            const element = access[i];
            sql.query("INSERT INTO webadmin.previllages (role_id, previllage) values ('" + role_id + "','" + element + "')");
          }

          return res.json({
            'code': 200,
            'label': 'Success',
            'status': 'success',
            'message' : 'Role has been created'
          })
        })
        .catch(err => {
          logger.error(err);
        })
      })
      .catch(err => {
        logger.error(err);
      });
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.getRole = async (req, res, next) => {
  const id = req.params.id;

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      sql.query("SELECT r.id, r.uuid, r.name, r.description, p.previllage FROM webadmin.roles AS r INNER JOIN webadmin.previllages AS p ON r.id = p.role_id WHERE r.id='"
      + id +"'")
      .then(result => {
        const id = result.recordset[0].id;
        const name = result.recordset[0].name;
        const description = result.recordset[0].description;
        const previllage = []
        for (let i = 0; i < result.recordset.length; i++) {
          previllage.push(result.recordset[i].previllage);
        }
        
        res.render('master/role/edit', {
          id: id,
          name: name,
          description: description,
          previllage: previllage,
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

exports.updateRole = async (req, res, next) => {
  const id = req.body.id;
  const name = req.body.name;
  const description = req.body.description;
  const access = req.body.module;
  
  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 6, 'Update Role');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      sql.query("UPDATE webadmin.roles SET name='"+ name +"', description='"+ description +"' WHERE id='"+ id +"'")
      .then(role => {
        sql.query("DELETE FROM webadmin.previllages WHERE role_id='" + id + "'")
        .then(result => {
          for (let i = 0; i < access.length; i++) {
            const element = access[i];
            sql.query("INSERT INTO webadmin.previllages (role_id, previllage) values ('" + id + "','" + element + "')");
          }
    
          res.redirect('/role');
        })
        .catch(err => {
          logger.error(err);
        });
      });
    });
  } catch (error) {
    logger.error(error)
  }
};

exports.deleteRole = async (req, res, next) => {
  const id = req.params.id;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 7, 6, 'Delete Role');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      // check role
      sql.query("SELECT * FROM webadmin.roles AS r JOIN webadmin.users AS u ON u.role_id = r.id WHERE r.id='"+id+"'")
      .then(role => {
        if (role.recordset.length > 0) {
          return res.json({
            'code': 500,
            'label': 'Error',
            'status': 'error',
            'message' : 'Role still have relationship with user, please delete the user with this role first'
          })
        }

        // get data by id
        sql.query("DELETE FROM webadmin.roles WHERE id='" + id + "'")
        .then(result => {
          sql.query("DELETE FROM webadmin.previllages WHERE role_id='"+ id +"'")
          .then(result => {
            res.json({
              'code': 200,
              'status': 'success',
              'message' : 'Delete Successfully'
            })
          })
        })
        .catch(err => {
          logger.error(err);
        });
      });
    })
    .catch(err => {
      logger.error(err);
    })
  } catch (error) {
    logger.error(error);
  }
}