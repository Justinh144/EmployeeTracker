const connection = require('./config/connection');
const inquirer = require('inquirer');
const cTable = require('console.table');
const chalk = require('chalk');
const figlet = require('figlet');
const validate = require('./javascript/validate');

// Connects to Database
connection.connect((error) => {
  if (error) throw error;
  console.log(chalk.red.bold(`....................................................................................`));
  console.log(``);
  console.log(chalk.red.bold(figlet.textSync('Secret Government Database')));
  console.log(``);
  console.log(`                                                          ` + chalk.red.bold(''));
  console.log(``);
  console.log(chalk.red.bold(`....................................................................................`));
  promptUser();
});

// Prompt User for Choices
const promptUser = () => {
  inquirer.prompt([
      {
        name: 'choices',
        type: 'list',
        message: 'Please select an option:',
        choices: [
          'View Employees',
          'View Roles',
          'View Departments',
          'View Employees By Department',
          'View Department Budgets',
          'Update Employee Role',
          'Update Employee Manager',
          'Add Employee',
          'Add Role',
          'Add Department',
          'Remove Employee',
          'Remove Role',
          'Remove Department',
          'Exit'
          ]
      }
    ])
    .then((answers) => {
      const {choices} = answers;

        if (choices === 'View Employees') {
            listEmployees();
        }

        if (choices === 'View Departments') {
          listDepartments();
      }

        if (choices === 'View Employees By Department') {
            listEmployeesByDepartment();
        }

        if (choices === 'Add Employee') {
            addEmp();
        }

        if (choices === 'Remove Employee') {
            removeEmp();
        }

        if (choices === 'Update Employee Role') {
            updateEmployeeRole();
        }

        if (choices === 'Update Employee Manager') {
            updateEmpMngmt();
        }

        if (choices === 'View Roles') {
            viewAllRoles();
        }

        if (choices === 'Add Role') {
            addRole();
        }

        if (choices === 'Remove Role') {
            removeRole();
        }

        if (choices === 'Add Department') {
            addDepartment();
        }

        if (choices === 'View Department Budgets') {
            viewDepartmentBudget();
        }

        if (choices === 'Remove Department') {
            removeDepartment();
        }

        if (choices === 'Exit') {
            connection.end();
        }
       
  });
};

// ----------------------------------------------------- VIEW -----------------------------------------------------------------------

// View All Employees
const listEmployees = async () => {
    try {
  let sql =       `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name, 
                  role.title, 
                  department.department_name AS 'department', 
                  role.salary
                  FROM employee, role, department 
                  WHERE department.id = role.department_id 
                  AND role.id = employee.role_id
                  ORDER BY employee.id ASC`;

//   connection.promise().query(sql, (error, response) => {
    const [rows, fields] = await connection.promise().query(sql);
    console.log(chalk.red.bold(`....................................................................................`));
    console.log(`                              ` + chalk.red.bold(`Current Employees:`));
    console.log(chalk.red.bold(`....................................................................................`));
    console.table(rows);
    console.log(chalk.red.bold(`....................................................................................`));
    promptUser();
  } catch (error) {
    console.error(error);
  }
};

// View all Roles
const viewAllRoles = async () => {
    try {  
  const sql =     `SELECT role.id, role.title, department.department_name AS department
                  FROM role
                  INNER JOIN department ON role.department_id = department.id`;
//   connection.promise().query(sql, (error, response) => {
    const [fields] = await connection.promise().query(sql);
    // response.forEach((role) => {console.log(role.title);});
    console.log(chalk.red.bold(`....................................................................................`));
    console.log(`                              ` + chalk.red.bold(`Current Employee Roles:`));
    console.log(chalk.red.bold(`....................................................................................`));
    //   response.forEach((role) => {console.log(role.title);});
     
     fields.forEach((role) => {
        console.log(role.title);
        });
    console.log(chalk.red.bold(`....................................................................................`));
      promptUser();
  } catch (error) {
    console.error(error);
  }
};

