'use strict'

const sql = require('mssql');
const dbConfig  = require('../utils/database');
const moment = require('moment');
const logger = require('../utils/logger');
const trails = require('../utils/trails');

async function getPrevillage(role_id){
  try {
    return new Promise((resolve,reject)=>{
      sql.connect(dbConfig.dbConnection())
      .then(query => {
        sql.query("SELECT previllage FROM webadmin.previllages AS p WHERE p.role_id='"+role_id+"'" ,function(err, results){
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

// Module Purchase Bill
exports.getIndex = async (req, res, next) => {
  const prev = await getPrevillage(req.session.user.role_id);

  try {  
    if (prev.includes(13)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 10, 'Setting Fee Purchase and Bill');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query(`SELECT TOP 1000 p.id,p.request_activation,p.transactions, p.pcode, p.biller_code, p.product_type, p.product_code,
        p.rek_number,p.user_id,p.approval_id,p.approval_date,p.status,p.created_at,p.updated_at, c.name AS user_created, 
        a.name AS user_approver, m.transactions AS transaksi
        FROM webadmin.purchase_bill AS p
        LEFT JOIN webadmin.users AS c ON c.id = p.user_id
        LEFT JOIN webadmin.users AS a ON a.id = p.approval_id
        LEFT JOIN webadmin.m_fee AS m ON m.id = p.transactions`);
      })
      .then(result => {
        res.render('fee/purchase_bill/index', {
          isAuthenticated: req.session.isLoggedIn,
          sessionUser: req.session.user,
          purchaseBill: result.recordset,
          previllage: prev,
          moment: moment,
          path: 'setting',
          subpath: 'fee',
        });
      })
      .catch(err => {
        logger.error(err); 
      })
    } else {
      return res.redirect('/404');
    }
  } catch (error) {
    logger.error(error); 
  }
  
};

exports.getPurchaseBill = async (req, res, next) => {
  const prev = await getPrevillage(req.session.user.role_id);

  try {
    if (prev.includes(15)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 4, 10, 'Create Fee Purchase and Bill');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query("SELECT mf.id, mf.transactions FROM webadmin.m_fee AS mf WHERE mf.type=1")
      })
      .then(result => {
        res.render('fee/purchase_bill/create_purchase_bill', {
          isAuthenticated: req.session.isLoggedIn,
          sessionUser: req.session.user,
          transaction: result.recordset,
          previllage: prev,
          path: 'setting',
          subpath: 'fee'
        });
      })
      .catch(err => {
        logger.warn(err);
      })
    } else {
      return res.redirect('/404');
    }
  } catch (error) {
    logger.error(error); 
  }
};

exports.postPurchaseBill = async (req, res, next) => {
  const status = 1;
  // const request_activation = req.body.request_activation;
  // const code = req.body.pcode + '-' + req.body.biller_code + '-' + req.body.product_type + '-' + req.body.product_code;
  const pcode = req.body.pcode;
  const biller_code = req.body.biller_code;
  const product_type = req.body.product_type;
  const product_code = req.body.product_code;
  const transactions = req.body.transaction;
  const rek_number = req.body.rek_number;
  const rek_name = req.body.rek_name;
  const format = req.body.format;

  const trans_debet_ori = req.body.trans_debet_ori;
  const trans_credit_rev = req.body.trans_credit_rev;
  const trans_credit_ori = req.body.trans_credit_ori;
  const trans_debet_rev = req.body.trans_debet_rev;

  const fee_debet_ori = req.body.fee_debet_ori;
  const fee_debet_rev = req.body.fee_debet_rev;
  const fee_debet_ib = req.body.fee_debet_ib;
  const fee_debet_mb = req.body.fee_debet_mb;
  const fee_debet_ibb = req.body.fee_debet_ibb;
  const fee_debet_rek = req.body.fee_debet_rek;

  const fee_credit_1_ori = req.body.fee_credit_1_ori;
  const fee_credit_1_rev = req.body.fee_credit_1_rev;
  const fee_credit_1_ib = req.body.fee_credit_1_ib;
  const fee_credit_1_mb = req.body.fee_credit_1_mb;
  const fee_credit_1_ibb = req.body.fee_credit_1_ibb;
  const fee_credit_1_rek = req.body.fee_credit_1_rek;

  const fee_credit_2_ori = req.body.fee_credit_2_ori;
  const fee_credit_2_rev = req.body.fee_credit_2_rev;
  const fee_credit_2_ib = req.body.fee_credit_2_ib;
  const fee_credit_2_mb = req.body.fee_credit_2_mb;
  const fee_credit_2_ibb = req.body.fee_credit_2_ibb;
  const fee_credit_2_rek = req.body.fee_credit_2_rek;

  const fee_credit_3_ori = req.body.fee_credit_3_ori;
  const fee_credit_3_rev = req.body.fee_credit_3_rev;
  const fee_credit_3_ib = req.body.fee_credit_3_ib;
  const fee_credit_3_mb = req.body.fee_credit_3_mb;
  const fee_credit_3_ibb = req.body.fee_credit_3_ibb;
  const fee_credit_3_rek = req.body.fee_credit_3_rek;

  const fee_credit_4_ori = req.body.fee_credit_4_ori;
  const fee_credit_4_rev = req.body.fee_credit_4_rev;
  const fee_credit_4_ib = req.body.fee_credit_4_ib;
  const fee_credit_4_mb = req.body.fee_credit_4_mb;
  const fee_credit_4_ibb = req.body.fee_credit_4_ibb;
  const fee_credit_4_rek = req.body.fee_credit_4_rek;

  const fee_credit_5_ori = req.body.fee_credit_5_ori;
  const fee_credit_5_rev = req.body.fee_credit_5_rev;
  const fee_credit_5_ib = req.body.fee_credit_5_ib;
  const fee_credit_5_mb = req.body.fee_credit_5_mb;
  const fee_credit_5_ibb = req.body.fee_credit_5_ibb;
  const fee_credit_5_rek = req.body.fee_credit_5_rek;

  const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');


  // Check value Fee Debet same like Fee Credit 
  // Fee Debet === Fee Credit 1 to 5
  const count_ib = Number(fee_credit_1_ib.replace(/\,/g,'')) + Number(fee_credit_2_ib.replace(/\,/g,'')) + Number(fee_credit_3_ib.replace(/\,/g,'')) + Number(fee_credit_4_ib.replace(/\,/g,'')) + Number(fee_credit_5_ib.replace(/\,/g,''));
  const count_mb = Number(fee_credit_1_mb.replace(/\,/g,'')) + Number(fee_credit_2_mb.replace(/\,/g,'')) + Number(fee_credit_3_mb.replace(/\,/g,'')) + Number(fee_credit_4_mb.replace(/\,/g,'')) + Number(fee_credit_5_mb.replace(/\,/g,''));
  const count_ibb = Number(fee_credit_1_ibb.replace(/\,/g,'')) + Number(fee_credit_2_ibb.replace(/\,/g,'')) + Number(fee_credit_3_ibb.replace(/\,/g,'')) + Number(fee_credit_4_ibb.replace(/\,/g,'')) + Number(fee_credit_5_ibb.replace(/\,/g,''));


  if (Number(fee_debet_ib.replace(/\,/g,'')) !== count_ib) {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Value Fee Credit IB must same like Fee Debet IB, Please check your input Fee Credet IB'
    })
  }

  if (Number(fee_debet_mb.replace(/\,/g,'')) !== count_mb) {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Value Fee Credit MB must same like Fee Debet MB, Please check your input Fee Credet MB'
    })
  }

  if (Number(fee_debet_ibb.replace(/\,/g,'')) !== count_ibb) {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Value Fee Credit IBB must same like Fee Debet IBB, Please check your input Fee Credet IBB'
    })
  }

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      return sql
      .query("INSERT INTO webadmin.purchase_bill" +
        "(pcode, biller_code, product_type, product_code, transactions, rek_number, rek_name, format, trans_debet_ori, trans_credit_rev, trans_credit_ori, trans_debet_rev,"+
          "fee_debet_ori, fee_debet_rev, fee_debet_ib, fee_debet_mb, pb.fee_debet_ibb, fee_debet_rek, fee_credit_1_ori, fee_credit_1_rev, fee_credit_1_ib,"+
          "fee_credit_1_mb, fee_credit_1_ibb, fee_credit_1_rek, fee_credit_2_ori, fee_credit_2_rev, fee_credit_2_ib, fee_credit_2_mb, fee_credit_2_ibb,"+
          "fee_credit_2_rek, fee_credit_3_ori, fee_credit_3_rev, fee_credit_3_ib, fee_credit_3_mb, fee_credit_3_ibb, fee_credit_3_rek, fee_credit_4_ori,"+
          "fee_credit_4_rev, fee_credit_4_ib, fee_credit_4_mb, fee_credit_4_ibb, fee_credit_4_rek, fee_credit_5_ori, fee_credit_5_rev, fee_credit_5_ib,"+
          "fee_credit_5_mb, fee_credit_5_ibb, fee_credit_5_rek, user_id, status, created_at)"+
          "VALUES ('"+ pcode +"','"+ biller_code +"','"+ product_type +"','"+ product_code +"','"+ transactions +"','"+ rek_number +"','"+ rek_name +"','"+ format +"','"+ trans_debet_ori +"',"
          +"'"+ trans_credit_rev +"','"+ trans_credit_ori +"','"+ trans_debet_rev +"','"+ fee_debet_ori +"','"+ fee_debet_rev +"','"+ fee_debet_ib +"',"
          +"'"+ fee_debet_mb +"','"+ fee_debet_ibb +"','"+ fee_debet_rek +"','"+ fee_credit_1_ori +"','"+ fee_credit_1_rev +"','"+ fee_credit_1_ib +"',"
          +"'"+ fee_credit_1_mb +"','"+ fee_credit_1_ibb +"','"+ fee_credit_1_rek +"','"+ fee_credit_2_ori +"','"+ fee_credit_2_rev +"','"+ fee_credit_2_ib +"',"
          +"'"+ fee_credit_2_mb +"','"+ fee_credit_2_ibb +"','"+ fee_credit_2_rek +"','"+ fee_credit_3_ori +"','"+ fee_credit_3_rev +"','"+ fee_credit_3_ib +"',"
          +"'"+ fee_credit_3_mb +"','"+ fee_credit_3_ibb +"','"+ fee_credit_3_rek +"','"+ fee_credit_4_ori +"','"+ fee_credit_4_rev +"','"+ fee_credit_4_ib +"',"
          +"'"+ fee_credit_4_mb +"','"+ fee_credit_4_ibb +"','"+ fee_credit_4_rek +"','"+ fee_credit_5_ori +"','"+ fee_credit_5_rev +"','"+ fee_credit_5_ib +"',"   
          +"'"+ fee_credit_5_mb +"','"+ fee_credit_5_ibb +"','"+ fee_credit_5_rek +"','"+ req.session.user.id +"','"+ status +"','"+ date +"')");
    })
    .then(result => {
      return res.json({
        'code': 200,
        'status': 'success',
        'message' : 'Setting has been saved'
      })
    })
    .catch(err => {
      logger.error(err); 
    })
  } catch (error) {
    logger.error(error); 
  }
};

