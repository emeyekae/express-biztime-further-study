/** Tests for companies. */

process.env.NODE_ENV = 'test';

const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeEach(async () => {
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM companies`);

  await db.query(`INSERT INTO companies VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),('ibm', 'IBM', 'Big blue.')`);

  await db.query(`INSERT INTO invoices (id,comp_Code, amt, paid, paid_date) VALUES 
        (1,'apple', 100, false, null),
        (2,'apple', 200, false, null),
        (3,'apple', 300, true, '2018-01-01'),
        (4,'ibm', 400, false, null) RETURNING id`);
})

afterAll(async () => {
  await db.end()
})

describe("GET /", function () {

  test("It should respond with array of companies", async function () {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
      "companies": [
        {"code": "apple", "name": "Apple Computer", "description": "Maker of OSX."},
        {"code": "ibm", "name": "IBM", "description": "Big blue."}
      ]
    });
  })

});


describe("GET /apple", function () {

  test("It returns company info", async function () {
    let response = '';
      response = await request(app).get("/companies/apple");
    expect(response.body).toEqual(
        {
          "company":{
            "code":"apple",
            "name":"Apple Computer",
            "description":"Maker of OSX.",
            "invoices": [1,2,3]
          }
        }
    );
  });

  test("It should return 404 for Can't find a company with a code of", async function () {
    const response = await request(app).get("/companies/twitter");
    expect(response.status).toEqual(404);
  })
});


describe("POST /", function () {

  test("It should add company", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "Buba's Barbeque", description: "Buba makes the best viddles!"});

    expect(response.body).toEqual(
        {
          "company": {
            code: "buba's-barbeque",
            name: "Buba's Barbeque",
            description: "Buba makes the best viddles!",
          }
        }
    );
  });

  test("It should return 500 for conflict", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "Apple", description: "WT?"});

    expect(response.status).toEqual(500);
  })
});


describe("PUT /", function () {

  test("It should update company", async function () {
    const response = await request(app)
        .put("/companies/apple")
        .send({name: "AppleEdit", description: "NewDescrip"});

    expect(response.body).toEqual(
        {
          "company": {
            code: "apple",
            name: "AppleEdit",
            description: "NewDescrip",
          }
        }
    );
  });

  test("It should return 404 for no-such-comp", async function () {
    const response = await request(app)
        .put("/companies/")
        .send({name: "simmer"});

    expect(response.status).toEqual(404);
  });

  test("It should return 500 for missing data", async function () {
    const response = await request(app)
        .put("/companies/apple")
        .send({});

    expect(response.status).toEqual(500);
  })
});


describe("DELETE /", function () {

  test("It should delete company", async function () {
    const response = await request(app)
        .delete("/companies/apple");

    expect(response.body).toEqual({"status": "deleted"});
  });

  test("It should return 404 for no-such-comp", async function () {
    const response = await request(app)
        .delete("/companies/sloppies");

    expect(response.status).toEqual(404);
  });
});

