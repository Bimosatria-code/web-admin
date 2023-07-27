'use strict'

const sql = require('mssql');
const bcrypt = require('bcrypt');
const store = require('store');
const logger = require('../utils/logger');
const trails = require('../utils/trails');

const dbConfig  = require('../utils/database');
const saltRounds = 12;

async function myQuery(){
  try {
    return new Promise((resolve,reject)=>{
      sql.connect(dbConfig.dbConnection())
      .then(query => {
        sql.query('SELECT p.block FROM webadmin.parameters AS p',function(err, results){
          resolve(results.recordset[0].block)
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

exports.getIndex = (req, res) => {
  try {
    store.set('block', 0);

    res.render('login', {
      // captcha: test,
      isAuthenticated: false,
      csrfToken: req.csrfToken()
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.postLogin = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const captcha = req.body.captcha;
  const cap = req.body.cap;

  let parameters = await myQuery();

  if (captcha !== cap) {
    return res.json({
      'code': 404,
      'status': 'error',
      'message' : 'Wrong Captcha!'
    })
  }

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(userDoc => {
      //query user with username
      return sql.query("SELECT u.id, u.username, u.password, u.uuid, u.is_block, u.is_new, u.role_id, p.previllage  "+
      "FROM webadmin.users AS u LEFT JOIN webadmin.previllages AS p ON u.role_id = p.role_id WHERE u.username = '" + username + "' AND u.active=1");
    })
    .then(results => {
      const prevs = [];
      for (let i = 0; i < results.recordset.length; i++) {
        prevs.push(results.recordset[i].previllage)
      }

      // if result greater than 0 = true
      if (results.recordset.length > 0) {
        let hash = results.recordset[0].password;
        let is_new = results.recordset[0].is_new;
        let uuid = results.recordset[0].uuid;
        let id = results.recordset[0].id;
        let is_block = results.recordset[0].is_block;
        let role_id = results.recordset[0].role_id;

        // check is user block or not
        if (is_block) {
          return res.json({
            'code': 404,
            'status': 'Block',
            'message' : 'You have tried '+parameters+' time wrong login credential. Your account has been blocked. Please contact admin to open the block..!'
          })
        }

        // send to audit trails
        trails.trails(id, role_id, req.socket.localAddress, 1, 1, 'login');

        // check password
        bcrypt.compare(password, hash, function(err, result) {
          if (result) {
            req.session.isLoggedIn = true;
            req.session.user = results.recordset[0];
            req.session.previllage = prevs;

            // validate if user is new and password not changed yet
            if (is_new) {
              return res.json({
                'code': 200,
                'page': '/reset/?valid=' + uuid,
              })
            }
            
            return res.json({
              'code': 200,
              'page': '/home',
            })
          }

          var st = store.get('block');
          store.set('block', st + 1);

          if (st === parameters) {
            sql.query("UPDATE webadmin.users SET is_block='"+ 1 +"' WHERE id='"+ id +"'")
            
            return res.json({
              'code': 404,
              'status': 'Block',
              'message' : 'You have tried 5 time wrong login credential. Your account has been blocked. Please contact admin to open the block..!'
            })
          }

          return res.json({
            'code': 404,
            'status': 'error',
            'message' : 'Username and Password Wrong!'
          })
        })
      } else {
        return res.json({
          'code': 404,
          'status': 'error',
          'message' : 'Username not found, please contact Admin'
        })
      }
    })
    .catch(err => {
      logger.error(err);
    });
  } catch (error) {
    logger.error(error); 
  }
};

exports.getReset = (req, res, next) => {
  const uuid = req.query.valid;
  
  try {
    return res.render('reset', {
      uuid: uuid
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.postReset = async (req, res, next) => {
  const password = req.body.password;
  const uuid = req.body.uuid;

  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(check => {
      return sql.query("SELECT * FROM webadmin.Users AS u WHERE u.uuid = '" + uuid + "'");
    })
    .then(user => {
      let id = user.recordset[0].id;
      return sql.query("UPDATE webadmin.Users SET password = '" + hash + "', is_new = " + 0 + " WHERE id = " + id);
    })
    .then(result => {
      res.redirect('/');
    })
    .catch(err => {
      logger.error(err);
    })
  } catch (error) {
    logger.error(error);
  }
}

exports.postLogout = (req, res, next) => {
  try {
    const id = req.session.user.id;
    const role_id = req.session.user.role_id;
    
    // send to audit trails
    trails.trails(id, role_id, req.socket.localAddress, 2, 2, 'logout');

    req.session.destroy(() => {
      res.redirect('/');
    });
  } catch (error) {
    logger.error(error);
  }
}