exports.editPurchaseBill = async (req, res, next) => {
  const id = req.params.id;
  const prev = await getPrevillage(req.session.user.role_id);

  try {
    if (prev.includes(16)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 10, 'Setting Fee Purchase and Bill');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query("SELECT * FROM webadmin.purchase_bill AS pb WHERE pb.id='"+ id +"'");
      })
      .then(result => {
        sql.query("SELECT * FROM webadmin.m_fee AS mf WHERE mf.type=1")
        .then(master => {
          res.render('fee/purchase_bill/edit_purchase_bill', {
            isAuthenticated: req.session.isLoggedIn,
            sessionUser: req.session.user,
            purchase: result.recordset[0],
            master: master.recordset,
            previllage: prev,
            path: 'setting',
            subpath: 'fee'
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
}

exports.updatePurchaseBill = async (req, res, next) => {
  const id = req.body.id;
  // const request_activation = req.body.request_activation;
  // const code = req.body.pcode + '-' + req.body.biller_code + '-' + req.body.product_type + '-' + req.body.product_code;
  const pcode = req.body.pcode;
  const biller_code = req.body.biller_code;
  const product_type = req.body.product_type;
  const product_code = req.body.product_code;
  const transactions = req.body.transaction;
  const rek_number = req.body.rek_number;
  const rek_name = req.body.rek_name;
  const format = req.body.format;

  const trans_debet_ori = req.body.trans_debet_ori;
  const trans_credit_rev = req.body.trans_credit_rev;
  const trans_credit_ori = req.body.trans_credit_ori;
  const trans_debet_rev = req.body.trans_debet_rev;

  const fee_debet_ori = req.body.fee_debet_ori;
  const fee_debet_rev = req.body.fee_debet_rev;
  const fee_debet_ib = req.body.fee_debet_ib;
  const fee_debet_mb = req.body.fee_debet_mb;
  const fee_debet_ibb = req.body.fee_debet_ibb;
  const fee_debet_rek = req.body.fee_debet_rek;

  const fee_credit_1_ori = req.body.fee_credit_1_ori;
  const fee_credit_1_rev = req.body.fee_credit_1_rev;
  const fee_credit_1_ib = req.body.fee_credit_1_ib;
  const fee_credit_1_mb = req.body.fee_credit_1_mb;
  const fee_credit_1_ibb = req.body.fee_credit_1_ibb;
  const fee_credit_1_rek = req.body.fee_credit_1_rek;

  const fee_credit_2_ori = req.body.fee_credit_2_ori;
  const fee_credit_2_rev = req.body.fee_credit_2_rev;
  const fee_credit_2_ib = req.body.fee_credit_2_ib;
  const fee_credit_2_mb = req.body.fee_credit_2_mb;
  const fee_credit_2_ibb = req.body.fee_credit_2_ibb;
  const fee_credit_2_rek = req.body.fee_credit_2_rek;

  const fee_credit_3_ori = req.body.fee_credit_3_ori;
  const fee_credit_3_rev = req.body.fee_credit_3_rev;
  const fee_credit_3_ib = req.body.fee_credit_3_ib;
  const fee_credit_3_mb = req.body.fee_credit_3_mb;
  const fee_credit_3_ibb = req.body.fee_credit_3_ibb;
  const fee_credit_3_rek = req.body.fee_credit_3_rek;

  const fee_credit_4_ori = req.body.fee_credit_4_ori;
  const fee_credit_4_rev = req.body.fee_credit_4_rev;
  const fee_credit_4_ib = req.body.fee_credit_4_ib;
  const fee_credit_4_mb = req.body.fee_credit_4_mb;
  const fee_credit_4_ibb = req.body.fee_credit_4_ibb;
  const fee_credit_4_rek = req.body.fee_credit_4_rek;

  const fee_credit_5_ori = req.body.fee_credit_5_ori;
  const fee_credit_5_rev = req.body.fee_credit_5_rev;
  const fee_credit_5_ib = req.body.fee_credit_5_ib;
  const fee_credit_5_mb = req.body.fee_credit_5_mb;
  const fee_credit_5_ibb = req.body.fee_credit_5_ibb;
  const fee_credit_5_rek = req.body.fee_credit_5_rek;

  const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  // Check value Fee Debet same like Fee Credit 
  // Fee Debet === Fee Credit 1 to 5
  const count_ib = Number(fee_credit_1_ib.replace(/\,/g,'')) + Number(fee_credit_2_ib.replace(/\,/g,'')) + Number(fee_credit_3_ib.replace(/\,/g,'')) + Number(fee_credit_4_ib.replace(/\,/g,'')) + Number(fee_credit_5_ib.replace(/\,/g,''));
  const count_mb = Number(fee_credit_1_mb.replace(/\,/g,'')) + Number(fee_credit_2_mb.replace(/\,/g,'')) + Number(fee_credit_3_mb.replace(/\,/g,'')) + Number(fee_credit_4_mb.replace(/\,/g,'')) + Number(fee_credit_5_mb.replace(/\,/g,''));
  const count_ibb = Number(fee_credit_1_ibb.replace(/\,/g,'')) + Number(fee_credit_2_ibb.replace(/\,/g,'')) + Number(fee_credit_3_ibb.replace(/\,/g,'')) + Number(fee_credit_4_ibb.replace(/\,/g,'')) + Number(fee_credit_5_ibb.replace(/\,/g,''));


  if (Number(fee_debet_ib.replace(/\,/g,'')) !== count_ib) {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Value Fee Credit IB must same like Fee Debet IB, Please check your input Fee Credet IB'
    })
  }

  if (Number(fee_debet_mb.replace(/\,/g,'')) !== count_mb) {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Value Fee Credit MB must same like Fee Debet MB, Please check your input Fee Credet MB'
    })
  }

  if (Number(fee_debet_ibb.replace(/\,/g,'')) !== count_ibb) {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Value Fee Credit IBB must same like Fee Debet IBB, Please check your input Fee Credet IBB'
    })
  }

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      return sql
      .query("UPDATE webadmin.purchase_bill SET " +
        "transactions='"+transactions+"', pcode='"+pcode+"', biller_code='"+biller_code+"', product_type='"+product_type+"',"+
        "product_code='"+product_code+"', rek_number='"+rek_number+"', rek_name='"+rek_name+"', format='"+format+"', trans_debet_ori='"+trans_debet_ori+"',"+
        "trans_credit_rev='"+trans_credit_rev+"', trans_credit_ori='"+trans_credit_ori+"', trans_debet_rev='"+trans_debet_rev+"', fee_debet_ori='"+fee_debet_ori+"',"+
        "fee_debet_rev='"+fee_debet_rev+"', fee_debet_ib='"+fee_debet_ib+"', fee_debet_mb='"+fee_debet_mb+"', fee_debet_ibb='"+fee_debet_ibb+"', fee_debet_rek='"+fee_debet_rek+"',"+
        "fee_credit_1_ori='"+fee_credit_1_ori+"', fee_credit_1_rev='"+fee_credit_1_rev+"', fee_credit_1_ib='"+fee_credit_1_ib+"', fee_credit_1_mb='"+fee_credit_1_mb+"',"+
        "fee_credit_1_ibb='"+fee_credit_1_ibb+"', fee_credit_1_rek='"+fee_credit_1_rek+"', fee_credit_2_ori='"+fee_credit_2_ori+"', fee_credit_2_rev='"+fee_credit_2_rev+"',"+
        "fee_credit_2_ib='"+fee_credit_2_ib+"', fee_credit_2_mb='"+fee_credit_2_mb+"', fee_credit_2_ibb='"+fee_credit_2_ibb+"', fee_credit_2_rek='"+fee_credit_2_rek+"',"+
        "fee_credit_3_ori='"+fee_credit_3_ori+"', fee_credit_3_rev='"+fee_credit_3_rev+"', fee_credit_3_ib='"+fee_credit_3_ib+"', fee_credit_3_mb='"+fee_credit_3_mb+"',"+
        "fee_credit_3_ibb='"+fee_credit_3_ibb+"', fee_credit_3_rek='"+fee_credit_3_rek+"', fee_credit_4_ori='"+fee_credit_4_ori+"', fee_credit_4_rev='"+fee_credit_4_rev+"',"+
        "fee_credit_4_ib='"+fee_credit_4_ib+"', fee_credit_4_mb='"+fee_credit_4_mb+"', fee_credit_4_ibb='"+fee_credit_4_ibb+"', fee_credit_4_rek='"+fee_credit_4_rek+"',"+
        "fee_credit_5_ori='"+fee_credit_5_ori+"', fee_credit_5_rev='"+fee_credit_5_rev+"', fee_credit_5_ib='"+fee_credit_5_ib+"', fee_credit_5_mb='"+fee_credit_5_mb+"',"+
        "fee_credit_5_ibb='"+fee_credit_5_ibb+"', fee_credit_5_rek='"+fee_credit_5_rek+"', updated_at='"+date+"'"+"WHERE id='"+id+"'");
    })
    .then(result => {
      return res.json({
        'code': 200,
        'status': 'success',
        'message' : 'Setting has been updated'
      })
    })
    .catch(err => {
      logger.error(err); 
    })
  } catch (error) {
    logger.error(error); 
  }
};

exports.submitPurchaseBill = async (req, res, next) => {
  if (typeof req.query.ids === 'undefined') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Please select the data'
    })
  }

  let ids = req.query.ids.map( i => Number(i) );

  // Status
  // 1 Draf
  // 2 Submit
  // 3 Approve
  // 4 Reject
  const status = 2;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 8, 10, 'Submit Fee Purchase and Bill');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      // check status 
      sql.query("SELECT pb.status FROM webadmin.purchase_bill AS pb WHERE pb.id IN (" + ids + ")")
      .then(data => {
        const datas = data.recordset;

        // return when status === Approve
        if (datas.some(e => e.status === 3)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Approved data, please check the status if you want to Submit/Approve/Reject'
          })
        }

        // update
        sql.query("UPDATE webadmin.purchase_bill SET status='"+ status +"'  WHERE id IN (" + ids + ")")
        .then(results => {
          return res.json({
            'code': 200,
            'status': 'success',
            'message' : 'Submitted data successfully'
          });
        })
        .catch(err => {
          logger.error(err);
        });
      })
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.approvePurchaseBill = async (req, res, next) => {
  if (typeof req.query.ids === 'undefined') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Please select the data'
    })
  }

  let ids = req.query.ids.map( i => Number(i) );

  // Status
  // 1 Draf
  // 2 Submit
  // 3 Approve
  // 4 Reject
  const status = 3;
  const approver_id = req.session.user.id;
  const approval_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 9, 10, 'Approve Fee Purchase and Bill');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      // check status 
      sql.query("SELECT pb.status FROM webadmin.purchase_bill AS pb WHERE pb.id IN (" + ids + ")")
      .then(data => {
        const datas = data.recordset;

        if (datas.some(e => e.status === 1)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Draft data, please check the status if you want to Approve'
          })
        }

        if (datas.some(e => e.status === 4)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Rejected data, please check the status if you want to Approve'
          })
        }

        if (datas.some(e => e.status === 3)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Approved data, please check the status if you want to Approve'
          })
        }

        sql.query("UPDATE webadmin.purchase_bill SET status='"+ status +"', approval_id='"+ approver_id +"', approval_date='"+ approval_date +"'  WHERE id IN (" + ids + ")")
        .then(results => {          
          return res.json({
            'code': 200,
            'status': 'success',
            'message' : 'Approved data successfully'
          });
        });
      });
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.rejectPurchaseBill = async (req, res, next) => {
  if (typeof req.query.ids === 'undefined') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Please select the data'
    })
  }

  let ids = req.query.ids.map( i => Number(i) );

  // Status
  // 1 Draf
  // 2 Submit
  // 3 Approve
  // 4 Reject
  const status = 4;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 10, 10, 'Reject Fee Purchase and Bill');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      // check status 
      sql.query("SELECT pb.status FROM webadmin.purchase_bill AS pb WHERE pb.id IN (" + ids + ")")
      .then(data => {
        const datas = data.recordset;

        if (datas.some(e => e.status === 1)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Draft data, please check the status if you want to Reject'
          })
        }

        if (datas.some(e => e.status === 3)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Approved data, please check the status if you want to Reject'
          })
        }

        sql.query("UPDATE webadmin.purchase_bill SET status='"+ status +"' WHERE id IN (" + ids + ")")
        .then(results => {
          return res.json({
            'code': 200,
            'status': 'success',
            'message' : 'Rejected data successfully'
          })
        })
      })
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.reloadPurchaseBill = async (req, res, next) => {
  const pcode = req.body.pcode;
  const biller_code = req.body.biller_code;
  const product_type = req.body.product_type;
  const product_code = req.body.product_code;
  // const code = pcode + '-' + biller_code + '-' + product_type + '-' + product_code;

  if (pcode === '' || biller_code === '' || product_type === '' || product_code === '') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Pcode, Biller Code, Product Type and Product Code is required if you want to reload data'
    })
  }

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      sql.query("SELECT * FROM webadmin.purchase_bill AS pb WHERE pb.pcode='"+ pcode +"' AND pb.biller_code='"+ biller_code +"' AND pb.product_type='"+ product_type +"' AND pb.product_code='"+ product_code +"' AND pb.status=1 ORDER BY pb.created_at DESC")
      .then(results => {
        if (results.recordset.length === 0) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'Data has not found',
          }) 
        }
        return res.json({
          'code': 200,
          'status': 'success',
          'message' : results.recordset[0],
        }) 
      })
      .catch(err => {
        logger.error(err)
      })
    })
  } catch (error) {
    logger.error(error);
  }
}

