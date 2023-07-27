'use strict'

const sql = require('mssql');
const dbConfig = require('../utils/database');
const moment = require('moment');
const logger = require('../utils/logger');
const trails = require('../utils/trails');
const { response } = require('express');
const store = require('store');

// Global variable
var date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

async function getPrevillage(role_id) {
	try {
		return new Promise((resolve, reject) => {
			sql.connect(dbConfig.dbConnection())
				.then(query => {
					sql.query("SELECT previllage FROM webadmin.previllages WHERE role_id='" + role_id + "'", function (err, results) {
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

// get purchase and bill for dropdown options
async function getPurchaseBill() {
	try {
		return new Promise((resolve, reject) => {
			sql.connect(dbConfig.dbConnection())
				.then(query => {
					sql.query(`SELECT pb1.id, mf.id AS transactions_id, mf.transactions AS transactions, pb1.approval_date 
					FROM webadmin.purchase_bill pb1
					JOIN (SELECT transactions, MAX(approval_date) approval_date FROM webadmin.purchase_bill GROUP BY transactions) pb2 
					ON pb1.transactions = pb2.transactions AND pb1.approval_date = pb2.approval_date
					JOIN webadmin.m_fee mf ON mf.id = pb1.transactions 
					WHERE pb1.status = 3;`, function (err, results) {
						resolve(results.recordset)
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

// get transafer dana for dropdown options
async function getTransferDana() {
	try {
		return new Promise((resolve, reject) => {
			sql.connect(dbConfig.dbConnection())
				.then(query => {
					sql.query(`SELECT td.id, mf.id AS transactions_id, mf.transactions AS transactions, td.approval_date 
					FROM webadmin.transfer_dana td
					JOIN (SELECT description_pcode, MAX(approval_date) approval_date FROM webadmin.transfer_dana GROUP BY description_pcode) td1 
					ON td.description_pcode  = td1.description_pcode AND td .approval_date = td1.approval_date
					JOIN webadmin.m_fee mf ON mf.id = td.description_pcode 
					WHERE td.status = 3;`, function (err, results) {
						resolve(results.recordset)
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

// get transafer dana for dropdown options
async function getInquiry() {
	try {
		return new Promise((resolve, reject) => {
			sql.connect(dbConfig.dbConnection())
				.then(query => {
					sql.query(`SELECT i.id, mf.id AS transactions_id, mf.transactions AS transactions, i.approval_date 
					FROM webadmin.inquiry i
					JOIN (SELECT pcode, MAX(approval_date) approval_date FROM webadmin.inquiry GROUP BY pcode) i1 
					ON i.pcode = i1.pcode AND i.approval_date = i1.approval_date
					JOIN webadmin.m_fee mf ON mf.id = i.pcode 
					WHERE i.status = 3;`, function (err, results) {
						resolve(results.recordset)
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

// get master plan product
async function getPlanProduct() {
	try {
		return new Promise((resolve, reject) => {
			sql.connect(dbConfig.dbConnection())
				.then(query => {
					sql.query(`SELECT pp.id, pp.plan_code, pp.plan_desc FROM webadmin.plan_product pp`, function (err, results) {
						resolve(results.recordset)
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

// get detail campaign on bording
async function getDetailCampaignOnBoarding(id) {
	try {
		return new Promise((resolve, reject) => {
			sql.connect(dbConfig.dbConnection())
				.then(query => {
					sql.query("SELECT * FROM webadmin.campaign_online_boarding WHERE campaign_header='"+id+"'", function (err, results) {
						resolve(results.recordset)
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

// get detail campaign by aum
async function getDetailCampaignByAum(id) {
	try {
		return new Promise((resolve, reject) => {
			sql.connect(dbConfig.dbConnection())
				.then(query => {
					sql.query("SELECT * FROM webadmin.campaign_by_total_aum WHERE campaign_header='"+id+"'", function (err, results) {
						resolve(results.recordset)
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

// get detail campain by plan product
async function getDetailCampaignByPlanProduct(id) {
	try {
		return new Promise((resolve, reject) => {
			sql.connect(dbConfig.dbConnection())
				.then(query => {
					sql.query("SELECT * FROM webadmin.campaign_by_plan_product WHERE campaign_header='"+id+"'", function (err, results) {
						resolve(results.recordset)
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
	// remove local store data
	store.remove('list_coob');
	store.remove('list_product');
	
	try {
		const prev = await getPrevillage(req.session.user.role_id);
		await sql.connect(dbConfig.dbConnection())
			.then(query => {
				var q = "SELECT TOP 1000 p.id, p.request_activation, p.group_trx, m.transactions AS transactions, p.start_periode, p.end_periode, p.user_id," +
				"p.approval_id, p.approval_date, p.status, p.created_at, c.name AS user_created, a.name AS user_approver, m.transactions AS transaksi " +
				"FROM webadmin.campaign AS p " +
				"LEFT JOIN webadmin.users AS c ON c.id = p.user_id " +
				"LEFT JOIN webadmin.users AS a ON a.id = p.approval_id "+
				"LEFT JOIN webadmin.m_fee AS m ON m.id = p.transactions";

				return sql.query(q);
			})
			.then(result => {
				res.render('campaign/index', {
					isAuthenticated: req.session.isLoggedIn,
					sessionUser: req.session.user,
					campaign: result.recordset,
					previllage: prev,
					moment: moment,
					path: 'campaign',
					subpath: 'campaign',
				});
			})
			.catch(err => {
				logger.error(err);
			});
	} catch (error) {
		logger.error(error);
	}
};

//
exports.getCampaign = async (req, res) => {
	const prev = await getPrevillage(req.session.user.role_id);
	const purchase = await getPurchaseBill();
	const transfer_dana = await getTransferDana();
	const inquiry = await getInquiry();
	const plan_product = await getPlanProduct();

	try {
		if (prev.includes(27)) {
			// send to audit trails
			trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 4, 10, 'Campaign');

			await sql.connect(dbConfig.dbConnection())
				.then(result => {
					res.render('campaign/create-campaign', {
						isAuthenticated: req.session.isLoggedIn,
						sessionUser: req.session.user,
						campaign: result.recordset,
						previllage: prev,
						purchase: purchase,
						transfer_dana: transfer_dana,
						inquiry: inquiry,
						plan_product: plan_product,
						path: 'campaign',
						subpath: 'campaign',
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

//post campaign:
exports.postCampaign = async (req, res, next) => {
	const transactions = req.body.transaction;
	const group_trx = req.body.group_trx;
	const start_periode = req.body.start_periode;
	const end_periode = req.body.end_periode;

	const open_account = JSON.parse(req.body.open_account);
    const plan_code = JSON.parse(req.body.plan_code);
    const plan_desc = JSON.parse(req.body.plan_desc);
    const durations = JSON.parse(req.body.durations);
    const min_trx = JSON.parse(req.body.min_trx);
    const max_trx = JSON.parse(req.body.max_trx);
    const qty_trx = JSON.parse(req.body.qty_trx);
    const ib = JSON.parse(req.body.ib);
    const mb = JSON.parse(req.body.mb);
    const ibb = JSON.parse(req.body.ibb);

    const options = req.body.options;

    const start_range_saldo_aum = JSON.parse(req.body.start_range_saldo_aum);
    const end_range_saldo_aum = JSON.parse(req.body.end_range_saldo_aum);
    const min_trx_aum = JSON.parse(req.body.min_trx_aum);
    const max_trx_aum = JSON.parse(req.body.max_trx_aum);
    const qty_trx_aum = JSON.parse(req.body.qty_trx_aum);
    const ib_aum = JSON.parse(req.body.ib_aum);
    const mb_aum = JSON.parse(req.body.mb_aum);
    const ibb_aum = JSON.parse(req.body.ibb_aum);

    const open_account_product = JSON.parse(req.body.open_account_product);
    const plan_code_product = JSON.parse(req.body.plan_code_product);
    const plan_desc_product = JSON.parse(req.body.plan_desc_product);
    const min_trx_product = JSON.parse(req.body.min_trx_product);
    const max_trx_product = JSON.parse(req.body.max_trx_product);
    const qty_trx_product = JSON.parse(req.body.qty_trx_product);
    const ib_product = JSON.parse(req.body.ib_product);
    const mb_product = JSON.parse(req.body.mb_product);
    const ibb_product = JSON.parse(req.body.ibb_product);
	
    const fee_adm_nasabah = req.body.fee_adm_nasabah;
    const fee_adm_subsidi = req.body.fee_adm_subsidi;
    const total_fee_adm = req.body.total_fee_adm;

    const nasabah_kotran_ori = req.body.nasabah_kotran_ori;
    const subsidi_kotran_ori = req.body.subsidi_kotran_ori; 
    const total_kotran_ori = req.body.total_kotran_ori;

    const nasabah_kotran_rev = req.body.nasabah_kotran_rev;
    const subsidi_kotran_rev = req.body.subsidi_kotran_rev;
    const total_kotran_rev = req.body.total_kotran_rev;

    const account_admin = req.body.account_admin;
    const account_subsidi_bank = req.body.account_subsidi_bank;
    const rek_number_penampung = req.body.rek_number_penampung;

	const status = 1;
	const created_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

	console.log(req.body);
	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query("INSERT INTO webadmin.campaign" +
					"(group_trx, transactions, start_periode, end_periode, options, fee_adm_nasabah," +
					"fee_adm_subsidi, total_fee_adm, nasabah_kotran_ori, subsidi_kotran_ori, total_kotran_ori, nasabah_kotran_rev," +
					"subsidi_kotran_rev, total_kotran_rev, account_admin, account_subsidi_bank, rek_number_penampung, status, user_id, created_at )" +
					"VALUES('" + group_trx + "','" + transactions + "','" + start_periode + "','" + end_periode + "','" +
					options + "','" + fee_adm_nasabah + "','" + fee_adm_subsidi + "','" + total_fee_adm + "','" + nasabah_kotran_ori + "','" + subsidi_kotran_ori + "','" +
					total_kotran_ori + "','" + nasabah_kotran_rev + "','" + subsidi_kotran_rev + "','" + total_kotran_rev + "','" + account_admin + "','" +
					account_subsidi_bank + "','" + rek_number_penampung + "','" + status + "','" + req.session.user.id + "','"+
					created_at + "' );SELECT SCOPE_IDENTITY() AS id")

		.then(result => {
			var campaign_id = result.recordset[0].id;

			if (open_account.length > 0){
				for (let i = 0; i < open_account.length; i++) {
					sql.query("INSERT INTO webadmin.campaign_online_boarding"+
						"(campaign_header, open_account, plan_code, plan_desc, durations, min_trx, max_trx, qty_trx, ib, mb, ibb, created_at)"+
						"VALUES('"+campaign_id+"','"+open_account[i]+"','"+plan_code[i]+"','"+plan_desc[i]+"','"+durations[i]+"','"+min_trx[i]+"','"+max_trx[i]+"','"+qty_trx[i]+"','"+ib[i]+"','"+mb[i]+"','"+ibb[i]+"','"+created_at+"' )");
				}
			}

			if(start_range_saldo_aum.length > 0 ){
				for (let x = 0; x < start_range_saldo_aum.length; x++){
					sql.query("INSERT INTO webadmin.campaign_by_total_aum"+
						"(campaign_header, start_range_saldo_aum, end_range_saldo_aum, min_trx_aum, max_trx_aum, qty_trx_aum, ib, mb, ibb, created_at)"+
						"VALUES('"+campaign_id+"','"+start_range_saldo_aum[x]+"','"+end_range_saldo_aum[x]+"','"+min_trx_aum[x]+"','"+max_trx_aum[x]+"','"+qty_trx_aum[x]+"','"+ib_aum[x]+"','"+mb_aum[x]+"','"+ibb_aum[x]+"','"+created_at+"')");
				}
			}

			if(open_account_product.length > 0 ){
				for (let z = 0; z < open_account_product.length; z++) {
					sql.query("INSERT INTO webadmin.campaign_by_plan_product"+
						"(campaign_header, open_account_product, plan_code_product, plan_desc_product, min_trx_product, max_trx_product, qty_trx_product, ib, mb, ibb, created_at)"+
						"VALUES('"+campaign_id+"','"+open_account_product[z]+"','"+plan_code_product[z]+"','"+plan_desc_product[z]+"','"+min_trx_product[z]+"','"+max_trx_product[z]+"','"+qty_trx_product[z]+"','"+ib_product[z]+"','"+mb_product[z]+"','"+ibb_product[z]+"','"+created_at+"')");
				}
			}
				
			return res.json({
				'code': 200,
				'label': 'Success',
				'status': 'success',
				'message': 'Campaign has been created'
			})
		})
		.catch(err => {
			logger.error(err);
		})
		})		
	} catch (error) {
		logger.error(error);
	}
};

//get data campaign
exports.editCampaign = async (req, res, next) => {
	const id = req.params.id;
	const prev = await getPrevillage(req.session.user.role_id);
	const purchase = await getPurchaseBill();
	const transfer_dana = await getTransferDana();
	const inquiry = await getInquiry();
	const plan_product = await getPlanProduct();
	const campaign_on_bording = await getDetailCampaignOnBoarding(id);
	const campaign_aum = await getDetailCampaignByAum(id);
	const campaign_plan_product = await getDetailCampaignByPlanProduct(id);

	try {
		if (prev.includes(16)) {
			// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 12, 'Update Campaign');
  
		await sql.connect(dbConfig.dbConnection())
			.then(query => {		
				sql.query("SELECT * FROM webadmin.campaign AS p WHERE p.id='"+id+"'")
				.then(result => {
					// remove the list before
					store.remove('list_coob');
					store.remove('list_product');
					
					if(campaign_on_bording.length > 0){
						var arrayData = store.get('list_coob') === undefined ? [] : store.get('list_coob');
						for (let i = 0; i < campaign_on_bording.length; i++) {
							const element = campaign_on_bording[i].plan_desc;
							arrayData.push(element);
						}
						// set to localstorage
						store.set('list_coob', arrayData);
					}

					if(campaign_plan_product.length > 0){
						var arrayData = store.get('list_product') === undefined ? [] : store.get('list_product');
						for (let i = 0; i < campaign_plan_product.length; i++) {
							const element = campaign_plan_product[i].plan_desc;
							arrayData.push(element);
						}
						// set to localstorage
						store.set('list_product', arrayData);
					}

					res.render('campaign/edit_campaign', {
						isAuthenticated: req.session.isLoggedIn,
						sessionUser: req.session.user,
						purchase: purchase,
						transfer_dana: transfer_dana,
						inquiry: inquiry,
						plan_product: plan_product,
						previllage: prev,
						data: result.recordset[0],
						cob: campaign_on_bording,
						caum: campaign_aum,
						cpp: campaign_plan_product,
						localStore: store.get('list'),
						moment: moment,
						path: 'campaign',
						subpath: 'campaign'
					});
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
}

//update data campaign
exports.updateCampaign = async (req, res, next) => {
	const id = req.body.id;
	const transactions = req.body.transaction;
	const group_trx = req.body.group_trx;
	const start_periode = req.body.start_periode;
	const end_periode = req.body.end_periode;

	const open_account = JSON.parse(req.body.open_account);
    const plan_code = JSON.parse(req.body.plan_code);
    const plan_desc = JSON.parse(req.body.plan_desc);
    const durations = JSON.parse(req.body.durations);
    const min_trx = JSON.parse(req.body.min_trx);
    const max_trx = JSON.parse(req.body.max_trx);
    const qty_trx = JSON.parse(req.body.qty_trx);
    const ib = JSON.parse(req.body.ib);
    const mb = JSON.parse(req.body.mb);
    const ibb = JSON.parse(req.body.ibb);

    const options = req.body.options;

    const start_range_saldo_aum = JSON.parse(req.body.start_range_saldo_aum);
    const end_range_saldo_aum = JSON.parse(req.body.end_range_saldo_aum);
    const min_trx_aum = JSON.parse(req.body.min_trx_aum);
    const max_trx_aum = JSON.parse(req.body.max_trx_aum);
    const qty_trx_aum = JSON.parse(req.body.qty_trx_aum);
    const ib_aum = JSON.parse(req.body.ib_aum);
    const mb_aum = JSON.parse(req.body.mb_aum);
    const ibb_aum = JSON.parse(req.body.ibb_aum);

    const open_account_product = JSON.parse(req.body.open_account_product);
    const plan_code_product = JSON.parse(req.body.plan_code_product);
    const plan_desc_product = JSON.parse(req.body.plan_desc_product);
    const min_trx_product = JSON.parse(req.body.min_trx_product);
    const max_trx_product = JSON.parse(req.body.max_trx_product);
    const qty_trx_product = JSON.parse(req.body.qty_trx_product);
    const ib_product = JSON.parse(req.body.ib_product);
    const mb_product = JSON.parse(req.body.mb_product);
    const ibb_product = JSON.parse(req.body.ibb_product);
	
    const fee_adm_nasabah = req.body.fee_adm_nasabah;
    const fee_adm_subsidi = req.body.fee_adm_subsidi;
    const total_fee_adm = req.body.total_fee_adm;

    const nasabah_kotran_ori = req.body.nasabah_kotran_ori;
    const subsidi_kotran_ori = req.body.subsidi_kotran_ori; 
    const total_kotran_ori = req.body.total_kotran_ori;

    const nasabah_kotran_rev = req.body.nasabah_kotran_rev;
    const subsidi_kotran_rev = req.body.subsidi_kotran_rev;
    const total_kotran_rev = req.body.total_kotran_rev;

    const account_admin = req.body.account_admin;
    const account_subsidi_bank = req.body.account_subsidi_bank;
    const rek_number_penampung = req.body.rek_number_penampung;

	const updated_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query("UPDATE webadmin.campaign SET group_trx='"+group_trx+"', transactions='"+transactions+"', "+
			"start_periode='"+start_periode+"', end_periode='"+end_periode+"', options='"+options+"', fee_adm_nasabah='"+fee_adm_nasabah+"', fee_adm_subsidi='"+fee_adm_subsidi+"', "+
			"total_fee_adm='"+total_fee_adm+"', nasabah_kotran_ori='"+nasabah_kotran_ori+"', subsidi_kotran_ori='"+subsidi_kotran_ori+"', total_kotran_ori='"+total_kotran_ori+"', "+
			"nasabah_kotran_rev='"+nasabah_kotran_rev+"', subsidi_kotran_rev='"+subsidi_kotran_rev+"', total_kotran_rev='"+total_kotran_rev+"', account_admin='"+account_admin+"', "+
			"account_subsidi_bank='"+account_subsidi_bank+"', rek_number_penampung='"+rek_number_penampung+"', updated_at='"+updated_at+"' WHERE id='"+ id +"'");
		})
		.then(result => {			
			if (open_account.length > 0){
				// delete data
				sql.query("DELETE FROM webadmin.campaign_online_boarding WHERE campaign_header='"+id+"'")
				.then(x =>{
					for (let i = 0; i < open_account.length; i++) {
						sql.query("INSERT INTO webadmin.campaign_online_boarding"+
							"(campaign_header, open_account, plan_code, plan_desc, durations, min_trx, max_trx, qty_trx, ib, mb, ibb, updated_at)"+
							"VALUES('"+id+"','"+open_account[i]+"','"+plan_code[i]+"','"+plan_desc[i]+"','"+durations[i]+"','"+min_trx[i]+"','"+max_trx[i]+"','"+qty_trx[i]+"','"+ib[i]+"','"+mb[i]+"','"+ibb[i]+"','"+updated_at+"' )");
					}
				});
			}

			if(start_range_saldo_aum.length > 0 ){
				// delete data
				sql.query("DELETE FROM webadmin.campaign_by_total_aum WHERE campaign_header='"+id+"'")
				.then(z => {
					for (let x = 0; x < start_range_saldo_aum.length; x++){
						sql.query("INSERT INTO webadmin.campaign_by_total_aum"+
							"(campaign_header, start_range_saldo_aum, end_range_saldo_aum, min_trx_aum, max_trx_aum, qty_trx_aum, ib, mb, ibb, updated_at)"+
							"VALUES('"+id+"','"+start_range_saldo_aum[x]+"','"+end_range_saldo_aum[x]+"','"+min_trx_aum[x]+"','"+max_trx_aum[x]+"','"+qty_trx_aum[x]+"','"+ib_aum[x]+"','"+mb_aum[x]+"','"+ibb_aum[x]+"','"+updated_at+"')");
					}
				});
			}

			if(open_account_product.length > 0 ){
				// delete data
				sql.query("DELETE FROM webadmin.campaign_by_plan_product WHERE campaign_header='"+id+"'")
				then(i => {
					for (let z = 0; z < open_account_product.length; z++) {
						sql.query("INSERT INTO webadmin.campaign_by_plan_product"+
							"(campaign_header, open_account_product, plan_code_product, plan_desc_product, min_trx_product, max_trx_product, qty_trx_product, ib, mb, ibb, updated_at)"+
							"VALUES('"+id+"','"+open_account_product[z]+"','"+plan_code_product[z]+"','"+plan_desc_product[z]+"','"+min_trx_product[z]+"','"+max_trx_product[z]+"','"+qty_trx_product[z]+"','"+ib_product[z]+"','"+mb_product[z]+"','"+ibb_product[z]+"','"+updated_at+"')");
					}
				});
			}

			// remove localstore
			store.remove('list');

			return res.json({
				'code': 200,
				'label': 'Success',
				'status': 'success',
				'message': 'Campaign has been updated'
			})
		})
		.catch(err => {
			logger.error(err);
		})		
	} catch (error) {
		logger.error(error);
	}
};

exports.deleteCampaign = async (req, res, next) => {
	const id = req.params.id;

	try {
		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 7, 7, 'Delete Campaign');

		await sql.connect(dbConfig.dbConnection())
			.then(user => {
				sql.query("DELETE FROM webadmin.campaign where id='" + id + "'")
					.then(result => {
						// detail detail campaign
						sql.query("DELETE FROM webadmin.campaign_by_plan_product WHERE campaign_header='"+id+"'")
						.then(detail => {
							sql.query("DELETE FROM webadmin.campaign_by_total_aum WHERE campaign_header='"+id+"'")
							.then(res => {
								sql.query("DELETE FROM webadmin.campaign_online_boarding WHERE campaign_header='"+id+"'")
							});
						})
					})
					.then(result => {
						res.json({
							'code': 200,
							'status': 'success',
							'message': 'Delete Successfully'
						});
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

exports.reloadCampaign = async (req, res, next) => {
	const group_trx = req.body.group_trx;
	const transaction = req.body.transaction;

	if (group_trx === '' && transaction === '') {
		return res.json({
			'code': 500,
			'status': 'error',
			'message': 'data is required if you want to reload data'
		})
	}

	try {
		await sql.connect(dbConfig.dbConnection())
			.then(query => {
				sql.query("SELECT * FROM webadmin.campaign AS c WHERE c.group_trx='"+group_trx+"' AND c.transactions='"+transaction+"' AND c.status=1 ORDER BY c.created_at DESC")
					.then(results => {
						if (results.recordset.length === 0) {
							return res.json({
								'code': 500,
								'status': 'error',
								'message': 'Data has not found',
							})
						}
						return res.json({
							'code': 200,
							'status': 'success',
							'message': results.recordset[0],
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

exports.viewCampaign = async (req, res, next) => {
	const id = req.params.id;
	const prev = await getPrevillage(req.session.user.role_id);
	const purchase = await getPurchaseBill();
	const transfer_dana = await getTransferDana();
	const inquiry = await getInquiry();
	const plan_product = await getPlanProduct();
	const campaign_on_bording = await getDetailCampaignOnBoarding(id);
	const campaign_aum = await getDetailCampaignByAum(id);
	const campaign_plan_product = await getDetailCampaignByPlanProduct(id);

	try {
		if (prev.includes(16)) {
			// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 6, 12, 'Update Campaign');
  
		await sql.connect(dbConfig.dbConnection())
			.then(query => {		
				sql.query("SELECT * FROM webadmin.campaign AS p WHERE p.id='"+id+"'")
				.then(result => {
					res.render('campaign/view_campaign', {
						isAuthenticated: req.session.isLoggedIn,
						sessionUser: req.session.user,
						purchase: purchase,
						transfer_dana: transfer_dana,
						inquiry: inquiry,
						plan_product: plan_product,
						previllage: prev,
						data: result.recordset[0],
						cob: campaign_on_bording,
						caum: campaign_aum,
						cpp: campaign_plan_product,
						moment: moment,
						path: 'campaign',
						subpath: 'campaign'
					});
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
}

exports.submitCampaign = async (req, res, next) => {
	if (typeof req.query.ids === 'undefined') {
		return res.json({
			'code': 500,
			'status': 'error',
			'message': 'Pleaase select the data'
		})
	}

	let ids = req.query.ids.map(i => Number(i));

	// Status
	// 1 Draf
	// 2 Submit
	// 3 Approve
	// 4 Reject
	const status = 2;

	try {
		// send to audit trails
		trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 8, 10, 'Submit Campaign');

		await sql.connect(dbConfig.dbConnection())
			.then(query => {
				// check status 
				sql.query("SELECT c.status FROM webadmin.campaign AS c WHERE c.id IN (" + ids + ")")
					.then(data => {
						const datas = data.recordset;

						// return when status === Approve
						if (datas.some(e => e.status === 3)) {
							return res.json({
								'code': 500,
								'status': 'error',
								'message': 'There are Approved data, please check the status if you want to Submit/Approve/Reject'
							})
						}

						// update
						sql.query("UPDATE webadmin.campaign SET status='" + status + "'  WHERE id IN (" + ids + ")")
							.then(results => {
								return res.json({
									'code': 200,
									'status': 'success',
									'message': 'Submitted data successfully'
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

exports.approveCampaign = async (req, res, next) => {
	if (typeof req.query.ids === 'undefined') {
		return res.json({
			'code': 500,
			'status': 'error',
			'message': 'Please select the data'
		})
	}

	let ids = req.query.ids.map(i => Number(i));

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
				sql.query("SELECT c.status FROM webadmin.campaign AS c WHERE c.id IN (" + ids + ")")
					.then(data => {
						const datas = data.recordset;

						if (datas.some(e => e.status === 1)) {
							return res.json({
								'code': 500,
								'status': 'error',
								'message': 'There are Draft data, please check the status if you want to Approve'
							})
						}

						if (datas.some(e => e.status === 4)) {
							return res.json({
								'code': 500,
								'status': 'error',
								'message': 'There are Rejected data, please check the status if you want to Approve'
							})
						}

						if (datas.some(e => e.status === 3)) {
							return res.json({
								'code': 500,
								'status': 'error',
								'message': 'There are Approved data, please check the status if you want to Approve'
							})
						}

						sql.query("UPDATE webadmin.campaign SET status='" + status + "', approval_id='" + approver_id + "', approval_date='" + approval_date + "'  WHERE id IN (" + ids + ")")
							.then(results => {
								return res.json({
									'code': 200,
									'status': 'success',
									'message': 'Approved data successfully'
								});
							});
					});
			});
	} catch (error) {
		logger.error(error);
	}
}

exports.rejectCampaign = async (req, res, next) => {
	if (typeof req.query.ids === 'undefined') {
		return res.json({
			'code': 500,
			'status': 'error',
			'message': 'Please select the data'
		})
	}

	let ids = req.query.ids.map(i => Number(i));

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
				sql.query("SELECT c.status FROM webadmin.campaign AS c WHERE c.id IN (" + ids + ")")
					.then(data => {
						const datas = data.recordset;

						if (datas.some(e => e.status === 1)) {
							return res.json({
								'code': 500,
								'status': 'error',
								'message': 'There are Draft data, please check the status if you want to Reject'
							})
						}

						if (datas.some(e => e.status === 3)) {
							return res.json({
								'code': 500,
								'status': 'error',
								'message': 'There are Approved data, please check the status if you want to Reject'
							})
						}

						sql.query("UPDATE webadmin.campaign SET status='" + status + "' WHERE id IN (" + ids + ")")
							.then(results => {
								return res.json({
									'code': 200,
									'status': 'success',
									'message': 'Rejected data successfully'
								})
							})
					})
			});
	} catch (error) {
		logger.error(error);
	}
}
//
exports.selectMaster = async (req, res, next) => {
	const id = req.params.id;

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			return sql.query("SELECT pp.plan_code FROM webadmin.plan_product pp WHERE pp.id='"+id+"'");
		})
		.then(result => {
			return res.json({
				'code': 200,
				'data': result.recordset[0].plan_code
			})
		})
		.catch(err => {
			logger.error(err);
		})
	} catch (error) {
		logger.error(error);
	}
}