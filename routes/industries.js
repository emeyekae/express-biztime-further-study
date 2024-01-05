
const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

router.get('/:code', async (req, res, next) => {
  try {
    const results = await db.query(`
    SELECT i.code, i.industry, c.company 
      FROM industries AS i 
      LEFT JOIN industries_companies AS ic 
      ON i.code = ic.industry_code 
      LEFT JOIN companies2 AS c 
      ON c.code = ic.company_code 
      WHERE i.code = $1`, [req.params.code])
    if (results.rows.length === 0 ) {
      throw new ExpressError(`Cannot find an industry with a code of ${req.params.code}`, 404);
      }
    const {code, industry} = results.rows[0];
    const company = results.rows.map(r => r.company);
    res.send({code,industry,company})
  } catch (e) {
  return next(e);
}
})

  module.exports = router;