exports.viewPurchaseBill = async (req, res, next) => {
  const id = req.params.id;
  const prev = await getPrevillage(req.session.user.role_id);

  try {
    if (prev.includes(14)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 10, 'View Fee Purchase and Bill');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query("SELECT * FROM webadmin.purchase_bill AS pb WHERE pb.id='"+ id +"'");
      })
      .then(result => {
        sql.query("SELECT * FROM webadmin.m_fee AS mf WHERE mf.type=1")
        .then(master => {
          res.render('fee/purchase_bill/view_purchase_bill', {
            isAuthenticated: req.session.isLoggedIn,
            sessionUser: req.session.user,
            purchase: result.recordset[0],
            master: master.recordset,
            previllage: prev,
            path: 'setting',
            subpath: 'fee'
          });
        })
        .catch(err => {
          logger.warn(err);
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
}

exports.deletePurchaseBill = async (req, res, next) => {
  const id = req.params.id;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 7, 10, 'Delete Fee Purchase and Bill');

    // get data by uuid
    await sql.connect(dbConfig.dbConnection())
    .then(user => {
      sql.query("DELETE FROM webadmin.purchase_bill WHERE id='" + id + "'")
      .then(result => {
        res.json({
          'code': 200,
          'status': 'success',
          'message' : 'Delete Successfully'
        })
        // res.redirect('/user');
      })
      .catch(err => {
        logger.error(err);
      });
    })
    .catch(err => {
      logger.error(err);
    });
  } catch (error) {
    logger.error(error);
  }
}

// Module Transfer Dana
exports.getTransferDana = async (req, res, next) => {
  const prev = await getPrevillage(req.session.user.role_id);

  try {
    if (prev.includes(13)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 11, 'Setting Fee Transfer Dana');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query(`SELECT TOP 1000 t.id, t.request_activation, t.pcode, t.description_pcode, t.trx_dec, t.channel_id, t.pcode_bv, t.switcher, t.acq, t.trf_indicator, t.jenis_transaksi,
        t.user_id, t.approval_id, t.approval_date, t.status, t.new_approved, t.created_at, t.updated_at, c.name AS user_created, a.name AS user_approver, m.transactions AS trans
        FROM webadmin.transfer_dana AS t
        LEFT JOIN webadmin.users AS c ON c.id = t.user_id
        LEFT JOIN webadmin.users AS a ON a.id = t.approval_id
        LEFT JOIN webadmin.m_fee AS m on m.id = t.description_pcode`);
      })
      .then(result => {
        res.render('fee/transfer_dana/index', {
          isAuthenticated: req.session.isLoggedIn,
          sessionUser: req.session.user,
          transferDana: result.recordset,
          previllage: prev,
          moment: moment,
          path: 'setting',
          subpath: 'transfer_dana'
        });
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

exports.createTransferDana = async (req, res, next) => {
  const prev = await getPrevillage(req.session.user.role_id);

  try {
    if (prev.includes(15)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 4, 11, 'Create Fee Transfer Dana');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query("SELECT * FROM webadmin.m_fee AS mf WHERE mf.type=2")
      })
      .then(result => {
        res.render('fee/transfer_dana/create_transfer_dana', {
          isAuthenticated: req.session.isLoggedIn,
          sessionUser: req.session.user,
          master: result.recordset,
          previllage: prev,
          path: 'setting',
          subpath: 'fee'
        });
      })
      .catch(err => {
        logger.warn(err);
      })
    } else {
      return res.redirect('/404');
    }
  } catch (error) {
    logger.error(error);
  }
};