// View all Departments
const listDepartments = async () => {
    try {
  const sql =   `SELECT department.id AS id, department.department_name AS department FROM department`; 
//   connection.promise().query(sql, (error, response) => {
    const [rows, fields] = await connection.promise().query(sql);

    console.log(chalk.red.bold(`....................................................................................`));
    console.log(`                              ` + chalk.red.bold(`Departments:`));
    console.log(chalk.red.bold(`....................................................................................`));
    console.table(rows);
    console.log(chalk.red.bold(`....................................................................................`));
    
    promptUser();
  } catch (error) {
    console.error(error);
  };
};

// View all Employees by Department
const listEmployeesByDepartment = async () => {
  const sql =     `SELECT employee.first_name, 
                  employee.last_name, 
                  department.department_name AS department
                  FROM employee 
                  LEFT JOIN role ON employee.role_id = role.id 
                  LEFT JOIN department ON role.department_id = department.id`;
  connection.query(sql, (error, response) => {
    if (error) throw error;
      console.log(chalk.red.bold(`....................................................................................`));
      console.log(`                              ` + chalk.red.bold(`Employees per Department:`));
      console.log(chalk.red.bold(`....................................................................................`));
      console.table(response);
      console.log(chalk.red.bold(`....................................................................................`));
      promptUser();
    });
};

