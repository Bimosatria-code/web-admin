'use strict'

const sql = require('mssql');
const dbConfig  = require('../utils/database');
const moment = require('moment');
const logger = require('../utils/logger');
const trails = require('../utils/trails');

// Global variable
var date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

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

exports.getIndex = async (req, res,next) => {
  try {
    const prev = await getPrevillage(req.session.user.role_id);

    if (prev.includes(21)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 13, 'Master Plan Product');

      await sql.connect(dbConfig.dbConnection())
      .then(role => {
        sql.query("SELECT TOP 1000 pp.id, pp.plan_code, pp.plan_desc, pp.created_at FROM webadmin.plan_product AS pp")
        .then(result => {
          res.render('master/plan_product/index', {
            isAuthenticated: req.session.isLoggedIn,
            sessionUser: req.session.user,
            plan:result.recordset,
            previllage: prev,
            path: 'campaign',
            subpath: 'plan_product'
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

exports.postPlanProduct = async (req, res,next) => {
	const plan_code = req.body.plan_code;
  const plan_desc = req.body.plan_desc;
  
  if (!plan_code || !plan_desc) {
		return res.json({
			'code': 500,
			'label': 'Error',
			'status': 'error',
			'message' : 'all input required' 
		})
	}
  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 4, 13, 'Create Master Plan Product');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      // check plan code existing or not
      sql.query("SELECT * FROM webadmin.plan_product AS pp WHERE pp.plan_code='"+plan_code+"'")
      .then(check => {
        if (check.recordset.length > 0) {
          return res.json({
            'code': 400,
            'label': 'Error',
            'status': 'error',
            'message' : 'Plan code ' +plan_code+ ' has been created'
          })
        }

        // insert new
        sql.query("INSERT INTO webadmin.plan_product (plan_code, plan_desc) values ('" + plan_code + "','" + plan_desc + "')")
        .then(roleCheck => {
          return res.json({
            'code': 200,
            'label': 'Success',
            'status': 'success',
            'message' : 'Plan Product has been created'
          })
        })
      })
      .catch(err => {
        logger.error(err);
      });
    });
  } catch (error) {
    logger.error(error);
  }
}
exports.getPlanProduct = async (req, res, next) => {
	const id = req.params.id;

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      sql.query("SELECT * FROM webadmin.plan_product AS pp WHERE pp.id='"+ id +"'")
      .then(result => {
        const id = result.recordset[0].id;
        const plan_code = result.recordset[0].plan_code;
        const plan_desc = result.recordset[0].plan_desc;

        res.render('master/plan_product/edit_plan_product', {
          id: id,
          plan_code: plan_code,
          plan_desc: plan_desc,
        });
      })
      .catch(err => {
        logger.error(err);
      });
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.updatePlanProduct = async (req, res, next) => {
  const id = req.body.id;
  const plan_code = req.body.plan_code;
  const plan_desc = req.body.plan_desc;
  console.log(req.body);
  
  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 13, 'Update Master Plan Product');

    await sql.connect(dbConfig.dbConnection())
    sql.query("SELECT * FROM webadmin.detail_campaign WHERE plan_desc='"+id+"'")
    .then(check => {
      if(check.recordset.length > 0){
        res.json({
          'code': 404,
          'status': 'error',
          'message' : 'Data still using in transaction campaign'
        })
      } else {
        sql.query("UPDATE webadmin.plan_product SET plan_code='"+ plan_code +"', plan_desc='"+ plan_desc +"' WHERE id='"+ id +"'")
        .then(result => {
          res.json({
            'code': 200,
            'status': 'success',
            'message' : 'Data has been updated'
          })
        })
        .catch(err => {
          logger.error(err);
        });
      }
    })
  } catch (error) {
    logger.error(error);
  }
}

exports.deletePlanProduct = async (req, res, next) => {
  const id = req.params.id;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 7, 13, 'Delete Master Plan Product');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      sql.query("SELECT * FROM webadmin.detail_campaign WHERE plan_desc='"+id+"'")
      .then(result => {
        if(result.recordset.length > 0){
          res.json({
            'code': 200,
            'status': 'error',
            'message' : 'Data still using in transaction campaign'
          })
        } else {
          sql.query("DELETE FROM webadmin.plan_product WHERE id='" + id + "'")
          .then(result => {
            res.json({
              'code': 200,
              'status': 'success',
              'message' : 'Delete Successfully'
            })
          })
          .catch(err => {
            logger.error(err);
          });
        }
      })
    });
  } catch (error) {
    logger.error(error);
  }
}