exports.postTransferDana = async (req, res, next) => {
  const status = 1;
  // const request_activation = req.body.request_activation;
  const pcode = req.body.pcode;
  const description_pcode = req.body.description_pcode;
  const trx_dec = req.body.trx_dec;
  const channel_id = req.body.channel_id;
  const pcode_bv = req.body.pcode_bv;
  const switcher = req.body.switcher;
  const acq = req.body.acq;
  const trf_indicator = req.body.trf_indicator;
  const jenis_transaksi = req.body.jenis_transaksi;
  const rek_debet_perantara_1 = req.body.rek_debet_perantara_1;
  const rek_credit_perantara = req.body.rek_credit_perantara;
  const rek_debet_perantara_2 = req.body.rek_debet_perantara_2;

  const trx_ib_debet_1 = req.body.trx_ib_debet_1;
  const trx_mb_debet_1 = req.body.trx_mb_debet_1;
  const trx_ibb_debet_1 = req.body.trx_ibb_debet_1;
  const trx_ib_credit = req.body.trx_ib_credit;
  const trx_mb_credit = req.body.trx_mb_credit;
  const trx_ibb_credit = req.body.trx_ibb_credit;
  const trx_ib_debet_2 = req.body.trx_ib_debet_2;
  const trx_mb_debet_2 = req.body.trx_mb_debet_2;
  const trx_ibb_debet_2 = req.body.trx_ibb_debet_2;

  const rev_ib_debet_1 = req.body.rev_ib_debet_1;
  const rev_mb_debet_1 = req.body.rev_mb_debet_1;
  const rev_ibb_debet_1 = req.body.rev_ibb_debet_1;
  const rev_ib_credit = req.body.rev_ib_credit;
  const rev_mb_credit = req.body.rev_mb_credit;
  const rev_ibb_credit = req.body.rev_ibb_credit;
  const rev_ib_debet_2 = req.body.rev_ib_debet_2;
  const rev_mb_debet_2 = req.body.rev_mb_debet_2;
  const rev_ibb_debet_2 = req.body.rev_ibb_debet_2;

  const ori_ib_1 = req.body.ori_ib_1;
  const ori_mb_1 = req.body.ori_mb_1;
  const ori_ibb_1 = req.body.ori_ibb_1;
  const rev_ib_1 = req.body.rev_ib_1;
  const rev_mb_1 = req.body.rev_mb_1;
  const rev_ibb_1 = req.body.rev_ibb_1;
  const acc_ib_1 = req.body.acc_ib_1;
  const acc_mb_1 = req.body.acc_mb_1;
  const acc_ibb_1 = req.body.acc_ibb_1;
  const am_ib_1 = req.body.am_ib_1;
  const am_mb_1 = req.body.am_mb_1;
  const am_ibb_1 = req.body.am_ibb_1;

  const ori_ib_2 = req.body.ori_ib_2;
  const ori_mb_2 = req.body.ori_mb_2;
  const ori_ibb_2 = req.body.ori_ibb_2;
  const rev_ib_2 = req.body.rev_ib_2;
  const rev_mb_2 = req.body.rev_mb_2;
  const rev_ibb_2 = req.body.rev_ibb_2;
  const acc_ib_2 = req.body.acc_ib_2;
  const acc_mb_2 = req.body.acc_mb_2;
  const acc_ibb_2 = req.body.acc_ibb_2;
  const am_ib_2 = req.body.am_ib_2;
  const am_mb_2 = req.body.am_mb_2;
  const am_ibb_2 = req.body.am_ibb_2;

  const ori_ib_3 = req.body.ori_ib_3;
  const ori_mb_3 = req.body.ori_mb_3;
  const ori_ibb_3 = req.body.ori_ibb_3;
  const rev_ib_3 = req.body.rev_ib_3;
  const rev_mb_3 = req.body.rev_mb_3;
  const rev_ibb_3 = req.body.rev_ibb_3;
  const acc_ib_3 = req.body.acc_ib_3;
  const acc_mb_3 = req.body.acc_mb_3;
  const acc_ibb_3 = req.body.acc_ibb_3;
  const am_ib_3 = req.body.am_ib_3;
  const am_mb_3 = req.body.am_mb_3;
  const am_ibb_3 = req.body.am_ibb_3;

  const ori_ib_4 = req.body.ori_ib_4;
  const ori_mb_4 = req.body.ori_mb_4;
  const ori_ibb_4 = req.body.ori_ibb_4;
  const rev_ib_4 = req.body.rev_ib_4;
  const rev_mb_4 = req.body.rev_mb_4;
  const rev_ibb_4 = req.body.rev_ibb_4;
  const acc_ib_4 = req.body.acc_ib_4;
  const acc_mb_4 = req.body.acc_mb_4;
  const acc_ibb_4 = req.body.acc_ibb_4;
  const am_ib_4 = req.body.am_ib_4;
  const am_mb_4 = req.body.am_mb_4;
  const am_ibb_4 = req.body.am_ibb_4;

  const ori_ib_5 = req.body.ori_ib_5;
  const ori_mb_5 = req.body.ori_mb_5;
  const ori_ibb_5 = req.body.ori_ibb_5;
  const rev_ib_5 = req.body.rev_ib_5;
  const rev_mb_5 = req.body.rev_mb_5;
  const rev_ibb_5 = req.body.rev_ibb_5;
  const acc_ib_5 = req.body.acc_ib_5;
  const acc_mb_5 = req.body.acc_mb_5;
  const acc_ibb_5 = req.body.acc_ibb_5;
  const am_ib_5 = req.body.am_ib_5;
  const am_mb_5 = req.body.am_mb_5;
  const am_ibb_5 = req.body.am_ibb_5;

  const ori_ib_6 = req.body.ori_ib_6;
  const ori_mb_6 = req.body.ori_mb_6;
  const ori_ibb_6 = req.body.ori_ibb_6;
  const rev_ib_6 = req.body.rev_ib_6;
  const rev_mb_6 = req.body.rev_mb_6;
  const rev_ibb_6 = req.body.rev_ibb_6;
  const acc_ib_6 = req.body.acc_ib_6;
  const acc_mb_6 = req.body.acc_mb_6;
  const acc_ibb_6 = req.body.acc_ibb_6;
  const am_ib_6 = req.body.am_ib_6;
  const am_mb_6 = req.body.am_mb_6;
  const am_ibb_6 = req.body.am_ibb_6;

  const ori_ib_7 = req.body.ori_ib_7;
  const ori_mb_7 = req.body.ori_mb_7;
  const ori_ibb_7 = req.body.ori_ibb_7;
  const rev_ib_7 = req.body.rev_ib_7;
  const rev_mb_7 = req.body.rev_mb_7;
  const rev_ibb_7 = req.body.rev_ibb_7;
  const acc_ib_7 = req.body.acc_ib_7;
  const acc_mb_7 = req.body.acc_mb_7;
  const acc_ibb_7 = req.body.acc_ibb_7;
  const am_ib_7 = req.body.am_ib_7;
  const am_mb_7 = req.body.am_mb_7;
  const am_ibb_7 = req.body.am_ibb_7;

  const ori_ib_8 = req.body.ori_ib_8;
  const ori_mb_8 = req.body.ori_mb_8;
  const ori_ibb_8 = req.body.ori_ibb_8;
  const rev_ib_8 = req.body.rev_ib_8;
  const rev_mb_8 = req.body.rev_mb_8;
  const rev_ibb_8 = req.body.rev_ibb_8;
  const acc_ib_8 = req.body.acc_ib_8;
  const acc_mb_8 = req.body.acc_mb_8;
  const acc_ibb_8 = req.body.acc_ibb_8;
  const am_ib_8 = req.body.am_ib_8;
  const am_mb_8 = req.body.am_mb_8;
  const am_ibb_8 = req.body.am_ibb_8;

  const ori_ib_9 = req.body.ori_ib_9;
  const ori_mb_9 = req.body.ori_mb_9;
  const ori_ibb_9 = req.body.ori_ibb_9;
  const rev_ib_9 = req.body.rev_ib_9;
  const rev_mb_9 = req.body.rev_mb_9;
  const rev_ibb_9 = req.body.rev_ibb_9;
  const acc_ib_9 = req.body.acc_ib_9;
  const acc_mb_9 = req.body.acc_mb_9;
  const acc_ibb_9 = req.body.acc_ibb_9;
  const am_ib_9 = req.body.am_ib_9;
  const am_mb_9 = req.body.am_mb_9;
  const am_ibb_9 = req.body.am_ibb_9;

  const ori_ib_10 = req.body.ori_ib_10;
  const ori_mb_10 = req.body.ori_mb_10;
  const ori_ibb_10 = req.body.ori_ibb_10;
  const rev_ib_10 = req.body.rev_ib_10;
  const rev_mb_10 = req.body.rev_mb_10;
  const rev_ibb_10 = req.body.rev_ibb_10;
  const acc_ib_10 = req.body.acc_ib_10;
  const acc_mb_10 = req.body.acc_mb_10;
  const acc_ibb_10 = req.body.acc_ibb_10;
  const am_ib_10 = req.body.am_ib_10;
  const am_mb_10 = req.body.am_mb_10;
  const am_ibb_10 = req.body.am_ibb_10;

  const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      return sql.query("INSERT INTO webadmin.transfer_dana" +
        "(pcode, description_pcode, trx_dec, channel_id, pcode_bv, switcher, acq, trf_indicator, jenis_transaksi, rek_debet_perantara_1, rek_credit_perantara, rek_debet_perantara_2, trx_ib_debet_1, trx_mb_debet_1, trx_ibb_debet_1, trx_ib_credit,"+
          "trx_mb_credit, trx_ibb_credit, trx_ib_debet_2, trx_mb_debet_2, trx_ibb_debet_2, rev_ib_debet_1, rev_mb_debet_1, rev_ibb_debet_1, rev_ib_credit,"+
          "rev_mb_credit, rev_ibb_credit, rev_ib_debet_2, rev_mb_debet_2, rev_ibb_debet_2, user_id, status, created_at)"+
          "VALUES ('"+ pcode +"','"+ description_pcode +"','"+ trx_dec +"','"+ channel_id +"','"+ pcode_bv +"','"+ switcher +"','"+acq+"','"+trf_indicator+"','"+jenis_transaksi+"','"+ rek_debet_perantara_1 +"','"+ rek_credit_perantara +"','"+ rek_debet_perantara_2 +"','"+ trx_ib_debet_1 +"',"
          +"'"+ trx_mb_debet_1 +"','"+ trx_ibb_debet_1 +"','"+ trx_ib_credit +"','"+ trx_mb_credit +"','"+ trx_ibb_credit +"','"+ trx_ib_debet_2 +"',"
          +"'"+ trx_mb_debet_2 +"','"+ trx_ibb_debet_2 +"','"+ rev_ib_debet_1 +"','"+ rev_mb_debet_1 +"','"+ rev_ibb_debet_1 +"','"+ rev_ib_credit +"',"
          +"'"+ rev_mb_credit +"','"+ rev_ibb_credit +"','"+ rev_ib_debet_2 +"','"+ rev_mb_debet_2 +"','"+ rev_ibb_debet_2 +"','"+ req.session.user.id +"','"+ status +"','"+ date +"');SELECT SCOPE_IDENTITY() AS id");
    })
    .then(result => {
      var transfer_dana_id = result.recordset[0].id;

      sql.query("INSERT INTO webadmin.detail_transfer_dana "+
        "(transfer_dana_id, ori_ib_1,ori_mb_1,ori_ibb_1,rev_ib_1,rev_mb_1,rev_ibb_1,acc_ib_1,acc_mb_1,acc_ibb_1,am_ib_1,am_mb_1,am_ibb_1,"+
          "ori_ib_2,ori_mb_2,ori_ibb_2,rev_ib_2,rev_mb_2,rev_ibb_2,acc_ib_2,acc_mb_2,acc_ibb_2,am_ib_2,am_mb_2,am_ibb_2,"+
          "ori_ib_3,ori_mb_3,ori_ibb_3,rev_ib_3,rev_mb_3,rev_ibb_3,acc_ib_3,acc_mb_3,acc_ibb_3,am_ib_3,am_mb_3,am_ibb_3,"+
          "ori_ib_4,ori_mb_4,ori_ibb_4,rev_ib_4,rev_mb_4,rev_ibb_4,acc_ib_4,acc_mb_4,acc_ibb_4,am_ib_4,am_mb_4,am_ibb_4,"+
          "ori_ib_5,ori_mb_5,ori_ibb_5,rev_ib_5,rev_mb_5,rev_ibb_5,acc_ib_5,acc_mb_5,acc_ibb_5,am_ib_5,am_mb_5,am_ibb_5,"+
          "ori_ib_6, ori_mb_6, ori_ibb_6, rev_ib_6, rev_mb_6, rev_ibb_6, acc_ib_6, acc_mb_6, acc_ibb_6, am_ib_6, am_mb_6, am_ibb_6,"+
          "ori_ib_7, ori_mb_7, ori_ibb_7, rev_ib_7, rev_mb_7, rev_ibb_7, acc_ib_7, acc_mb_7, acc_ibb_7, am_ib_7, am_mb_7, am_ibb_7,"+
          "ori_ib_8, ori_mb_8, ori_ibb_8, rev_ib_8, rev_mb_8, rev_ibb_8, acc_ib_8, acc_mb_8, acc_ibb_8, am_ib_8, am_mb_8, am_ibb_8,"+
          "ori_ib_9, ori_mb_9, ori_ibb_9, rev_ib_9, rev_mb_9, rev_ibb_9, acc_ib_9, acc_mb_9, acc_ibb_9, am_ib_9, am_mb_9, am_ibb_9,"+
          "ori_ib_10, ori_mb_10, ori_ibb_10, rev_ib_10, rev_mb_10, rev_ibb_10, acc_ib_10, acc_mb_10, acc_ibb_10, am_ib_10, am_mb_10, am_ibb_10, created_at)"+
          "VALUES ('"+ transfer_dana_id +"','"+ ori_ib_1 +"','"+ ori_mb_1 +"','"+ ori_ibb_1 +"','"+ rev_ib_1 +"','"+ rev_mb_1 +"',"
          +"'"+ rev_ibb_1 +"','"+ acc_ib_1 +"','"+ acc_mb_1 +"','"+ acc_ibb_1 +"','"+ am_ib_1 +"','"+ am_mb_1 +"',"
          +"'"+ am_ibb_1 +"','"+ ori_ib_2 +"','"+ ori_mb_2 +"','"+ ori_ibb_2 +"','"+ rev_ib_2 +"','"+ rev_mb_2 +"',"
          +"'"+ rev_ibb_2 +"','"+ acc_ib_2 +"','"+ acc_mb_2 +"','"+ acc_ibb_2 +"','"+ am_ib_2 +"','"+ am_mb_2 +"',"
          +"'"+ am_ibb_2 +"','"+ ori_ib_3 +"','"+ ori_mb_3 +"','"+ ori_ibb_3 +"','"+ rev_ib_3 +"','"+ rev_mb_3 +"',"
          +"'"+ rev_ibb_3 +"','"+ acc_ib_3 +"','"+ acc_mb_3 +"','"+ acc_ibb_3 +"','"+ am_ib_3 +"','"+ am_mb_3 +"','"+ am_ibb_3 +"','"+ ori_ib_4 +"','"+ ori_mb_4 +"',"
          +"'"+ ori_ibb_4 +"','"+ rev_ib_4 +"','"+ rev_mb_4 +"','"+ rev_ibb_4 +"','"+ acc_ib_4 +"','"+ acc_mb_4 +"','"+ acc_ibb_4 +"','"+ am_ib_4 +"','"+ am_mb_4 +"','"+ am_ibb_4 +"',"
          +"'"+ ori_ib_5 +"','"+ ori_mb_5 +"','"+ ori_ibb_5 +"','"+ rev_ib_5 +"','"+ rev_mb_5 +"','"+ rev_ibb_5 +"','"+ acc_ib_5 +"','"+ acc_mb_5 +"','"+ acc_ibb_5 +"','"+ am_ib_5 +"','"+ am_mb_5 +"','"+ am_ibb_5 +"',"
          +"'"+ ori_ib_6 +"','"+ ori_mb_6 +"','"+ ori_ibb_6 +"','"+ rev_ib_6 +"','"+ rev_mb_6 +"','"+ rev_ibb_6 +"','"+ acc_ib_6 +"','"+ acc_mb_6 +"','"+ acc_ibb_6 +"','"+ am_ib_6 +"','"+ am_mb_6 +"','"+ am_ibb_6 +"',"
          +"'"+ ori_ib_7 +"','"+ ori_mb_7 +"','"+ ori_ibb_7 +"','"+ rev_ib_7 +"','"+ rev_mb_7 +"','"+ rev_ibb_7 +"','"+ acc_ib_7 +"','"+ acc_mb_7 +"','"+ acc_ibb_7 +"','"+ am_ib_7 +"','"+ am_mb_7 +"','"+ am_ibb_7 +"',"
          +"'"+ ori_ib_8 +"','"+ ori_mb_8 +"','"+ ori_ibb_8 +"','"+ rev_ib_8 +"','"+ rev_mb_8 +"','"+ rev_ibb_8 +"','"+ acc_ib_8 +"','"+ acc_mb_8 +"','"+ acc_ibb_8 +"','"+ am_ib_8 +"','"+ am_mb_8 +"','"+ am_ibb_8 +"',"
          +"'"+ ori_ib_9 +"','"+ ori_mb_9 +"','"+ ori_ibb_9 +"','"+ rev_ib_9 +"','"+ rev_mb_9 +"','"+ rev_ibb_9 +"','"+ acc_ib_9 +"','"+ acc_mb_9 +"','"+ acc_ibb_9 +"','"+ am_ib_9 +"','"+ am_mb_9 +"','"+ am_ibb_9 +"',"
          +"'"+ ori_ib_10 +"','"+ ori_mb_10 +"','"+ ori_ibb_10 +"','"+ rev_ib_10 +"','"+ rev_mb_10 +"','"+ rev_ibb_10 +"','"+ acc_ib_10 +"','"+ acc_mb_10 +"','"+ acc_ibb_10 +"','"+ am_ib_10 +"','"+ am_mb_10 +"','"+ am_ibb_10 +"','"+ date +"')");

      return res.json({
        'code': 200,
        'status': 'success',
        'message' : 'Setting Transfer Dana has been saved'
      })
    })
    .catch(err => {
      logger.error(err);
    })
  } catch (error) {
    logger.error(error);
  }
};