//View all Departments by Budget
const viewDepartmentBudget = () => {
  console.log(chalk.red.bold(`....................................................................................`));
  console.log(`                              ` + chalk.red.bold(`Budget By Department:`));
  console.log(chalk.red.bold(`....................................................................................`));
  const sql =     `SELECT department_id AS id, 
                  department.department_name AS department,
                  SUM(salary) AS budget
                  FROM  role  
                  INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
  connection.query(sql, (error, response) => {
    if (error) throw error;
      console.table(response);
  console.log(chalk.red.bold(`.................................................................................... `));
      promptUser();
  });
};
                     
// Add a New Employee
const addEmp = async () => {
  try {
    // Prompt for employee's first and last name
    const employeeInfo = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "What is the employee's first name?",
        validate: (input) => (input ? true : 'Please enter a first name'),
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
        validate: (input) => (input ? true : 'Please enter a last name'),
      },
    ]);

    // Fetch roles from the database
    const [roleRows] = await connection.promise().query('SELECT role.id, role.title FROM role');
    const roles = roleRows.map(({ id, title }) => ({ name: title, value: id }));

    // Prompt for the employee's role
    const { role } = await inquirer.prompt([
      {
        type: 'list',
        name: 'role',
        message: "Employee Role:",
        choices: roles,
      },
    ]);

    // Fetch managers from the database
    const [managerRows] = await connection.promise().query('SELECT * FROM employee');
    const managers = managerRows.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));

    // Prompt for the employee's manager
    const { manager } = await inquirer.prompt([
      {
        type: 'list',
        name: 'manager',
        message: "Employee's Manager",
        choices: managers,
      },
    ]);

    // Insert employee information into the database
    await connection.promise().query(
      'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
      [employeeInfo.firstName, employeeInfo.lastName, role, manager]
    );

    console.log('Employee has been added!');
    listEmployees();
  } catch (error) {
    console.error(error);
  }
};
      
const addRole = async () => {
    try {
      const [response] = await connection.promise().query('SELECT * FROM department');
  
      let deptNamesArray = response.map((department) => department.department_name);
      deptNamesArray.push('Create Department');
  
      const answer = await inquirer.prompt([
        {
          name: 'departmentName',
          type: 'list',
          message: 'Which department is this new role in?',
          choices: deptNamesArray,
        },
      ]);
  
      if (answer.departmentName === 'Create Department:') {
        await addDepartment();
      } else {
        await addRoleResume(answer);
      }
    } catch (error) {
      console.error(error);
    }
};
  
const addRoleResume = async (departmentData) => {
    try {
      const answer = await inquirer.prompt([
        {
          name: 'newRole',
          type: 'input',
          message: 'Name your role:',
          validate: validate.validateString,
        },
        {
          name: 'salary',
          type: 'input',
          message: 'Salary for this role:',
          validate: validate.validateSalary,
        },
      ]);
  
      let createdRole = answer.newRole;
      let departmentId = departmentData.departmentName;
  
      // Find the department ID based on the name
      const [departmentResponse] = await connection
        .promise()
        .query('SELECT id FROM department WHERE department_name = ?', [departmentId]);
  
      let sql = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
      let crit = [createdRole, answer.salary, departmentResponse[0].id];
  
      await connection.promise().query(sql, crit);
  
      console.log(chalk.red.bold(`....................................................................................`));
      console.log(chalk.red.bold(`New Role Created!`));
      console.log(chalk.red.bold(`....................................................................................`));
      await viewAllRoles();
    } catch (error) {
      console.error(error);
    }
};
      

// Add a New Department
const addDepartment = () => {
    inquirer
      .prompt([
        {
          name: 'newDepartment',
          type: 'input',
          message: 'What is the name of your new Department?',
          validate: validate.validateString
        }
      ])
      .then((answer) => {
        let sql =     `INSERT INTO department (department_name) VALUES (?)`;
        connection.query(sql, answer.newDepartment, (error, response) => {
          if (error) throw error;
          console.log(``);
          console.log(chalk.red(answer.newDepartment + ` Department successfully created!`));
          console.log(``);
          listDepartments();
        });
      });
};

// ------------------------------------------------- UPDATE -------------------------------------------------------------------------

// Update an Employee's Role
const updateEmployeeRole = async () => {
    try {
      const sqlEmployee = `
        SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
        FROM employee, role, department
        WHERE department.id = role.department_id AND role.id = employee.role_id`;
  
      const [employeeResponse] = await connection.promise().query(sqlEmployee);
  
      let employeeNamesArray = employeeResponse.map((employee) => `${employee.first_name} ${employee.last_name}`);
  
      const sqlRoles = 'SELECT role.id, role.title FROM role';
      const [rolesResponse] = await connection.promise().query(sqlRoles);
  
      let rolesArray = rolesResponse.map((role) => role.title);
  
      const answer = await inquirer.prompt([
        {
          name: 'chosenEmployee',
          type: 'list',
          message: 'Which employee has a new role?',
          choices: employeeNamesArray,
        },
        {
          name: 'chosenRole',
          type: 'list',
          message: 'What is their new role?',
          choices: rolesArray,
        },
      ]);
  
      let newTitleId, employeeId;
  
      rolesResponse.forEach((role) => {
        if (answer.chosenRole === role.title) {
          newTitleId = role.id;
        }
      });
  
      employeeResponse.forEach((employee) => {
        if (answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`) {
          employeeId = employee.id;
        }
      });
  
      const sqlUpdate = 'UPDATE employee SET employee.role_id = ? WHERE employee.id = ?';
      await connection.promise().query(sqlUpdate, [newTitleId, employeeId]);
  
      console.log(chalk.red.bold(`....................................................................................`));
      console.log(chalk.red(`Employee Role Updated`));
      console.log(chalk.red.bold(`....................................................................................`));
      promptUser();
    } catch (error) {
      console.error(error);
    }
};
  

