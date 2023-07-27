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

// check if data exist in purchase and bill
async function checkPurchase(id){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT * FROM webadmin.purchase_bill AS pb WHERE pb.transactions='"+ id +"'" ,function(err, results){
			if (results.recordset.length > 0) {
				resolve(true);
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

// check if data exist in transfer dana
async function checkTransfer(id){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT * FROM webadmin.transfer_dana td WHERE td.jns_transaction='"+ id +"'" ,function(err, results){
			if (results.recordset.length > 0) {
				resolve(true);
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

// check if data exist in transfer dana
async function checkInquiry(id){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT * FROM webadmin.inquiry AS i WHERE i.pcode='"+ id +"'" ,function(err, results){
			if (results.recordset.length > 0) {
				resolve(true);
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

// Master Purchase and Bill
exports.getIndex = async (req, res, next) => {
	const prev = await getPrevillage(req.session.user.role_id);
	const id = req.session.user.id;
	const role_id = req.session.user.role_id;

  try {
		if (prev.includes(9)) {
			// send to audit trails
			trails.trails(id, role_id, req.socket.localAddress, 11, 7, 'Master Fee Purchase and Bill');

			await sql.connect(dbConfig.dbConnection())
			.then(query => {
				sql.query(`SELECT TOP 1000 mf.id, mf.type, mf.transactions, mf.pcode, mf.biller_code, mf.product_type, mf.product_code, mf.descriptions,
				mf.created_at, mf.updated_at FROM webadmin.m_fee AS mf WHERE mf.type=1`)
				.then(result => {
					res.render('master/fee/purchase_bill/index', {
						isAuthenticated: req.session.isLoggedIn,
						sessionUser: req.session.user,
						m_fee: result.recordset,
						previllage: prev,
						path: 'setting',
						subpath: 'master-fee'
					});
				})
				.catch(err => {
					logger.warn(err)
				})
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

exports.postMasterFee = async (req, res, next) => {
	const type = 1;
  const transactions = req.body.transactions;
	const pcode = req.body.pcode;
	const biller_code = req.body.biller_code;
	const product_code = req.body.product_code;
	const product_type = req.body.product_type;
	const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

	if (!transactions || !pcode || !biller_code || !product_code || !product_type) {
		return res.json({
			'code': 500,
			'label': 'Error',
			'status': 'error',
			'message' : 'all input required' 
		})
	}

	if (pcode.length < 6) {
		return res.json({
			'code': 500,
			'label': 'Error',
			'status': 'error',
			'message' : 'Minimum length pcode is 6' 
		})
	}

	if (biller_code.length < 4 || product_code.length < 4 || product_type.length < 4) {
		return res.json({
			'code': 500,
			'label': 'Error',
			'status': 'error',
			'message' : 'Minimum length biller code, product code and product type is 4' 
		})
	}

	try {
		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 4, 7, 'Create Purchase and Bill');

		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query("SELECT * FROM webadmin.m_fee AS mf WHERE mf.pcode='"+pcode+"' AND mf.biller_code='"+biller_code+"' AND mf.product_code='"+product_code+"' AND mf.product_type='"+product_type+"'")
			.then(results => {
				if (results.recordset.length > 0) {
					return res.json({
						'code': 500,
						'label': 'Error',
						'status': 'error',
						'message' : pcode + ' ' + biller_code + ' ' + product_code + ' ' + product_type + ' has been exists' 
					})
				}

				sql.query("INSERT INTO webadmin.m_fee (type, transactions, pcode, biller_code, product_type, product_code, created_at) "+
				"VALUES('"+type+"', '"+transactions+"', '"+pcode+"', '"+biller_code+"', '"+product_type+"', '"+product_code+"', '"+date+"')")
				.then(result => {
					return res.json({
						'code': 200,
						'label': 'Success',
						'status': 'success',
						'message' : 'Master Fee has been created'
					})
				})
				.catch(err => {
					logger.warn(err);
				})
			})
			.catch(err => {
				logger.warn(err);
			})
		}) 
		.catch(err => {
			logger.warn(err);
		})
	} catch (error) {
		logger.error(error);
	}
}

exports.editMasterFee = async (req, res, next) => {
	const id = req.params.id;

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query("SELECT * FROM webadmin.m_fee AS mf WHERE mf.id='"+id+"'")
			.then(result => {
				const id = result.recordset[0].id;
				const transactions = result.recordset[0].transactions;
				const pcode = result.recordset[0].pcode;
				const biller_code = result.recordset[0].biller_code;
				const product_type = result.recordset[0].product_type;
				const product_code = result.recordset[0].product_code;

				res.render('master/fee/purchase_bill/edit_master_fee', {
					id:id,
					transactions:transactions,
					pcode:pcode,
					biller_code:biller_code,
					product_type:product_type,
					product_code:product_code
				});
			})
		})
	} catch (error) {
		logger.error(error);
	}
}

exports.updateMasterFee = async (req, res, next) => {
	const id = req.body.id;
  const transactions = req.body.transactions;
	const pcode = req.body.pcode;
	const biller_code = req.body.biller_code;
	const product_code = req.body.product_code;
	const product_type = req.body.product_type;
	const code = req.body.pcode + '-' + req.body.biller_code + '-' + req.body.product_type + '-' + req.body.product_code;
	const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

	try {
		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 7, 'Update Purchase and Bill');

		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			// check code exist in purchase and bill
			sql.query("SELECT * FROM webadmin.purchase_bill AS pb WHERE pb.transactions = '"+ id +"'")
			.then(check => {
				if (check.recordset.length > 0) {
					return res.json({
						'code': 500,
						'label': 'Error',
						'status': 'error',
						'message' : 'This data has been used in Purchase and Bill' 
					});
				} 
				
				sql.query("UPDATE webadmin.m_fee SET transactions='"+transactions+"', pcode='"+pcode+"', biller_code='"+biller_code+"', product_type='"+product_type+"', product_code='"+product_code+"', updated_at='"+date+"' "+
					"WHERE id='"+id+"'")
				.then(result => {
					return res.json({
						'code': 200,
						'label': 'Success',
						'status': 'success',
						'message' : 'Data has been updated' 
					})	
				})
				.catch(err => {
					logger.warn(err);
				})			
			})
		}) 
		.catch(err => {
			logger.warn(err);
		})
	} catch (error) {
		logger.error(error);
	}
}

exports.deleteMasterFee = async (req, res, next) => {
  const id = req.params.id;
	const check = await checkPurchase(id);

	if (check) {
		return res.json({
			'code': 500,
			'status': 'error',
			'message' : 'Data has been used in setting fee'
		});
	}

  try {
		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 7, 7, 'Delete Purchase and Bill');

    // get data by uuid
    await sql.connect(dbConfig.dbConnection())
    .then(user => {
      sql.query("DELETE FROM webadmin.m_fee WHERE id='" + id + "'")
      .then(result => {
        res.json({
          'code': 200,
          'status': 'success',
          'message' : 'Delete Successfully'
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
}

// Master Transafer Dana
exports.getIndexTransfer = async (req, res, next) => {
	const prev = await getPrevillage(req.session.user.role_id);

	try {
		if (prev.includes(9)) {
			// send to audit trails
			trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 8, 'Master Fee Transafer Dana');

			await sql.connect(dbConfig.dbConnection())
				.then(query => {
					sql.query(`SELECT TOP 1000 mf.id, mf.type, mf.transactions, mf.pcode, mf.created_at, mf.updated_at FROM webadmin.m_fee AS mf WHERE mf.type=2`)
					.then(result => {
						res.render('master/fee/transfer_dana/index', {
						isAuthenticated: req.session.isLoggedIn,
						sessionUser: req.session.user,
						previllageUser: req.session.previllage,
						m_fee: result.recordset,
						previllage: prev,
						path: 'setting',
						subpath: 'master-transfer'
					});
				})
				.catch(err => {
					logger.warn(err)
				})
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
  
exports.postMasterTransfer = async (req, res, next) => {
	const type = 2;
	const transactions = req.body.transactions;
	const pcode = req.body.pcode;
	const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

	if (!transactions || !pcode) {
		return res.json({
			'code': 500,
			'label': 'Error',
			'status': 'error',
			'message' : 'all input required' 
		})
	}

	if (pcode.length < 6) {
		return res.json({
			'code': 500,
			'label': 'Error',
			'status': 'error',
			'message' : 'Minimum length pcode is 6' 
		})
	}
  
	try {
		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 4, 8, 'Create Fee Transafer Dana');

		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query("SELECT * FROM webadmin.m_fee AS mf WHERE mf.pcode='"+pcode+"' AND mf.type=2")
			.then(results => {
				if (results.recordset.length > 0) {
					return res.json({
						'code': 500,
						'label': 'Error',
						'status': 'error',
						'message' : pcode + ' has been exists' 
					})
				}
  
				sql.query("INSERT INTO webadmin.m_fee (type, transactions, pcode, created_at) "+
				"VALUES('"+type+"', '"+transactions+"', '"+pcode+"', '"+date+"')")
				.then(result => {
					return res.json({
						'code': 200,
						'label': 'Success',
						'status': 'success',
						'message' : 'Master Transfer Dana has been created'
					})
				})
				.catch(err => {
					logger.warn(err);
				})
			})
			.catch(err => {
				logger.warn(err);
			})
		}) 
		.catch(err => {
			logger.warn(err);
		})
	} catch (error) {
		logger.error(error);
	}
}
  
exports.editMasterTransfer = async (req, res, next) => {
	const id = req.params.id;
  
	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query("SELECT * FROM webadmin.m_fee AS mf WHERE mf.id='"+id+"'")
			.then(result => {
				const id = result.recordset[0].id;
				const transactions = result.recordset[0].transactions;
				const pcode = result.recordset[0].pcode;
  
				res.render('master/fee/transfer_dana/edit_transfer_dana', {
					id:id,
					transactions:transactions,
					pcode:pcode
				});
			})
		})
	} catch (error) {
		logger.error(error);
	}
}
  
exports.updateMasterTransfer = async (req, res, next) => {
	const id = req.body.id;
	const transactions = req.body.transactions;
	const pcode = req.body.pcode;
	const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  
	try {
		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 8, 'Create Fee Transafer Dana');

		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query("SELECT * FROM webadmin.transfer_dana AS td where td.jns_transaction = '"+id+"'")
			.then(check => {
				if (check.recordset.length > 0) {
					return res.json({
						'code': 500,
						'label': 'Error',
						'status': 'error',
						'message' : 'This data has been used in Transfer Dana' 
					});
				} 
				
				sql.query("UPDATE webadmin.m_fee SET transactions='"+transactions+"', pcode='"+pcode+"', updated_at='"+date+"' WHERE id='"+id+"'")
				.then(result => {
					return res.json({
						'code': 200,
						'label': 'Success',
						'status': 'success',
						'message' : 'Data has been updated' 
					})	
				})
				.catch(err => {
					logger.warn(err);
				})
			})
		}) 
		.catch(err => {
			logger.warn(err);
		})
	} catch (error) {
		logger.error(error);
	}
}
  
exports.deleteMasterTransfer = async (req, res, next) => {
	const id = req.params.id;
	const check = await checkTransfer(id);

	if (check) {
		return res.json({
			'code': 500,
			'status': 'error',
			'message' : 'Data has been used in setting fee'
		});
	}
  
	try {
		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 7, 8, 'Create Fee Transafer Dana');

	  // get data by uuid
	  await sql.connect(dbConfig.dbConnection())
	  .then(user => {
		sql.query("DELETE FROM webadmin.m_fee WHERE id='" + id + "'")
		.then(result => {
		  res.json({
			'code': 200,
			'status': 'success',
			'message' : 'Delete Successfully'
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
}

// Master Inquiry
exports.getIndexInquiry = async (req, res, next) => {
	const prev = await getPrevillage(req.session.user.role_id);

	try {	
		if (prev.includes(9)) {
			// send to audit trails
			trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 11, 9, 'Master Fee Inquiry');

			await sql.connect(dbConfig.dbConnection())
		  .then(query => {
			  sql.query(`SELECT TOP 1000 mf.id, mf.type, mf.pcode, mf.transactions, mf.created_at, mf.updated_at FROM webadmin.m_fee AS mf WHERE mf.type=3`)
			  .then(result => {
				  res.render('master/fee/inquiry/index', {
					  isAuthenticated: req.session.isLoggedIn,
					  sessionUser: req.session.user,
					  previllageUser: req.session.previllage,
					  m_fee: result.recordset,
						previllage: prev,
					  path: 'setting',
					  subpath: 'master-inquiry'
				  });
			  })
			  .catch(err => {
				  logger.warn(err)
			  })
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
  
exports.postMasterInquiry = async (req, res, next) => {
	const type = 3;
	const descriptions = req.body.descriptions;
	const pcode = req.body.pcode;
	const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

	if (!pcode || !descriptions) {
		return res.json({
			'code': 500,
			'label': 'Error',
			'status': 'error',
			'message' : 'all input required' 
		})
	}

	if (pcode.length < 6) {
		return res.json({
			'code': 500,
			'label': 'Error',
			'status': 'error',
			'message' : 'Minimum length pcode is 6' 
		})
	}
  
	try {
		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 4, 9, 'Create Fee Inquiry');

		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query("SELECT * FROM webadmin.m_fee AS mf WHERE mf.pcode='"+pcode+"' AND mf.type=3")
			.then(results => {
				if (results.recordset.length > 0) {
					return res.json({
						'code': 500,
						'label': 'Error',
						'status': 'error',
						'message' : pcode + ' has been exists' 
					})
				}
  
				sql.query("INSERT INTO webadmin.m_fee (type, pcode, transactions, created_at) "+
				"VALUES('"+type+"', '"+pcode+"', '"+descriptions+"', '"+date+"')")
				.then(result => {
					return res.json({
						'code': 200,
						'label': 'Success',
						'status': 'success',
						'message' : 'Master Inquiry has been created'
					})
				})
				.catch(err => {
					logger.warn(err);
				})
			})
			.catch(err => {
				logger.warn(err);
			})
		}) 
		.catch(err => {
			logger.warn(err);
		})
	} catch (error) {
		logger.error(error);
	}
}
  
exports.editMasterInquiry = async (req, res, next) => {
	const id = req.params.id;

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query("SELECT * FROM webadmin.m_fee AS mf WHERE mf.id='"+id+"'")
			.then(result => {
				const id = result.recordset[0].id;
				const descriptions = result.recordset[0].transactions;
				const pcode = result.recordset[0].pcode;
  
				res.render('master/fee/inquiry/edit_inquiry', {
					id:id,
					descriptions:descriptions,
					pcode:pcode
				});
			})
		})
	} catch (error) {
		logger.error(error);
	}
}
  
exports.updateMasterInquiry = async (req, res, next) => {
	const id = req.body.id;
	const descriptions = req.body.descriptions;
	const pcode = req.body.pcode;
	const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

	try {
		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 9, 'Update Master Fee Inquiry');

		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query("SELECT * FROM webadmin.inquiry AS i where i.pcode = '"+ id +"'")
			.then(check => {
				if (check.recordset.length > 0) {
					return res.json({
						'code': 500,
						'label': 'Error',
						'status': 'error',
						'message' : 'This data has been used in Inquiry' 
					});
				}
				
				sql.query("UPDATE webadmin.m_fee SET transactions='"+descriptions+"', pcode='"+pcode+"', updated_at='"+date+"' WHERE id='"+id+"'")
				.then(result => {
					return res.json({
						'code': 200,
						'label': 'Success',
						'status': 'success',
						'message' : 'Data has been updated' 
					})
				})
				.catch(err => {
					logger.warn(err);
				})
			})
		}) 
		.catch(err => {
			logger.warn(err);
		})
	} catch (error) {
		logger.error(error);
	}
}
  
exports.deleteMasterInquiry = async (req, res, next) => {
	const id = req.params.id;
	const check = await checkInquiry(id);

	if (check) {
		return res.json({
			'code': 500,
			'status': 'error',
			'message' : 'Data has been used in setting fee'
		});
	}
  
	try {
		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 7, 9, 'Delete Master Fee Inquiry');

	  // get data by uuid
	  await sql.connect(dbConfig.dbConnection())
	  .then(user => {
		sql.query("DELETE FROM webadmin.m_fee WHERE id='" + id + "'")
			.then(result => {
				res.json({
				'code': 200,
				'status': 'success',
				'message' : 'Delete Successfully'
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
}