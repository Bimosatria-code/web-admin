'use strict'

const sql = require('mssql');
const dbConfig  = require('../utils/database');
const logger = require('../utils/logger');
const moment = require('moment');
const excel = require("exceljs");
const fs = require('fs');

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

async function getModules(){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT id, name FROM webadmin.m_module" ,function(err, results){
			resolve(results.recordset);
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

async function getActions(){
	try {
	  return new Promise((resolve,reject)=>{
		sql.connect(dbConfig.dbConnection())
		.then(query => {
		  sql.query("SELECT id, name FROM webadmin.m_actions" ,function(err, results){
				resolve(results.recordset);
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
  const prev = await getPrevillage(req.session.user.role_id);
	const modules = await getModules();
	const actions = await getActions();
	const today = moment().format('YYYY-MM-DD');

	let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  try {
    if (prev.includes(47)) {
			await sql.connect(dbConfig.dbConnection())
			.then(query => {
				return sql.query("SELECT TOP 1000 at.id, m.name AS modules, a.name AS actions, u.name AS users, r.name AS role, at.ip_address, at.object, at.created_at "+
				"FROM webadmin.audit_trails AS at "+
				"LEFT JOIN webadmin.users AS u ON u.id = at.user_id "+
				"LEFT JOIN webadmin.roles AS r ON r.id = at.role_id "+
				"LEFT JOIN webadmin.m_module AS m ON m.id = at.modules "+
				"LEFT JOIN webadmin.m_actions AS a ON a.id = at.actions "+
				"WHERE CAST(at.created_at AS DATE) = '"+today+"'");
			})
			.then(results => {
				res.render('log/audit_trails/index', {
					isAuthenticated: req.session.isLoggedIn,
					sessionUser: req.session.user,
					previllage: prev,
					modules: modules,
					actions: actions,
					data: results.recordset,
					errorMessage: message,
					moment:moment,
					start:'',
					end:'',
					mod:'',
					act:'',
					path: 'log',
					subpath: 'audit'
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

exports.getFilter = async (req, res, next) => {
	const prev = await getPrevillage(req.session.user.role_id);
	const modules = await getModules();
	const actions = await getActions();

	const start = req.body.start;
	const end = req.body.end;
	const mod = req.body.modules;
	const act = req.body.actions;

	const conditions = [];

	if (start.length === 0 && end.length === 0 && mod.length === 0 && act.length === 0) {
		req.flash('error', 'Silahkan pilih salah satu item untuk filter');
		return res.redirect('/log/audit-trails');
	}
	if (start.length !== 0 && end.length !== 0){
		conditions.length ? conditions.push(" AND CAST(at.created_at AS DATE) >= '"+start+"' AND CAST(at.created_at AS DATE) <= '"+end+"'") : conditions.push(" CAST(at.created_at AS DATE) >= '"+start+"' AND CAST(at.created_at AS DATE) <= '"+end+"'");
	}
	if (mod.length !== 0){
		conditions.length ? conditions.push(" AND at.modules = '"+mod+"'") : conditions.push(" at.modules = '"+parseInt(mod)+"'");
	}
	if (act.length !== 0) {
		conditions.length ? conditions.push(" AND at.actions = '"+act+"'") : conditions.push(" at.actions = '"+parseInt(act)+"'");
	}
				
	var q = "SELECT at.id, m.name AS modules, a.name AS actions, u.name AS users, r.name AS role, at.ip_address, at.object, at.created_at "+
		"FROM webadmin.audit_trails AS at "+
		"LEFT JOIN webadmin.users AS u ON u.id = at.user_id "+
		"LEFT JOIN webadmin.roles AS r ON r.id = at.role_id "+
		"LEFT JOIN webadmin.m_module AS m ON m.id = at.modules "+
		"LEFT JOIN webadmin.m_actions AS a ON a.id = at.actions "+
		"WHERE "+ conditions.join(' ');

	try {
		await sql.connect(dbConfig.dbConnection())
		.then(query => {
			sql.query(q)
			.then(results => {
				res.render('log/audit_trails/index', {
					isAuthenticated: req.session.isLoggedIn,
					sessionUser: req.session.user,
					previllage: prev,
					modules: modules,
					actions: actions,
					data: results.recordset,
					errorMessage: '',
					moment:moment,
					start:start,
					end:end,
					mod:mod,
					act:act,
					path: 'log',
					subpath: 'audit'
				});
			})
		})
	} catch (error) {
		
	}
}

async function createExcel(conditions) {
	const today = moment().format('YYYY-MM-DD');

	if(conditions.length === 0){
		var q = "SELECT TOP 1000 at.id, m.name AS modules, a.name AS actions, u.name AS users, r.name AS role, at.ip_address, at.object, at.created_at "+
		"FROM webadmin.audit_trails AS at "+
		"LEFT JOIN webadmin.users AS u ON u.id = at.user_id "+
		"LEFT JOIN webadmin.roles AS r ON r.id = at.role_id "+
		"LEFT JOIN webadmin.m_module AS m ON m.id = at.modules "+
		"LEFT JOIN webadmin.m_actions AS a ON a.id = at.actions "+
		"WHERE CAST(at.created_at AS DATE) = '"+today+"'";
	} else {
		var q = "SELECT at.id, m.name AS modules, a.name AS actions, u.name AS users, r.name AS role, at.ip_address, at.object, at.created_at "+
		"FROM webadmin.audit_trails AS at "+
		"LEFT JOIN webadmin.users AS u ON u.id = at.user_id "+
		"LEFT JOIN webadmin.roles AS r ON r.id = at.role_id "+
		"LEFT JOIN webadmin.m_module AS m ON m.id = at.modules "+
		"LEFT JOIN webadmin.m_actions AS a ON a.id = at.actions "+
		"WHERE " + conditions.join(' ');
	}

	try {
		await sql.connect(dbConfig.dbConnection())
			.then(query => {
				sql.query(q)
					.then(results => {
						let transaksi = [];
						results.recordset.forEach((obj) => {
							transaksi.push({
								modules: obj.modules,
								actions: obj.actions,
								users: obj.users,
								role: obj.role,
								ip_address: obj.ip_address.replace("::ffff:",""),
								object: obj.object,
								created_at: moment(obj.created_at).format('YYYY-MM-DD'),
							});
						});
						let workbook = new excel.Workbook();
						let worksheet = workbook.addWorksheet("Audit Trails");
						worksheet.columns = [{
								header: "Module",
								key: "modules",
								width: 25
							},
							{
								header: "Action",
								key: "actions",
								width: 25
							},
							{
								header: "User",
								key: "users",
								width: 25
							},
							{
								header: "Role",
								key: "role",
								width: 25
							},
							{
								header: "IP Address",
								key: "ip_address",
								width: 25
							},
							{
								header: "Object",
								key: "object",
								width: 25
							},
							{
								header: "Tanggal",
								key: "created_at",
								width: 25
							},
						];
						// Add Array Rows
						worksheet.addRows(transaksi);
						workbook.xlsx.writeFile('audit_trails.xlsx');
					})
			})
	} catch (error) {
		logger.error(error);
	}
}

exports.download = async (req, res, next) => {
	const start = req.query.start;
	const end = req.query.end;
	const mod = req.query.mod;
	const act = req.query.act;

	// send to audit trails
	// trails.trails(req.session.user.id, req.session.user.role_id, req.socket.localAddress, 14, 17, 'Download Excel Log Transaksi');

	const conditions = [];

	if (start.length !== 0 && end.start !== 0) {
		conditions.length ? conditions.push(" AND at.created_at >= '" + start + "' AND at.created_at < '" + end + "'") : conditions.push(" at.created_at >= '" + start + "' AND at.created_at < '" + end + "'");
	}
	if (mod.length !== 0) {
		conditions.length ? conditions.push(" AND at.modules = '" + mod + "'") : conditions.push(" at.modules = '" + mod + "'");
	}
	if (act.length !== 0) {
		conditions.length ? conditions.push(" AND at.actions = '" + act + "'") : conditions.push(" at.actions = '" + act + "'");
	}

	try {
		createExcel(conditions);
		return res.json({
			'code': 200,
		});
	} catch (error) {
		logger.error(error)
	}
}	

exports.getExcel = async (req, res, next) => {
	try {
		
		const file = fs.realpathSync('audit_trails.xlsx');
		res.download(file);
	} catch (error) {
		logger.error(error)
	}
}