// Update an Employee's Manager
const updateEmpMngmt = async () => {
    try {
      const sql = `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id FROM employee`;
      const [response] = await connection.promise().query(sql);
  
      let employeeNamesArray = response.map((employee) => `${employee.first_name} ${employee.last_name}`);
  
      const answer = await inquirer.prompt([
        {
          name: 'chosenEmployee',
          type: 'list',
          message: 'Which employee has a new manager?',
          choices: employeeNamesArray,
        },
        {
          name: 'newManager',
          type: 'list',
          message: 'Who is their manager?',
          choices: employeeNamesArray,
        },
      ]);
  
      let employeeId, managerId;
  
      response.forEach((employee) => {
        if (answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`) {
          employeeId = employee.id;
        }
  
        if (answer.newManager === `${employee.first_name} ${employee.last_name}`) {
          managerId = employee.id;
        }
      });
  
      if (validate.isSame(answer.chosenEmployee, answer.newManager)) {
        console.log(chalk.redBright.bold(`....................................................................................`));
        console.log(chalk.redBright(`Invalid Manager Selection`));
        console.log(chalk.redBright.bold(`....................................................................................`));
        promptUser();
      } else {
        const updateSql = 'UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?';
        await connection.promise().query(updateSql, [managerId, employeeId]);
  
        console.log(chalk.red.bold(`...................................................................................`));
        console.log(chalk.red(`Employee Manager Updated`));
        console.log(chalk.red.bold(`...................................................................................`));
        promptUser();
      }
    } catch (error) {
      console.error(error);
    }
};

// -------------------------------------- REMOVE --------------------------------------------------------

// Delete an Employee
const removeEmp = async () => {
    try {
        const [response] = await connection.promise().query('SELECT employee.id, employee.first_name, employee.last_name FROM employee');
        
        const employeeNamesArray = response.map((employee) => `${employee.first_name} ${employee.last_name}`);

        const answer = await inquirer.prompt([
            {
                name: 'chosenEmployee',
                type: 'list',
                message: 'Which employee would you like to remove?',
                choices: employeeNamesArray,
            },
        ]);

        const chosenEmployee = answer.chosenEmployee;

        const employeeId = response.find((employee) => `${employee.first_name} ${employee.last_name}` === chosenEmployee)?.id;

        if (!employeeId) {
            console.log('Invalid employee selection.');
            return;
        }

        await connection.promise().query('DELETE FROM employee WHERE employee.id = ?', [employeeId]);

        console.log(chalk.redBright.bold(`....................................................................................`));
        console.log(chalk.redBright(`Employee Successfully Removed`));
        console.log(chalk.redBright.bold(`....................................................................................`));

        await listEmployees();
    } catch (error) {
        console.error(error);
    }
};

// Delete a Role
const removeRole = async () => {
    try {
        const [response] = await connection.promise().query('SELECT role.id, role.title FROM role');
        
        const roleNamesArray = response.map((role) => role.title);

        const answer = await inquirer.prompt([
            {
                name: 'chosenRole',
                type: 'list',
                message: 'Which role would you like to remove?',
                choices: roleNamesArray,
            },
        ]);

        const chosenRole = answer.chosenRole;

        const roleId = response.find((role) => role.title === chosenRole)?.id;

        if (!roleId) {
            console.log('Invalid role selection.');
            return;
        }

        await connection.promise().query('DELETE FROM role WHERE role.id = ?', [roleId]);

        console.log(chalk.redBright.bold(`....................................................................................`));
        console.log(chalk.red(`Role Successfully Removed`));
        console.log(chalk.redBright.bold(`....................................................................................`));

        await viewAllRoles();
    } catch (error) {
        console.error(error);
    }
};

// Delete a Department
const removeDepartment = async () => {
    try {
        const [response] = await connection.promise().query('SELECT department.id, department.department_name FROM department');

        const departmentNamesArray = response.map((department) => department.department_name);

        const answer = await inquirer.prompt([
            {
                name: 'chosenDept',
                type: 'list',
                message: 'Which department would you like to remove?',
                choices: departmentNamesArray,
            },
        ]);

        const chosenDept = answer.chosenDept;

        const departmentId = response.find((department) => department.department_name === chosenDept)?.id;

        if (!departmentId) {
            console.log('Invalid department selection.');
            return;
        }

        await connection.promise().query('DELETE FROM department WHERE department.id = ?', [departmentId]);

        console.log(chalk.redBright.bold(`....................................................................................`));
        console.log(chalk.redBright(`Department Successfully Removed`));
        console.log(chalk.redBright.bold(`....................................................................................`));

        await listDepartments();
    } catch (error) {
        console.error(error);
    }
};