exports.editTransferDana = async (req, res, next) => {
  const id = req.params.id;
  const prev = await getPrevillage(req.session.user.role_id);

  try {
    if (prev.includes(16)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 11, 'Update Fee Transfer Dana');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query("SELECT td.*, dtd.ori_ib_1, dtd.ori_mb_1, dtd.ori_ibb_1, dtd.rev_ib_1, dtd.rev_mb_1, dtd.rev_ibb_1, dtd.acc_ib_1, dtd.acc_mb_1, dtd.acc_ibb_1,"+
        "dtd.am_ib_1, dtd.am_mb_1, dtd.am_ibb_1, dtd.ori_ib_2, dtd.ori_mb_2, dtd.ori_ibb_2, dtd.rev_ib_2, dtd.rev_mb_2, dtd.rev_ibb_2, dtd.acc_ib_2, dtd.acc_mb_2,"+
        "dtd.acc_ibb_2, dtd.am_ib_2, dtd.am_mb_2, dtd.am_ibb_2, dtd.ori_ib_3, dtd.ori_mb_3, dtd.ori_ibb_3, dtd.rev_ib_3, dtd.rev_mb_3, dtd.rev_ibb_3, dtd.acc_ib_3,"+ 
        "dtd.acc_mb_3, dtd.acc_ibb_3, dtd.am_ib_3, dtd.am_mb_3, dtd.am_ibb_3, dtd.ori_ib_4, dtd.ori_mb_4, dtd.ori_ibb_4, dtd.rev_ib_4, dtd.rev_mb_4, dtd.rev_ibb_4,"+
        "dtd.acc_ib_4, dtd.acc_mb_4, dtd.acc_ibb_4, dtd.am_ib_4, dtd.am_mb_4, dtd.am_ibb_4,"+ 
        "dtd.ori_ib_5, dtd.ori_mb_5, dtd.ori_ibb_5, dtd.rev_ib_5, dtd.rev_mb_5, dtd.rev_ibb_5, dtd.acc_ib_5, dtd.acc_mb_5, dtd.acc_ibb_5, dtd.am_ib_5, dtd.am_mb_5, dtd.am_ibb_5, "+ 
        "dtd.ori_ib_6, dtd.ori_mb_6, dtd.ori_ibb_6, dtd.rev_ib_6, dtd.rev_mb_6, dtd.rev_ibb_6, dtd.acc_ib_6, dtd.acc_mb_6, dtd.acc_ibb_6, dtd.am_ib_6, dtd.am_mb_6, dtd.am_ibb_6, "+
        "dtd.ori_ib_7, dtd.ori_mb_7, dtd.ori_ibb_7, dtd.rev_ib_7, dtd.rev_mb_7, dtd.rev_ibb_7, dtd.acc_ib_7, dtd.acc_mb_7, dtd.acc_ibb_7, dtd.am_ib_7, dtd.am_mb_7, dtd.am_ibb_7, "+
        "dtd.ori_ib_8, dtd.ori_mb_8, dtd.ori_ibb_8, dtd.rev_ib_8, dtd.rev_mb_8, dtd.rev_ibb_8, dtd.acc_ib_8, dtd.acc_mb_8, dtd.acc_ibb_8, dtd.am_ib_8, dtd.am_mb_8, dtd.am_ibb_8, "+
        "dtd.ori_ib_9, dtd.ori_mb_9, dtd.ori_ibb_9, dtd.rev_ib_9, dtd.rev_mb_9, dtd.rev_ibb_9, dtd.acc_ib_9, dtd.acc_mb_9, dtd.acc_ibb_9, dtd.am_ib_9, dtd.am_mb_9, dtd.am_ibb_9, "+
        "dtd.ori_ib_10, dtd.ori_mb_10, dtd.ori_ibb_10, dtd.rev_ib_10, dtd.rev_mb_10, dtd.rev_ibb_10, dtd.acc_ib_10, dtd.acc_mb_10, dtd.acc_ibb_10, dtd.am_ib_10, dtd.am_mb_10, dtd.am_ibb_10 "+
        "FROM webadmin.transfer_dana AS td "+
        "LEFT JOIN webadmin.detail_transfer_dana AS dtd ON td.id = dtd.transfer_dana_id "+
        "WHERE td.id='"+ id +"'");
      })
      .then(result => {
        sql.query("SELECT mf.id, mf.transactions FROM webadmin.m_fee AS mf WHERE mf.type=2")
        .then(master => {
          res.render('fee/transfer_dana/edit_transfer_dana', {
            isAuthenticated: req.session.isLoggedIn,
            sessionUser: req.session.user,
            transfer: result.recordset[0],
            master: master.recordset,
            previllage: prev,
            path: 'setting',
            subpath: 'fee'
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
}

exports.updateTransferDana = async (req, res, next) => {
  const id = req.body.id;
  // const request_activation = req.body.request_activation;
  const pcode = req.body.pcode;
  const description_pcode = req.body.description_pcode;
  const trx_dec = req.body.trx_dec;
  const channel_id = req.body.channel_id;
  const pcode_bv = req.body.pcode_bv;
  const switcher = req.body.switcher;
  const acq = req.body.acq;
  const trf_indicator = req.body.trf_indicator;
  const jenis_transaksi = req.body.jenis_transaksi;
  const rek_debet_perantara_1 = req.body.rek_debet_perantara_1;
  const rek_credit_perantara = req.body.rek_credit_perantara;
  const rek_debet_perantara_2 = req.body.rek_debet_perantara_2;

  const trx_ib_debet_1 = req.body.trx_ib_debet_1;
  const trx_mb_debet_1 = req.body.trx_mb_debet_1;
  const trx_ibb_debet_1 = req.body.trx_ibb_debet_1;
  const trx_ib_credit = req.body.trx_ib_credit;
  const trx_mb_credit = req.body.trx_mb_credit;
  const trx_ibb_credit = req.body.trx_ibb_credit;
  const trx_ib_debet_2 = req.body.trx_ib_debet_2;
  const trx_mb_debet_2 = req.body.trx_mb_debet_2;
  const trx_ibb_debet_2 = req.body.trx_ibb_debet_2;

  const rev_ib_debet_1 = req.body.rev_ib_debet_1;
  const rev_mb_debet_1 = req.body.rev_mb_debet_1;
  const rev_ibb_debet_1 = req.body.rev_ibb_debet_1;
  const rev_ib_credit = req.body.rev_ib_credit;
  const rev_mb_credit = req.body.rev_mb_credit;
  const rev_ibb_credit = req.body.rev_ibb_credit;
  const rev_ib_debet_2 = req.body.rev_ib_debet_2;
  const rev_mb_debet_2 = req.body.rev_mb_debet_2;
  const rev_ibb_debet_2 = req.body.rev_ibb_debet_2;

  const ori_ib_1 = req.body.ori_ib_1;
  const ori_mb_1 = req.body.ori_mb_1;
  const ori_ibb_1 = req.body.ori_ibb_1;
  const rev_ib_1 = req.body.rev_ib_1;
  const rev_mb_1 = req.body.rev_mb_1;
  const rev_ibb_1 = req.body.rev_ibb_1;
  const acc_ib_1 = req.body.acc_ib_1;
  const acc_mb_1 = req.body.acc_mb_1;
  const acc_ibb_1 = req.body.acc_ibb_1;
  const am_ib_1 = req.body.am_ib_1;
  const am_mb_1 = req.body.am_mb_1;
  const am_ibb_1 = req.body.am_ibb_1;

  const ori_ib_2 = req.body.ori_ib_2;
  const ori_mb_2 = req.body.ori_mb_2;
  const ori_ibb_2 = req.body.ori_ibb_2;
  const rev_ib_2 = req.body.rev_ib_2;
  const rev_mb_2 = req.body.rev_mb_2;
  const rev_ibb_2 = req.body.rev_ibb_2;
  const acc_ib_2 = req.body.acc_ib_2;
  const acc_mb_2 = req.body.acc_mb_2;
  const acc_ibb_2 = req.body.acc_ibb_2;
  const am_ib_2 = req.body.am_ib_2;
  const am_mb_2 = req.body.am_mb_2;
  const am_ibb_2 = req.body.am_ibb_2;

  const ori_ib_3 = req.body.ori_ib_3;
  const ori_mb_3 = req.body.ori_mb_3;
  const ori_ibb_3 = req.body.ori_ibb_3;
  const rev_ib_3 = req.body.rev_ib_3;
  const rev_mb_3 = req.body.rev_mb_3;
  const rev_ibb_3 = req.body.rev_ibb_3;
  const acc_ib_3 = req.body.acc_ib_3;
  const acc_mb_3 = req.body.acc_mb_3;
  const acc_ibb_3 = req.body.acc_ibb_3;
  const am_ib_3 = req.body.am_ib_3;
  const am_mb_3 = req.body.am_mb_3;
  const am_ibb_3 = req.body.am_ibb_3;

  const ori_ib_4 = req.body.ori_ib_4;
  const ori_mb_4 = req.body.ori_mb_4;
  const ori_ibb_4 = req.body.ori_ibb_4;
  const rev_ib_4 = req.body.rev_ib_4;
  const rev_mb_4 = req.body.rev_mb_4;
  const rev_ibb_4 = req.body.rev_ibb_4;
  const acc_ib_4 = req.body.acc_ib_4;
  const acc_mb_4 = req.body.acc_mb_4;
  const acc_ibb_4 = req.body.acc_ibb_4;
  const am_ib_4 = req.body.am_ib_4;
  const am_mb_4 = req.body.am_mb_4;
  const am_ibb_4 = req.body.am_ibb_4;

  const ori_ib_5 = req.body.ori_ib_5;
  const ori_mb_5 = req.body.ori_mb_5;
  const ori_ibb_5 = req.body.ori_ibb_5;
  const rev_ib_5 = req.body.rev_ib_5;
  const rev_mb_5 = req.body.rev_mb_5;
  const rev_ibb_5 = req.body.rev_ibb_5;
  const acc_ib_5 = req.body.acc_ib_5;
  const acc_mb_5 = req.body.acc_mb_5;
  const acc_ibb_5 = req.body.acc_ibb_5;
  const am_ib_5 = req.body.am_ib_5;
  const am_mb_5 = req.body.am_mb_5;
  const am_ibb_5 = req.body.am_ibb_5;

  const ori_ib_6 = req.body.ori_ib_6;
  const ori_mb_6 = req.body.ori_mb_6;
  const ori_ibb_6 = req.body.ori_ibb_6;
  const rev_ib_6 = req.body.rev_ib_6;
  const rev_mb_6 = req.body.rev_mb_6;
  const rev_ibb_6 = req.body.rev_ibb_6;
  const acc_ib_6 = req.body.acc_ib_6;
  const acc_mb_6 = req.body.acc_mb_6;
  const acc_ibb_6 = req.body.acc_ibb_6;
  const am_ib_6 = req.body.am_ib_6;
  const am_mb_6 = req.body.am_mb_6;
  const am_ibb_6 = req.body.am_ibb_6;

  const ori_ib_7 = req.body.ori_ib_7;
  const ori_mb_7 = req.body.ori_mb_7;
  const ori_ibb_7 = req.body.ori_ibb_7;
  const rev_ib_7 = req.body.rev_ib_7;
  const rev_mb_7 = req.body.rev_mb_7;
  const rev_ibb_7 = req.body.rev_ibb_7;
  const acc_ib_7 = req.body.acc_ib_7;
  const acc_mb_7 = req.body.acc_mb_7;
  const acc_ibb_7 = req.body.acc_ibb_7;
  const am_ib_7 = req.body.am_ib_7;
  const am_mb_7 = req.body.am_mb_7;
  const am_ibb_7 = req.body.am_ibb_7;

  const ori_ib_8 = req.body.ori_ib_8;
  const ori_mb_8 = req.body.ori_mb_8;
  const ori_ibb_8 = req.body.ori_ibb_8;
  const rev_ib_8 = req.body.rev_ib_8;
  const rev_mb_8 = req.body.rev_mb_8;
  const rev_ibb_8 = req.body.rev_ibb_8;
  const acc_ib_8 = req.body.acc_ib_8;
  const acc_mb_8 = req.body.acc_mb_8;
  const acc_ibb_8 = req.body.acc_ibb_8;
  const am_ib_8 = req.body.am_ib_8;
  const am_mb_8 = req.body.am_mb_8;
  const am_ibb_8 = req.body.am_ibb_8;

  const ori_ib_9 = req.body.ori_ib_9;
  const ori_mb_9 = req.body.ori_mb_9;
  const ori_ibb_9 = req.body.ori_ibb_9;
  const rev_ib_9 = req.body.rev_ib_9;
  const rev_mb_9 = req.body.rev_mb_9;
  const rev_ibb_9 = req.body.rev_ibb_9;
  const acc_ib_9 = req.body.acc_ib_9;
  const acc_mb_9 = req.body.acc_mb_9;
  const acc_ibb_9 = req.body.acc_ibb_9;
  const am_ib_9 = req.body.am_ib_9;
  const am_mb_9 = req.body.am_mb_9;
  const am_ibb_9 = req.body.am_ibb_9;

  const ori_ib_10 = req.body.ori_ib_10;
  const ori_mb_10 = req.body.ori_mb_10;
  const ori_ibb_10 = req.body.ori_ibb_10;
  const rev_ib_10 = req.body.rev_ib_10;
  const rev_mb_10 = req.body.rev_mb_10;
  const rev_ibb_10 = req.body.rev_ibb_10;
  const acc_ib_10 = req.body.acc_ib_10;
  const acc_mb_10 = req.body.acc_mb_10;
  const acc_ibb_10 = req.body.acc_ibb_10;
  const am_ib_10 = req.body.am_ib_10;
  const am_mb_10 = req.body.am_mb_10;
  const am_ibb_10 = req.body.am_ibb_10;

  const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      return sql.query("UPDATE webadmin.transfer_dana SET " +
        "pcode='"+pcode+"', description_pcode='"+description_pcode+"', trx_dec='"+trx_dec+"', channel_id='"+ channel_id +"', pcode_bv='"+ pcode_bv +"', switcher='"+switcher+"', acq='"+acq+"', trf_indicator='"+trf_indicator+"', jenis_transaksi='"+jenis_transaksi+"',"+
        "rek_debet_perantara_1='"+rek_debet_perantara_1+"', rek_credit_perantara='"+rek_credit_perantara+"', rek_debet_perantara_2='"+ rek_debet_perantara_2 +"', trx_ib_debet_1='"+trx_ib_debet_1+"', trx_mb_debet_1='"+trx_mb_debet_1+"',"+
        "trx_ibb_debet_1='"+trx_ibb_debet_1+"', trx_ib_credit='"+trx_ib_credit+"', trx_mb_credit='"+trx_mb_credit+"', trx_ibb_credit='"+trx_ibb_credit+"',"+
        "trx_ib_debet_2='"+trx_ib_debet_2+"', trx_mb_debet_2='"+trx_mb_debet_2+"', trx_ibb_debet_2='"+trx_ibb_debet_2+"', rev_ib_debet_1='"+rev_ib_debet_1+"',"+
        "rev_mb_debet_1='"+rev_mb_debet_1+"', rev_ibb_debet_1='"+rev_ibb_debet_1+"', rev_ib_credit='"+rev_ib_credit+"', rev_mb_credit='"+rev_mb_credit+"', rev_ibb_credit='"+rev_ibb_credit+"',"+
        "rev_ib_debet_2='"+rev_ib_debet_2+"', rev_mb_debet_2='"+rev_mb_debet_2+"', rev_ibb_debet_2='"+rev_ibb_debet_2+"', status=1, updated_at='"+date+"' WHERE id='"+id+"'");
    })
    .then(result => {
      sql.query("UPDATE webadmin.detail_transfer_dana SET " +
        "ori_ib_1='"+ori_ib_1+"', ori_mb_1='"+ori_mb_1+"', ori_ibb_1='"+ori_ibb_1+"', rev_ib_1='"+rev_ib_1+"', rev_mb_1='"+rev_mb_1+"', rev_ibb_1='"+rev_ibb_1+"',"+
        "acc_ib_1='"+acc_ib_1+"', acc_mb_1='"+acc_mb_1+"', acc_ibb_1='"+acc_ibb_1+"', am_ib_1='"+am_ib_1+"', am_mb_1='"+am_mb_1+"', am_ibb_1='"+am_ibb_1+"',"+ 
        "ori_ib_2='"+ori_ib_2+"', ori_mb_2='"+ori_mb_2+"', ori_ibb_2='"+ori_ibb_2+"', rev_ib_2='"+rev_ib_2+"', rev_mb_2='"+rev_mb_2+"', rev_ibb_2='"+rev_ibb_2+"',"+
        "acc_ib_2='"+acc_ib_2+"', acc_mb_2='"+acc_mb_2+"', acc_ibb_2='"+acc_ibb_2+"', am_ib_2='"+am_ib_2+"', am_mb_2='"+am_mb_2+"', am_ibb_2='"+am_ibb_2+"', ori_ib_3='"+ori_ib_3+"',"+
        "ori_mb_3='"+ori_mb_3+"', ori_ibb_3='"+ori_ibb_3+"', rev_ib_3='"+rev_ib_3+"', rev_mb_3='"+rev_mb_3+"', rev_ibb_3='"+rev_ibb_3+"', acc_ib_3='"+acc_ib_3+"',"+
        "acc_mb_3='"+acc_mb_3+"', acc_ibb_3='"+acc_ibb_3+"', am_ib_3='"+am_ib_3+"', am_mb_3='"+am_mb_3+"', am_ibb_3='"+am_ibb_3+"', ori_ib_4='"+ori_ib_4+"',"+
        "ori_mb_4='"+ori_mb_4+"', ori_ibb_4='"+ori_ibb_4+"', rev_ib_4='"+rev_ib_4+"', rev_mb_4='"+rev_mb_4+"', rev_ibb_4='"+rev_ibb_4+"', acc_ib_4='"+acc_ib_4+"',"+
        "acc_mb_4='"+acc_mb_4+"', acc_ibb_4='"+acc_ibb_4+"', am_ib_4='"+am_ib_4+"', am_mb_4='"+am_mb_4+"', am_ibb_4='"+am_ibb_4+"',"+
        "ori_ib_5='"+ori_ib_5+"', ori_mb_5='"+ori_mb_5+"', ori_ibb_5='"+ori_ibb_5+"', rev_ib_5='"+rev_ib_5+"', rev_mb_5='"+rev_mb_5+"', rev_ibb_5='"+rev_ibb_5+"', acc_ib_5='"+acc_ib_5+"',"+
        "acc_mb_5='"+acc_mb_5+"', acc_ibb_5='"+acc_ibb_5+"', am_ib_5='"+am_ib_5+"', am_mb_5='"+am_mb_5+"', am_ibb_5='"+am_ibb_5+"', "+
        "ori_ib_6='"+ori_ib_6+"', ori_mb_6='"+ori_mb_6+"', ori_ibb_6='"+ori_ibb_6+"', rev_ib_6='"+rev_ib_6+"', rev_mb_6='"+rev_mb_6+"', rev_ibb_6='"+rev_ibb_6+"', acc_ib_6='"+acc_ib_6+"',"+
        "acc_mb_6='"+acc_mb_6+"', acc_ibb_6='"+acc_ibb_6+"', am_ib_6='"+am_ib_6+"', am_mb_6='"+am_mb_6+"', am_ibb_6='"+am_ibb_6+"', "+
        "ori_ib_7='"+ori_ib_7+"', ori_mb_7='"+ori_mb_7+"', ori_ibb_7='"+ori_ibb_7+"', rev_ib_7='"+rev_ib_7+"', rev_mb_7='"+rev_mb_7+"', rev_ibb_7='"+rev_ibb_7+"', acc_ib_7='"+acc_ib_7+"',"+
        "acc_mb_7='"+acc_mb_7+"', acc_ibb_7='"+acc_ibb_7+"', am_ib_7='"+am_ib_7+"', am_mb_7='"+am_mb_7+"', am_ibb_7='"+am_ibb_7+"', "+
        "ori_ib_8='"+ori_ib_8+"', ori_mb_8='"+ori_mb_8+"', ori_ibb_8='"+ori_ibb_8+"', rev_ib_8='"+rev_ib_8+"', rev_mb_8='"+rev_mb_8+"', rev_ibb_8='"+rev_ibb_8+"', acc_ib_8='"+acc_ib_8+"',"+
        "acc_mb_8='"+acc_mb_8+"', acc_ibb_8='"+acc_ibb_8+"', am_ib_8='"+am_ib_8+"', am_mb_8='"+am_mb_8+"', am_ibb_8='"+am_ibb_8+"', "+
        "ori_ib_9='"+ori_ib_9+"', ori_mb_9='"+ori_mb_9+"', ori_ibb_9='"+ori_ibb_9+"', rev_ib_9='"+rev_ib_9+"', rev_mb_9='"+rev_mb_9+"', rev_ibb_9='"+rev_ibb_9+"', acc_ib_9='"+acc_ib_9+"',"+
        "acc_mb_9='"+acc_mb_9+"', acc_ibb_9='"+acc_ibb_9+"', am_ib_9='"+am_ib_9+"', am_mb_9='"+am_mb_9+"', am_ibb_9='"+am_ibb_9+"', "+
        "ori_ib_10='"+ori_ib_10+"', ori_mb_10='"+ori_mb_10+"', ori_ibb_10='"+ori_ibb_10+"', rev_ib_10='"+rev_ib_10+"', rev_mb_10='"+rev_mb_10+"', rev_ibb_10='"+rev_ibb_10+"', acc_ib_10='"+acc_ib_10+"',"+
        "acc_mb_10='"+acc_mb_10+"', acc_ibb_10='"+acc_ibb_10+"', am_ib_10='"+am_ib_10+"', am_mb_10='"+am_mb_10+"', am_ibb_10='"+am_ibb_10+"', "+
        "updated_at='"+date+"' WHERE transfer_dana_id='"+id+"'");

      return res.json({
        'code': 200,
        'status': 'success',
        'message' : 'Setting Transfer Dana has been edited'
      })
    })
    .catch(err => {
      logger.error(err);
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.viewTransferDana = async (req, res, next) => {
  const id = req.params.id;
  const prev = await getPrevillage(req.session.user.role_id);

  try {
    if (prev.includes(14)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 11, 'View Fee Transfer Dana');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query("SELECT td.*, dtd.ori_ib_1, dtd.ori_mb_1, dtd.ori_ibb_1, dtd.rev_ib_1, dtd.rev_mb_1, dtd.rev_ibb_1, dtd.acc_ib_1, dtd.acc_mb_1, dtd.acc_ibb_1,"+
        "dtd.am_ib_1, dtd.am_mb_1, dtd.am_ibb_1, dtd.ori_ib_2, dtd.ori_mb_2, dtd.ori_ibb_2, dtd.rev_ib_2, dtd.rev_mb_2, dtd.rev_ibb_2, dtd.acc_ib_2, dtd.acc_mb_2,"+
        "dtd.acc_ibb_2, dtd.am_ib_2, dtd.am_mb_2, dtd.am_ibb_2, dtd.ori_ib_3, dtd.ori_mb_3, dtd.ori_ibb_3, dtd.rev_ib_3, dtd.rev_mb_3, dtd.rev_ibb_3, dtd.acc_ib_3,"+ 
        "dtd.acc_mb_3, dtd.acc_ibb_3, dtd.am_ib_3, dtd.am_mb_3, dtd.am_ibb_3, dtd.ori_ib_4, dtd.ori_mb_4, dtd.ori_ibb_4, dtd.rev_ib_4, dtd.rev_mb_4, dtd.rev_ibb_4,"+
        "dtd.acc_ib_4, dtd.acc_mb_4, dtd.acc_ibb_4, dtd.am_ib_4, dtd.am_mb_4, dtd.am_ibb_4,"+ 
        "dtd.ori_ib_5, dtd.ori_mb_5, dtd.ori_ibb_5, dtd.rev_ib_5, dtd.rev_mb_5, dtd.rev_ibb_5, dtd.acc_ib_5, dtd.acc_mb_5, dtd.acc_ibb_5, dtd.am_ib_5, dtd.am_mb_5, dtd.am_ibb_5, "+
        "dtd.ori_ib_6, dtd.ori_mb_6, dtd.ori_ibb_6, dtd.rev_ib_6, dtd.rev_mb_6, dtd.rev_ibb_6, dtd.acc_ib_6, dtd.acc_mb_6, dtd.acc_ibb_6, dtd.am_ib_6, dtd.am_mb_6, dtd.am_ibb_6, "+
        "dtd.ori_ib_7, dtd.ori_mb_7, dtd.ori_ibb_7, dtd.rev_ib_7, dtd.rev_mb_7, dtd.rev_ibb_7, dtd.acc_ib_7, dtd.acc_mb_7, dtd.acc_ibb_7, dtd.am_ib_7, dtd.am_mb_7, dtd.am_ibb_7, "+
        "dtd.ori_ib_8, dtd.ori_mb_8, dtd.ori_ibb_8, dtd.rev_ib_8, dtd.rev_mb_8, dtd.rev_ibb_8, dtd.acc_ib_8, dtd.acc_mb_8, dtd.acc_ibb_8, dtd.am_ib_8, dtd.am_mb_8, dtd.am_ibb_8, "+
        "dtd.ori_ib_9, dtd.ori_mb_9, dtd.ori_ibb_9, dtd.rev_ib_9, dtd.rev_mb_9, dtd.rev_ibb_9, dtd.acc_ib_9, dtd.acc_mb_9, dtd.acc_ibb_9, dtd.am_ib_9, dtd.am_mb_9, dtd.am_ibb_9, "+
        "dtd.ori_ib_10, dtd.ori_mb_10, dtd.ori_ibb_10, dtd.rev_ib_10, dtd.rev_mb_10, dtd.rev_ibb_10, dtd.acc_ib_10, dtd.acc_mb_10, dtd.acc_ibb_10, dtd.am_ib_10, dtd.am_mb_10, dtd.am_ibb_10 "+
        "FROM webadmin.transfer_dana AS td LEFT JOIN webadmin.detail_transfer_dana AS dtd ON td.id = dtd.transfer_dana_id "+
        "WHERE td.id='"+ id +"'");
      })
      .then(result => {
        sql.query("SELECT * FROM webadmin.m_fee AS mf WHERE mf.type=2")
        .then(master => {
          res.render('fee/transfer_dana/view_transfer_dana', {
            isAuthenticated: req.session.isLoggedIn,
            sessionUser: req.session.user,
            transfer: result.recordset[0],
            master: master.recordset,
            previllage: prev,
            path: 'setting',
            subpath: 'fee'
          });
        })
        .catch(err => {
          logger.warn(err);
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
}

exports.deleteTransferDana = async (req, res, next) => {
  const id = req.params.id;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 7, 11, 'Delete Fee Transfer Dana');

    // get data by uuid
    await sql.connect(dbConfig.dbConnection())
    .then(user => {
      sql.query("DELETE FROM webadmin.transfer_dana WHERE id='" + id + "'")
      .then(result => {
        res.json({
          'code': 200,
          'status': 'success',
          'message' : 'Delete Successfully'
        })
        // res.redirect('/user');
      })
      .catch(err => {
        logger.error(err);
      });
    })
    .catch(err => {
      logger.error(err);
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.submitTransferDana = async (req, res, next) => {
  if (typeof req.query.ids === 'undefined') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Please select the data'
    })
  }

  let ids = req.query.ids.map(i=>Number(i));

  // Status
  // 1 Draf
  // 2 Submit
  // 3 Approve
  // 4 Reject
  const status = 2;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 8, 11, 'Submit Fee Transfer Dana');

    await sql.connect(dbConfig.dbConnection())
    .then(query=> {
      // check status 
      sql.query("Select td.status FROM webadmin.transfer_dana AS td WHERE td.id IN (" + ids + ")")
      .then(data => {
        const datas = data.recordset;

        // return when status === Approve
        if (datas.some(e => e.status === 3)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Approved data, please check the status if you want to Submit/Approve/Reject'
          })
        }

        // update
        sql.query("UPDATE webadmin.transfer_dana SET status='"+ status +"' WHERE id IN (" + ids + ")")
        .then(results => {
          return res.json({
            'code': 200,
            'status': 'success',
            'message' : 'Submitted data successfully'
          });
        })
        .catch(err => {
          logger.error(err);
        });
      });
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.approveTransferDana = async (req, res, next) => {
  if (typeof req.query.ids === 'undefined') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Please select the data'
    })
  }

  let ids = req.query.ids.map(i=>Number(i));

  // Status
  // 1 Draf
  // 2 Submit
  // 3 Approve
  // 4 Reject
  const status = 3;
  const approver_id = req.session.user.id;
  const approval_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 9, 11, 'Approve Fee Transfer Dana');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      sql.query("SELECT td.status, td.pcode, td.channel_id, td.switcher, td.acq, td.trf_indicator FROM webadmin.transfer_dana AS td WHERE td.id IN (" + ids + ")")
      .then(data => {
        const datas = data.recordset;

        if (datas.some(e => e.status === 1)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Draft data, please check the status if you want to Approve'
          })
        }

        if (datas.some(e => e.status === 4)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Rejected data, please check the status if you want to Approve'
          })
        }

        if (datas.some(e => e.status === 3)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Approved data, please check the status if you want to Approve'
          })
        }
        
        let pcode = datas[0].pcode;
        let channel_id = datas[0].channel_id;
        let switcher = datas[0].switcher;
        let acq = datas[0].acq;
        let trf_indicator = datas[0].trf_indicator;
        
        // update old transfer dana to 0 
        sql.query("UPDATE webadmin.transfer_dana SET new_approved = 0 WHERE pcode='"+pcode+"' AND channel_id='"+channel_id+"' AND switcher='"+switcher+"' AND acq='"+acq+"' AND trf_indicator='"+trf_indicator+"'")
        .then(result_approve => {
          // update status transfer dana to 3
          sql.query("UPDATE webadmin.transfer_dana SET status='"+ status +"', new_approved = 1, approval_id='"+ approver_id +"', approval_date='"+ approval_date +"' WHERE id IN (" + ids + ")")
          .then(results => {          
            return res.json({
              'code': 200,
              'status': 'success',
              'message' : 'Approved data successfully'
            })
          });
        });
      });
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.rejectTransferDana = async (req, res, next) => {
  if (typeof req.query.ids === 'undefined') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Please select the data'
    })
  }

  let ids = req.query.ids.map(i=>Number(i));

  // Status
  // 1 Draf
  // 2 Submit
  // 3 Approve
  // 4 Reject
  const status = 4;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 10, 11, 'Reject Fee Transfer Dana');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      // check status 
      sql.query("Select td.status FROM webadmin.transfer_dana AS td WHERE td.id IN (" + ids + ")")
      .then(data => {
        const datas = data.recordset;

        if (datas.some(e => e.status === 1)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Draft data, please check the status if you want to Reject'
          })
        }

        if (datas.some(e => e.status === 3)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Approved data, please check the status if you want to Reject'
          })
        }

        sql.query("UPDATE webadmin.transfer_dana SET status='"+ status +"' WHERE id IN (" + ids + ")")
        .then(results => {
          return res.json({
            'code': 200,
            'status': 'success',
            'message' : 'Rejected data successfully'
          })
        });
      });
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.reloadTransferDana = async (req, res, next) => {
  const pcode = req.body.pcode;

  if (pcode === '') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Pcode is required if you want to reload data'
    })
  }

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      sql.query("SELECT * FROM webadmin.transfer_dana AS td WHERE td.pcode='"+ pcode +"' AND td.status=3 AND td.new_approved = 1")
      .then(results => {
        if (results.recordset.length === 0) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : "Data with has not found",
          })
        }
        return res.json({
          'code': 200,
          'status': 'success',
          'message' : results.recordset[0],
        }) 
      })
      .catch(err => {
        logger.error(err);
      })
    });
  } catch (error) {
    logger.error(error);
  }
}

