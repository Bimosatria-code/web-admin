'use strict'

const sql = require('mssql');
const dbConfig  = require('../utils/database');
const logger = require('../utils/logger');
const moment = require('moment');

exports.trails = async (user_id=null, role_id=null, ip=null, action=null, module=null, object=null) => {
  try {
    const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      sql.query("INSERT INTO webadmin.audit_trails (modules, actions, user_id, role_id, ip_address, object, created_at) "+
        "VALUES ('"+module+"','"+action+"','"+user_id+"','"+role_id+"','"+ip+"','"+object+"','"+date+"')")
      .then(result => {
        logger.info(result);
      })
      .catch(err => {
        logger.warn(err);
      })
    })
  } catch (error) {
    logger.error(error);
  }
}