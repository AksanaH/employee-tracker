const express = require('express');
const inquirer = require('inquirer');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'password', // ! Change this to your own password
    database: 'employees_db',
});

async function mainMenu() {
    const departments = await getDepartments();
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'action',
            choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role'],
        },
    ])
        .then((answers) => {
            if (answers.action === 'view all departments') {
                viewAllDepartments();
            }
            else if (answers.action === 'view all roles') {
                viewAllRoles();
            }
            else if (answers.action === 'view all employees') {
                viewAllEmployees();
            }
            else if (answers.action === 'add a department') {
                addDepartment();
            }
            else if (answers.action === 'add a role') {
                addRole(departments);
            }
            else if (answers.action === 'add an employee') {
                addRole(departments);
            }
            else {
                process.exit(0);
            }
        })
}
function addRole(departments) {
    let name;
    let salary;
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the role?',
            name: 'input'
        },
    ]).then((answers) => {
        console.log(answers.input);
        name = answers.input;
        inquirer.prompt([
            {
                type: 'input',
                message: 'What is the salary of the role?',
                name: 'input'
            },
        ]).then((answers) => {

            salary = answers.input;

            console.log(answers.input);
            inquirer.prompt([
                {
                    type: 'list',
                    message: 'Which department does the role belong to?',
                    name: 'type',
                    choices: departments,
                },
            ]).then((answers) => {
                const departmentID = departments.filter(dep => dep.name === answers.type)[0].id;

                pool.query(`INSERT INTO roles(title, salary, department) VALUES($1, $2, $3)`, [name, salary, departmentID], (err, { rows }) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(`Added ${answers.type} to the database`);
                    mainMenu();
                });

            });

        });

    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the department?',
            name: 'input'
        },
    ]).then((answers) => {
        console.log(answers.input);
        pool.query(`INSERT INTO departments(name) VALUES($1)`, [answers.input], (err, { rows }) => {
            if (err) {
                console.log(err);
            }
            console.log(`Added ${answers.input} to the database`);
            mainMenu();
        });

    });
}

function viewAllEmployees() {
    viewAll('employees');
}

function viewAllRoles() {
    viewAll('roles');
}

function viewAllDepartments() {
    viewAll('departments');
}

function viewAll(tableName){
    pool.query(`SELECT * FROM ${tableName}`, function (err, { rows }) {
        console.log(rows);
        mainMenu();
    });
}

async function getDepartments() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM departments', function (err, { rows }) {
            if (err) {
                // Reject the Promise with the error
                reject(err);
            } else {
                // Resolve the Promise with the rows
                resolve(rows);
            }
        });
    });
}
pool.connect();

app.listen(PORT, () => {
    console.log('Hey you did it!');
});
mainMenu();