// Module Inquiry
exports.getInquiry = async (req, res, next) => {
  const prev = await getPrevillage(req.session.user.role_id);

  try {
    if (prev.includes(13)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 12, 'Setting Fee Inquiry');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query(`SELECT TOP 1000 t.id, t.request_activation, t.pcode, t.description, t.user_id, t.approval_id, t.channel_id, t.pcode_bv, t.switcher, t.acq,
        t.trf_indicator, t.approval_date, t.status, t.created_at, t.updated_at, t.new_approved, c.name AS user_created, a.name AS user_approver, m.pcode AS code
        FROM webadmin.inquiry AS t
        LEFT JOIN webadmin.users AS c ON c.id = t.user_id
        LEFT JOIN webadmin.users AS a ON a.id = t.approval_id
        LEFT JOIN webadmin.m_fee AS m ON m.id = t.pcode`);
      })
      .then(result => {
        res.render('fee/inquiry/index', {
          isAuthenticated: req.session.isLoggedIn,
          sessionUser: req.session.user,
          inquiry: result.recordset,
          previllage: prev,
          moment: moment,
          path: 'setting',
          subpath: 'inquiry'
        });
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

exports.createInquiry = async (req, res, next) => {
  const prev = await getPrevillage(req.session.user.role_id);
  
  try {
    if (prev.includes(15)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 4, 12, 'Create Fee Inquiry');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query("SELECT mf.id, mf.pcode FROM webadmin.m_fee AS mf WHERE mf.type=3 order by mf.pcode")
      })
      .then(result => {
        res.render('fee/inquiry/create_inquiry', {
          isAuthenticated: req.session.isLoggedIn,
          sessionUser: req.session.user,
          master: result.recordset,
          previllage: prev,
          path: 'setting',
          subpath: 'fee'
        });
      })
      .catch(err => {
        logger.warn(err);
      })
    } else {
      return res.redirect('/404');
    }
  } catch (error) {
    logger.error(error);
  }
};

exports.postInquiry = async (req, res, next) => {
  const status = 1;
  // const request_activation = req.body.request_activation;
  const pcode = req.body.pcode;
  const description = req.body.description;
  const format_ket = req.body.format_ket;
  const channel_id = req.body.channel_id;
  const pcode_bv = req.body.pcode_bv;
  const switcher = req.body.switcher;
  const acq = req.body.acq;
  const trf_indicator = req.body.trf_indicator;
  const acc_credit = req.body.acc_credit;
  const fee_acc_1 = req.body.fee_acc_1;
  const fee_acc_2 = req.body.fee_acc_2;
  const fee_acc_3 = req.body.fee_acc_3;
  const fee_amount_1 = req.body.fee_amount_1;
  const fee_amount_2 = req.body.fee_amount_2;
  const fee_amount_3 = req.body.fee_amount_3;

  const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      return sql
      .query("INSERT INTO webadmin.inquiry" +
        "(pcode, description, format_ket, acc_credit, channel_id, pcode_bv, switcher, acq, trf_indicator, fee_acc_1, fee_acc_2, fee_acc_3, fee_amount_1, fee_amount_2,"+
          "fee_amount_3, user_id, status, created_at)"+
          "VALUES ('"+ pcode +"','"+ description +"','"+ format_ket +"','"+ acc_credit +"','"+channel_id+"','"+pcode_bv+"','"+switcher+"','"+acq+"','"+trf_indicator+"','"+ fee_acc_1 +"','"+ fee_acc_2 +"',"
          +"'"+ fee_acc_3 +"','"+ fee_amount_1 +"','"+ fee_amount_2 +"','"+ fee_amount_3 +"','"+ req.session.user.id +"','"+ status +"','"+ date +"')");
    })
    .then(result => {
      return res.json({
        'code': 200,
        'status': 'success',
        'message' : 'Setting Inquiry has been saved'
      })
    })
    .catch(err => {
      logger.error(err);
    });
  } catch (error) {
    logger.error(error);
  }
};

exports.editInquiry = async (req, res, next) => {
  const id = req.params.id;
  const prev = await getPrevillage(req.session.user.role_id);

  try {
    if (prev.includes(16)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 12, 'Update Fee Inquiry');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query("SELECT * FROM webadmin.inquiry AS i WHERE i.id='"+ id +"'");
      })
      .then(result => {
        sql.query("SELECT mf.id, mf.pcode FROM webadmin.m_fee AS mf WHERE mf.type=3 order by mf.pcode")
        .then(master => {
          res.render('fee/inquiry/edit_inquiry', {
            isAuthenticated: req.session.isLoggedIn,
            sessionUser: req.session.user,
            inquiry: result.recordset[0],
            master: master.recordset,
            previllage: prev,
            path: 'setting',
            subpath: 'fee'
          });
        })
        .catch(err => {
          logger.warn(err);
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
}

exports.updateInquiry = async (req, res, next) => {
  const id = req.body.id;
  // const request_activation = req.body.request_activation;
  const pcode = req.body.pcode;
  const description = req.body.description;
  const format_ket = req.body.format_ket;
  const acc_credit = req.body.acc_credit;
  const channel_id = req.body.channel_id;
  const pcode_bv = req.body.pcode_bv;
  const switcher = req.body.switcher;
  const acq = req.body.acq;
  const trf_indicator = req.body.trf_indicator;
  const fee_acc_1 = req.body.fee_acc_1;
  const fee_acc_2 = req.body.fee_acc_2;
  const fee_acc_3 = req.body.fee_acc_3;
  const fee_amount_1 = req.body.fee_amount_1;
  const fee_amount_2 = req.body.fee_amount_2;
  const fee_amount_3 = req.body.fee_amount_3;

  const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      return sql
      .query("UPDATE webadmin.inquiry SET " +
        "pcode='"+pcode+"', description='"+description+"', format_ket='"+format_ket+"', channel_id='"+channel_id+"', pcode_bv='"+pcode_bv+"', switcher='"+switcher+"', acq='"+acq+"',"+
        "trf_indicator='"+trf_indicator+"', acc_credit='"+acc_credit+"', fee_acc_1='"+fee_acc_1+"', fee_acc_2='"+fee_acc_2+"', fee_acc_3='"+fee_acc_3+"',"+
        "fee_amount_1='"+fee_amount_1+"', fee_amount_2='"+fee_amount_2+"', fee_amount_3='"+fee_amount_3+"', status=1, updated_at='"+date+"' WHERE id='"+id+"'");
    })
    .then(result => {
      return res.json({
        'code': 200,
        'status': 'success',
        'message' : 'Setting Inquiry has been edited'
      })
    })
    .catch(err => {
      logger.error(err);
    })
  } catch (error) {
    logger.error(error);
  }
};

exports.reloadInquiry = async (req, res, next) => {
  const pcode = req.body.pcode;

  if (pcode === '') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Pcode is required if you want to reload data'
    })
  }

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      sql.query("SELECT * FROM webadmin.inquiry AS i WHERE i.pcode='"+ pcode +"' AND i.status=1 ORDER BY i.created_at DESC")
      .then(results => {
        if (results.recordset.length === 0) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : "Data with has not found",
          })
        }
        return res.json({
          'code': 200,
          'status': 'success',
          'message' : results.recordset[0],
        }) 
      })
      .catch(err => {
        logger.error(err);
      })
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.viewInquiry = async (req, res, next) => {
  const id = req.params.id;
  const prev = await getPrevillage(req.session.user.role_id);

  try {
    if (prev.includes(14)) {
      // send to audit trails
		  trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 12, 'View Fee Inquiry');

      await sql.connect(dbConfig.dbConnection())
      .then(query => {
        return sql.query("SELECT * FROM webadmin.inquiry AS i WHERE i.id='"+ id +"'");
      })
      .then(result => {
        sql.query("SELECT * FROM webadmin.m_fee AS mf WHERE mf.type=3")
        .then(master => {
          res.render('fee/inquiry/view_inquiry', {
            isAuthenticated: req.session.isLoggedIn,
            sessionUser: req.session.user,
            inquiry: result.recordset[0],
            master: master.recordset,
            previllage: prev,
            path: 'setting',
            subpath: 'fee'
          });
        })
        .catch(err => {
          logger.warn(err);
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
}

exports.deleteInquiry = async (req, res, next) => {
  const id = req.params.id;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 7, 12, 'Delete Fee Inquiry');

    // get data by uuid
    await sql.connect(dbConfig.dbConnection())
    .then(user => {
      sql.query("DELETE FROM webadmin.inquiry WHERE id='" + id + "'")
      .then(result => {
        res.json({
          'code': 200,
          'status': 'success',
          'message' : 'Delete Successfully'
        })
        // res.redirect('/user');
      })
      .catch(err => {
        logger.error(err);
      });
    })
    .catch(err => {
      logger.error(err);
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.submitInquiry = async (req, res, next) => {
  if (typeof req.query.ids === 'undefined') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Please select the data'
    })
  }

  let ids = req.query.ids.map(i=>Number(i));

  // Status
  // 1 Draf
  // 2 Submit
  // 3 Approve
  // 4 Reject
  const status = 2;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 8, 12, 'Submit Fee Inquiry');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      // check status 
      sql.query("Select i.status FROM webadmin.inquiry AS i WHERE i.id IN (" + ids + ")")
      .then(data => {
        const datas = data.recordset;

        // return when status === Approve
        if (datas.some(e => e.status === 3)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Approved data, please check the status if you want to Submit/Approve/Reject'
          })
        }

        // update
        sql.query("UPDATE webadmin.inquiry SET status='"+ status +"'  WHERE id IN (" + ids + ")")
        .then(results => {
          return res.json({
            'code': 200,
            'status': 'success',
            'message' : 'Submitted data successfully'
          });
        })
        .catch(err => {
          logger.error(err);
        });
      });
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.approveInquiry = async (req, res, next) => {
  if (typeof req.query.ids === 'undefined') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Please select the data'
    })
  }

  let ids = req.query.ids.map(i=>Number(i));

  // Status
  // 1 Draf
  // 2 Submit
  // 3 Approve
  // 4 Reject
  const status = 3;
  const approver_id = req.session.user.id;
  const approval_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 9, 12, 'Approve Fee Inquiry');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      sql.query("SELECT i.status, i.pcode, i.channel_id, i.switcher, i.acq, i.trf_indicator FROM webadmin.inquiry AS i WHERE i.id IN (" + ids + ")")
      .then(data => {
        const datas = data.recordset;

        if (datas.some(e => e.status === 1)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Draft data, please check the status if you want to Reject'
          })
        }

        if (datas.some(e => e.status === 4)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Rejected data, please check the status if you want to Reject'
          })
        }

        if (datas.some(e => e.status === 3)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Approved data, please check the status if you want to Reject'
          })
        }

        let pcode = datas[0].pcode;
        let channel_id = datas[0].channel_id;
        let switcher = datas[0].switcher;
        let acq = datas[0].acq;
        let trf_indicator = datas[0].trf_indicator;
        
        // update old transfer dana to 0 
        sql.query("UPDATE webadmin.inquiry SET new_approved = 0 WHERE pcode='"+pcode+"' AND channel_id='"+channel_id+"' AND switcher='"+switcher+"' AND acq='"+acq+"' AND trf_indicator='"+trf_indicator+"'")
        .then(result_approve => {
          // update status transfer dana to 3
          sql.query("UPDATE webadmin.inquiry SET status='"+ status +"', approval_id='"+ approver_id +"', approval_date='"+ approval_date +"', new_approved = 1  WHERE id IN (" + ids + ")")
          .then(results => {
            return res.json({
              'code': 200,
              'status': 'success',
              'message' : 'Approved data successfully'
            })
          });
        });
      });
    });
  } catch (error) {
    logger.error(error);
  }
}

exports.rejectInquiry = async (req, res, next) => {
  if (typeof req.query.ids === 'undefined') {
    return res.json({
      'code': 500,
      'status': 'error',
      'message' : 'Please select the data'
    })
  }

  let ids = req.query.ids.map(i=>Number(i));

  // Status
  // 1 Draf
  // 2 Submit
  // 3 Approve
  // 4 Reject
  const status = 4;

  try {
    // send to audit trails
    trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 10, 12, 'Reject Fee Inquiry');

    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      // check status 
      sql.query("SELECT i.status FROM webadmin.inquiry AS i WHERE i.id IN (" + ids + ")")
      .then(data => {
        const datas = data.recordset;

        if (datas.some(e => e.status === 1)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Draft data, please check the status if you want to Reject'
          })
        }

        if (datas.some(e => e.status === 3)) {
          return res.json({
            'code': 500,
            'status': 'error',
            'message' : 'There are Approved data, please check the status if you want to Reject'
          })
        }

        sql.query("UPDATE webadmin.inquiry SET status='"+ status +"' WHERE id IN (" + ids + ")")
        .then(results => {
          return res.json({
            'code': 200,
            'status': 'success',
            'message' : 'Rejected data successfully'
          })
        })
      });
    });
  } catch (error) {
    logger.error(error);
  }
}

// Global functions
exports.selectMaster = async (req, res, next) => {
  const id = req.params.id;

  try {
    await sql.connect(dbConfig.dbConnection())
    .then(query => {
      return sql.query("SELECT mf.pcode, mf.biller_code, mf.product_type, mf.product_code, mf.transactions FROM webadmin.m_fee AS mf WHERE mf.id='"+ id +"'");
    })
    .then(result => {
      return res.json({
        'code': 200,
        'status': 'success',
        'message' : result.recordset[0],
      }) 
    })
    .catch(err => {
      logger.error(err); 
    })
  } catch (error) {
    logger.error(error); 
  }
}